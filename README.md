<div align="center">
	<img src="src/assets/logo_melomini.png" alt="logo_melomini" style="width:20%;" />
</div>


<h1 align="center">Vue3 h5 template</h1>

**🌱 基于 Vue3 全家桶、JavaScript、Vite 构建工具，开箱即用的移动端项目基础模板**

- [x] ⚡ Vue3 + Vite5
- [x] ✨ Vant4 组件库
- [x] 🌀 Tailwindcss 原子类框架
- [x] 🍍 Pinia 状态管理
- [x] 🌓 支持深色模式
- [x] Vue-router 4
- [x] 支持 SVG 图标自动注册组件
- [x] vmin 视口适配
- [x] Axios 封装（Token 注入、401 处理）
- [x] 登录鉴权 + 路由守卫
- [x] 打包资源 gzip 压缩
- [x] 开发环境支持 Mock 数据
- [x] 首屏加载动画
- [x] 开发环境调试面板
- [x] 生产环境 CDN 依赖


## 运行项目

要求 Node 版本 18+，推荐使用 pnpm。

```shell
# 安装依赖
pnpm install

# 复制环境变量（按需修改）
cp .env.example .env.development

# 启动服务
pnpm dev

# 打包
pnpm build
```

## 环境变量

参考根目录 `.env.example`，常用变量说明：

| 变量 | 说明 |
| --- | --- |
| `VITE_BASE_API` | 接口基础路径，开发环境 mock 一般为 `/dev-api` |
| `VITE_BASE_URL` | 应用部署 base 路径，对应 `vite.config.js` 的 `base` |
| `VITE_ENABLE_ERUDA` | 开发环境是否启用 Eruda 调试面板 |
| `VITE_CDN_DEPS` | 生产环境是否通过 CDN 加载依赖 |
| `VITE_UPLOAD_URL` | 图片上传接口，留空则仅本地预览 |

## 登录鉴权

- 未登录访问受保护页面会跳转 `/login`，登录成功后回到原目标页
- Token 持久化在 `localStorage`，请求头自动携带 `Authorization: Bearer <token>`
- 401 或业务码 `401` 会清除登录态并跳转登录页
- 开发环境登录走 `mock/auth.mock.js`，任意账号密码均可

相关文件：

- `src/store/modules/user.js` — 用户状态与登录/退出
- `src/router/permission.js` — 路由守卫
- `src/utils/http/index.js` — Axios 拦截器
- `src/api/auth/index.js` — 登录接口


## 文档引导

> - [登录鉴权](#auth)
> - [环境变量](#env)
> - [按需引入 vant 组件](#vant)
> - [SVG 图标使用](#svg)
> - [路由缓存 & 命名注意 ⚠](#router)
> - [调试面板 eruda](#console)
> - [动态设置页面标题](#page-title)
> - [vw 视口适配](#viewport)
> - [Tailwindcss 原子类框架](#tailwindcss)
> - [CDN 加载依赖](#CDN)



### - <span id="auth">登录鉴权</span>

路由守卫在 `src/router/permission.js`，白名单路由（无需登录）在 `src/constants/route.js` 配置。

登录页提交后调用 `useUserStoreHook().login()`，Token 写入 `localStorage` 并在 HTTP 请求中自动携带。

### - <span id="env">环境变量</span>

复制 `.env.example` 为 `.env.development` / `.env.production` 后按需修改，详见上文「环境变量」表格。

### - <span id="vant">按需引入 vant 组件</span>

全量引入组件库太过臃肿，项目中使用 `unplugin-vue-components` 插件进行按需自动引入组件，可通过[官方文档](https://vant-ui.github.io/vant/#/zh-CN/quickstart#2.-pei-zhi-cha-jian)了解更多。



### - <span id="svg">SVG 图标使用</span>


> 1. 将 svg 图标文件放在 `src/icons/svg` 目录下
> 2. 在项目中直接使用 `<svg-icon name="svg图标文件命名" />` 即可

例如：

本项目 `src/icons/svg` 中放了个叫 `check-in.svg` 的图标文件，然后在组件 `name` 属性中填入文件的命名即可，So easy~


```Vue
<svg-icon name="check-in" />
```

> 项目中使用了 `unplugin-vue-components` 自动引入组件，所以 `main.js` 中无需注册全局图标组件。



### - <span id="router">路由缓存 & 命名注意 ⚠</span>

组件默认开启缓存，如某个组件需关闭缓存，在对应路由 `meta` 内的 `noCache` 字段赋值为 `true` 即可。

```javascript
// src/router/routes.js
const routes = [
    // ...
    {
        path: "about",
        name: "About",
        component: () => import("@/views/about/index.vue"),
        meta: {
            title: "关于",
            noCache: true
        }
    }
];
```

 为了保证页面能被正确缓存，请确保**组件**的 `name` 值和对应路由的 `name` 命名完全相同。

```vue
<!-- src/views/about/index.vue -->
<script setup name="About">
	// 使用了 `vite-plugin-vue-setup-extend` 插件，可在 `setup` 语法糖标签上添加 `name` 属性为组件命名
</script>

<template>
  <div>about</div>
</template>
```



### - <span id="console">调试面板 eruda</span>

为了方便移动端查看 log 信息和调试，开发环境引入了 eruda 调试面板的 cdn。如果你的开发环境不需要的话请在 `.env.development` 中修改值

```html
# .env.development

# 开发环境启用 cdn eruda 调试工具。若不启用，将 true 修改为 false 或其他任意值即可
VITE_ENABLE_ERUDA = "true"
```



### - <span id="page-title">动态设置页面标题</span>

在路由守卫 `src/router/permission.js` 中统一处理：

```js
// src/router/permission.js
setPageTitle(to.meta.title);
```

具体实现见 `src/utils/set-page-title.js`。



### - <span id="mock">开发环境 Mock</span>

> 本项目开发环境支持 mock 请求数据，在 `mock` 目录中可配置接口和数据，具体见[文档](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/blob/main/README.zh-CN.md)。



### - <span id="viewport">vw 视口适配</span>

使用 `cnjm-postcss-px-to-viewport` 进行视口适配，相关配置见项目根目录下 `postcss.config.js`。

```js
// postcss.config.js
module.exports = {
  plugins: {
    // 使用 cnjm-postcss-px-to-viewport 规避 postcss.plugin was deprecated 警告
    "cnjm-postcss-px-to-viewport": {
      viewportWidth: 375, // 根据设计稿设定
      minPixelValue: 1, // 最小的转换数值
      unitPrecision: 2 // 转化精度，转换后保留位数
    },
    autoprefixer: {
      overrideBrowserslist: ["Android >= 4.0", "iOS >= 7"]
    }
  }
};
```



### - <span id="tailwindcss">Tailwindcss 原子类框架</span>

Tailwindcss 从 3.0 版本开始默认使用 `JIT` 模式，打包代码不再臃肿，结合 `vite` 使用非常香~ 如果你还没使用过类似的框架，Tailwindcss 首页的[示例](https://tailwindcss.com/)非常直观。

官方文档：https://tailwindcss.com/docs/padding



### - <span id="CDN">CDN 生产环境依赖</span>

本模板生产环境默认不开启 CDN 加载依赖，如需开启生产环境加载 CDN 依赖，在根目录生产环境变量文件 `.env.production` 中修改 `VITE_CDN_DEPS` 的值为 `true` 重新打包即可。




## 鸣谢

 [vue-element-admin](https://github.com/PanJiaChen/vue-element-admin) 

 [vant-demo](https://github.com/youzan/vant-demo) 

 [vue-pure-admin](https://github.com/xiaoxian521/vue-pure-admin)

 [vue-vben-admin](https://github.com/vbenjs/vue-vben-admin)