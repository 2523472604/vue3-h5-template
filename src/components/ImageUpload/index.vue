<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import Axios from "axios";
import { showToast } from "vant";
import "vant/es/uploader/style";
import "vant/es/toast/style";

const props = defineProps({
  /**
   * v-model：已上传后的图片 URL 列表
   */
  modelValue: {
    type: Array,
    default: () => []
  },
  /**
   * 自定义上传函数：返回图片 URL
   * (file: File) => Promise<string> | string
   * 优先级最高；传了该函数就不会使用 uploadUrl
   */
  uploadFn: {
    type: Function,
    default: null
  },
  /**
   * 内置上传逻辑使用的上传地址
   * - 为空：不调接口，仅本地预览（开发默认）
   * - 非空：组件会 POST 到该地址，并按 { code, url, msg } 解析返回
   *
   * 后续接入后端时，推荐只改这里（或在页面上通过 :upload-url 传入）
   */
  uploadUrl: {
    type: String,
    // 全局统一配置：默认读取环境变量 VITE_UPLOAD_URL
    // - 为空：仅本地预览，不请求后端
    // - 非空：走组件内置上传
    default: import.meta.env.VITE_UPLOAD_URL || ""
  },
  multiple: {
    type: Boolean,
    default: true
  },
  maxCount: {
    type: Number,
    default: 9
  },
  /**
   * 上传并发数（默认 1：串行）
   */
  maxConcurrent: {
    type: Number,
    default: 1
  },
  accept: {
    type: String,
    // 使用宽松 accept，避免浏览器在选择阶段静默拦截导致“没反应”
    default: "*/*"
  },
  maxSize: {
    type: Number,
    default: 10 * 1024 * 1024
  },
  uploadText: {
    type: String,
    default: "上传图片"
  },
  previewFullImage: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(["update:modelValue", "change", "uploaded", "error"]);

const fileList = ref([]);
const localBlobUrls = new Set();

const safeValue = computed(() =>
  (Array.isArray(props.modelValue) ? props.modelValue : []).filter(Boolean)
);

function syncFromModelValue() {
  const nextUrlSet = new Set(safeValue.value);
  // 同步外部值时，回收已不在列表中的本地 blob URL，避免内存泄漏
  localBlobUrls.forEach(url => {
    if (!nextUrlSet.has(url)) {
      URL.revokeObjectURL(url);
      localBlobUrls.delete(url);
    }
  });

  fileList.value = safeValue.value.map(url => ({
    url,
    // 兼容 vant uploader 的预览逻辑：优先使用 objectUrl
    objectUrl: url,
    // blob/data URL 没有扩展名时，显式标记为图片，避免被当成普通文件显示名称
    isImage: true,
    status: "done"
  }));
}

syncFromModelValue();
watch(() => props.modelValue, syncFromModelValue);

function updateModelValueFromFileList() {
  const urls = fileList.value.map(f => f.url).filter(Boolean);
  emit("update:modelValue", urls);
  emit("change", urls);
}

function getFileFromUploaderItem(item) {
  // vant: item.file is File
  return item?.file || item;
}

function rememberLocalBlobUrl(url) {
  if (typeof url === "string" && url.startsWith("blob:")) {
    localBlobUrls.add(url);
  }
}

function revokeIfLocalBlobUrl(url) {
  if (typeof url !== "string") return;
  if (!localBlobUrls.has(url)) return;
  URL.revokeObjectURL(url);
  localBlobUrls.delete(url);
}

function isImageFile(file) {
  if (!file) return false;
  if (typeof file.type === "string" && file.type) {
    return file.type.startsWith("image/");
  }
  const name = String(file.name || "");
  // 某些设备/浏览器会给空 MIME，放宽后缀校验避免“选择后无请求”
  if (!name) return true;
  return /\.(png|jpe?g|gif|webp|bmp|svg|heic|heif|jfif)$/i.test(name);
}

async function defaultUploadFn(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await Axios.post(props.uploadUrl, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  const data = response?.data || {};
  if (data.code !== 200 || !data.url) {
    throw new Error(data.msg || "上传失败");
  }

  return data.url;
}

async function doUploadOne(item) {
  const file = getFileFromUploaderItem(item);
  if (!file) return null;

  if (!isImageFile(file)) {
    const msg = "请选择图片文件（png/jpg/jpeg/webp/gif/bmp/svg）";
    showToast(msg);
    emit("error", new Error(msg));
    item.status = "failed";
    item.message = "文件类型不支持";
    return null;
  }

  if (props.maxSize && file.size > props.maxSize) {
    const msg = `图片不能超过 ${Math.round(props.maxSize / 1024 / 1024)}MB`;
    showToast(msg);
    emit("error", new Error(msg));
    item.status = "failed";
    item.message = "文件过大";
    return null;
  }

  // 标记上传中
  item.status = "uploading";
  item.message = "上传中...";

  try {
    let url;
    // 上传策略：
    // 1) uploadFn：完全自定义（可注入 token、自定义返回结构）
    // 2) uploadUrl：走组件内置上传
    // 3) 都不传：仅本地预览，不发请求
    if (typeof props.uploadFn === "function") {
      url = await props.uploadFn(file);
    } else if (props.uploadUrl) {
      url = await defaultUploadFn(file);
    } else if (item?.objectUrl) {
      // 默认不调接口，仅本地预览；接入后端时传 upload-url 即可
      // 直接使用 vant 在 afterRead 里生成的 objectUrl（blob），用于“立刻预览缩略图”
      // 注意：后续真正接入后端时，推荐传 upload-url / upload-fn 覆盖此逻辑
      url = item.objectUrl;
    } else {
      url = URL.createObjectURL(file);
      rememberLocalBlobUrl(url);
    }

    item.status = "done";
    item.message = "";
    item.url = url;
    // 兜底显式标记，确保 blob URL 也按图片缩略图渲染
    item.isImage = true;
    emit("uploaded", url);
    return url;
  } catch (e) {
    item.status = "failed";
    item.message = "上传失败";
    showToast("上传失败");
    emit("error", e);
    return null;
  }
}

function onBeforeRead(items) {
  const list = Array.isArray(items) ? items : [items];
  const invalid = list.find(it => !isImageFile(getFileFromUploaderItem(it)));
  if (!invalid) return true;

  const msg = "请选择图片文件（png/jpg/jpeg/webp/gif/bmp/svg）";
  showToast(msg);
  emit("error", new Error(msg));
  return false;
}

async function onAfterRead(items) {
  const list = Array.isArray(items) ? items : [items];
  if (!list.length) return;

  const baseUrls = safeValue.value.slice();
  const remainCount = Math.max(props.maxCount - baseUrls.length, 0);
  if (remainCount <= 0) {
    const msg = `最多上传 ${props.maxCount} 张`;
    showToast(msg);
    emit("error", new Error(msg));
    return;
  }

  const selected = list.slice(0, remainCount);
  const uploadedResults = new Array(selected.length).fill(null);
  const concurrency = Math.max(1, Number(props.maxConcurrent) || 1);
  let cursor = 0;

  async function worker() {
    while (cursor < selected.length) {
      const currentIndex = cursor++;
      uploadedResults[currentIndex] = await doUploadOne(selected[currentIndex]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, selected.length) }, () => worker())
  );
  const uploadedUrls = uploadedResults.filter(Boolean);

  if (!uploadedUrls.length) return;

  const nextUrls = baseUrls.concat(uploadedUrls).slice(0, props.maxCount);
  emit("update:modelValue", nextUrls);
  emit("change", nextUrls);
}

function onOversize() {
  const msg = `图片不能超过 ${Math.round(props.maxSize / 1024 / 1024)}MB`;
  showToast(msg);
  emit("error", new Error(msg));
}

function onDelete(_file) {
  revokeIfLocalBlobUrl(_file?.url);
  // van-uploader 删除时已通过 v-model 更新 fileList，勿再 splice
  updateModelValueFromFileList();
}

function clear() {
  fileList.value.forEach(item => revokeIfLocalBlobUrl(item?.url));
  fileList.value = [];
  updateModelValueFromFileList();
}

onBeforeUnmount(() => {
  localBlobUrls.forEach(url => URL.revokeObjectURL(url));
  localBlobUrls.clear();
});

defineExpose({ clear, fileList });
</script>

<template>
  <van-uploader
    v-model="fileList"
    :multiple="multiple"
    :max-count="maxCount"
    :accept="accept"
    :max-size="maxSize"
    :preview-full-image="previewFullImage"
    :upload-text="uploadText"
    :before-read="onBeforeRead"
    :after-read="onAfterRead"
    @oversize="onOversize"
    @delete="onDelete"
  />
</template>

<style scoped></style>
