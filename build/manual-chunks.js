/**
 * Rollup manualChunks：拆分 vendor，避免单 chunk 过大
 */
export function manualChunks(id) {
  if (!id.includes("node_modules")) return;

  if (id.includes("@vant/area-data")) {
    return "vant-area-data";
  }

  if (id.includes("pdfjs-dist")) {
    return "pdfjs";
  }

  if (id.includes("vant") || id.includes("@vant")) {
    return "vant-vendor";
  }

  if (id.includes("vue-router")) {
    return "vue-router-vendor";
  }

  if (id.includes("pinia")) {
    return "pinia-vendor";
  }

  if (id.includes("axios") || id.includes("nprogress")) {
    return "http-vendor";
  }

  if (
    id.includes("vue") ||
    id.includes("@vue") ||
    id.includes("vue-demi")
  ) {
    return "vue-vendor";
  }
}
