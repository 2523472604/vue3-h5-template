import { fileURLToPath, URL } from "node:url";
import vueSetupExtend from "vite-plugin-vue-setup-extend";
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import Components from "unplugin-vue-components/vite";
import { VantResolver } from "@vant/auto-import-resolver";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";
import path from "path";
import mockDevServerPlugin from "vite-plugin-mock-dev-server";
import viteCompression from "vite-plugin-compression";
import { createHtmlPlugin } from "vite-plugin-html";
import { visualizer } from "rollup-plugin-visualizer";
import { enableCDN } from "./build/cdn";
import { manualChunks } from "./build/manual-chunks";

// 当前工作目录路径
const root = process.cwd();

function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 环境变量
  const env = loadEnv(mode, root, "");
  const apiPrefix = (env.VITE_BASE_API || "/dev-api").replace(/\/$/, "") || "/dev-api";
  const proxyTarget = (env.VITE_PROXY_TARGET || "").trim();

  return {
    base: env.VITE_BASE_URL || "/",
    plugins: [
      vue(),
      vueJsx(),
      Components({
        resolvers: [VantResolver()]
      }),
      // 允许 setup 语法糖上添加组件名属性
      vueSetupExtend(),
      // svg icon
      createSvgIconsPlugin({
        // 指定图标文件夹
        iconDirs: [path.resolve(root, "src/icons/svg")],
        // 指定 symbolId 格式
        symbolId: "icon-[dir]-[name]"
      }),
      mockDevServerPlugin(),
      // 生产环境 gzip 压缩资源
      viteCompression(),
      // 注入模板数据
      createHtmlPlugin({
        inject: {
          data: {
            ENABLE_ERUDA: env.VITE_ENABLE_ERUDA || "false"
          }
        }
      }),
      // 生产环境默认不启用 CDN 加速
      enableCDN(env.VITE_CDN_DEPS),
      // 打包体积分析：pnpm build:analyze
      mode === "analyze" &&
        visualizer({
          open: true,
          gzipSize: true,
          brotliSize: true,
          filename: "dist/stats.html"
        })
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url))
      }
    },
    server: {
      host: true,
      // proxy 前缀须与 VITE_BASE_API 一致；target 留空时由 mock-dev-server 拦截
      // 联调真实后端：在 .env.development 配置 VITE_PROXY_TARGET=http://127.0.0.1:8080
      // doc: https://github.com/pengzhanbo/vite-plugin-mock-dev-server
      proxy: {
        [`^${escapeRegExp(apiPrefix)}`]: {
          target: proxyTarget || "",
          changeOrigin: Boolean(proxyTarget),
          ...(proxyTarget
            ? {
                rewrite: path =>
                  path.replace(new RegExp(`^${escapeRegExp(apiPrefix)}`), "")
              }
            : {})
        }
      }
    },
    build: {
      rollupOptions: {
        output: {
          chunkFileNames: "static/js/[name]-[hash].js",
          entryFileNames: "static/js/[name]-[hash].js",
          assetFileNames: "static/[ext]/[name]-[hash].[ext]",
          manualChunks
        }
      }
    }
  };
});
