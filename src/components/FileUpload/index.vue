<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import Axios from "axios";
import { showToast } from "vant";
import "vant/es/uploader/style";
import "vant/es/toast/style";
import "vant/es/icon/style";

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  uploadFn: {
    type: Function,
    default: null
  },
  uploadUrl: {
    type: String,
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
  maxConcurrent: {
    type: Number,
    default: 1
  },
  accept: {
    type: String,
    default: "*/*"
  },
  maxSize: {
    type: Number,
    default: 20 * 1024 * 1024
  },
  uploadText: {
    type: String,
    default: "选择文件"
  },
  /**
   * 是否展示已上传文件预览列表（含删除按钮）
   * 注意：Vant 的 preview-image 控制的是「整个预览区」开关，不是仅图片预览
   * - true：展示文件卡片/图片缩略图，并显示删除按钮（推荐）
   * - false：不渲染预览区，上传后看不到删除按钮
   */
  previewImage: {
    type: Boolean,
    default: true
  },
  /** 是否展示删除按钮 */
  deletable: {
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

function isFileEntry(val) {
  return val && typeof val === "object" && typeof val.url === "string";
}

function getNameFromUrl(url) {
  const raw = String(url || "");
  const plain = raw.split("?")[0].split("#")[0];
  const parts = plain.split("/");
  return decodeURIComponent(parts[parts.length - 1] || "未命名文件");
}

function normalizeToEntry(raw, file, fallbackUrl) {
  if (isFileEntry(raw)) {
    return {
      url: raw.url,
      name: raw.name || getNameFromUrl(raw.url),
      size: Number(raw.size) || 0,
      type: raw.type || ""
    };
  }
  const url = typeof raw === "string" ? raw : fallbackUrl;
  return {
    url,
    name: file?.name || getNameFromUrl(url),
    size: Number(file?.size) || 0,
    type: file?.type || ""
  };
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

function uploaderItemToEntry(it) {
  const file = it?.file;
  return normalizeToEntry(
    {
      url: it.url,
      name: it.name || file?.name,
      size: file?.size ?? it.size,
      type: file?.type ?? it.type
    },
    file,
    it.url
  );
}

function syncFromModelValue() {
  const nextUrlSet = new Set(
    safeValue.value.map(it => (isFileEntry(it) ? it.url : it))
  );
  localBlobUrls.forEach(url => {
    if (!nextUrlSet.has(url)) {
      URL.revokeObjectURL(url);
      localBlobUrls.delete(url);
    }
  });

  fileList.value = safeValue.value.map(item => {
    const entry = normalizeToEntry(
      item,
      null,
      typeof item === "string" ? item : ""
    );
    const existing = fileList.value.find(f => f.url === entry.url);
    return {
      url: entry.url,
      objectUrl: entry.url,
      status: "done",
      message: "",
      name: entry.name,
      // 保留 file 引用，预览区显示文件名而非 blob URL
      file:
        existing?.file ||
        (entry.name
          ? { name: entry.name, size: entry.size, type: entry.type }
          : undefined),
      size: entry.size,
      type: entry.type
    };
  });
}

syncFromModelValue();
watch(() => props.modelValue, syncFromModelValue, { deep: true });

function getFileFromUploaderItem(item) {
  return item?.file || item;
}

function updateModelValueFromFileList() {
  const entries = fileList.value
    .map(uploaderItemToEntry)
    .filter(it => Boolean(it.url));
  emit("update:modelValue", entries);
  emit("change", entries);
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

  if (props.maxSize && file.size > props.maxSize) {
    const msg = `文件不能超过 ${Math.round(props.maxSize / 1024 / 1024)}MB`;
    showToast(msg);
    emit("error", new Error(msg));
    item.status = "failed";
    item.message = "文件过大";
    return null;
  }

  item.status = "uploading";
  item.message = "上传中...";

  try {
    let rawResult;
    let url = "";
    if (typeof props.uploadFn === "function") {
      rawResult = await props.uploadFn(file);
      if (isFileEntry(rawResult)) {
        url = rawResult.url;
      } else {
        url = String(rawResult || "");
      }
    } else if (props.uploadUrl) {
      rawResult = await defaultUploadFn(file);
      url = String(rawResult || "");
    } else if (item?.objectUrl) {
      url = item.objectUrl;
      rememberLocalBlobUrl(url);
    } else {
      url = URL.createObjectURL(file);
      rememberLocalBlobUrl(url);
    }

    if (!url) throw new Error("上传结果缺少 URL");
    const entry = normalizeToEntry(rawResult, file, url);

    item.status = "done";
    item.message = "";
    item.url = entry.url;
    item.name = entry.name;
    item.size = entry.size;
    item.type = entry.type;
    item.file = file;

    emit("uploaded", entry);
    return entry;
  } catch (e) {
    item.status = "failed";
    item.message = "上传失败";
    showToast("上传失败");
    emit("error", e);
    return null;
  }
}

async function onAfterRead(items) {
  const list = Array.isArray(items) ? items : [items];
  if (!list.length) return;

  const baseEntries = safeValue.value.map(it =>
    normalizeToEntry(it, null, typeof it === "string" ? it : "")
  );
  const remainCount = Math.max(props.maxCount - baseEntries.length, 0);
  if (remainCount <= 0) {
    const msg = `最多上传 ${props.maxCount} 个文件`;
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
    Array.from({ length: Math.min(concurrency, selected.length) }, () =>
      worker()
    )
  );

  const uploadedEntries = uploadedResults.filter(Boolean);
  if (!uploadedEntries.length) return;

  const nextEntries = baseEntries
    .concat(uploadedEntries)
    .slice(0, props.maxCount);
  emit("update:modelValue", nextEntries);
  emit("change", nextEntries);
}

function onOversize() {
  const msg = `文件不能超过 ${Math.round(props.maxSize / 1024 / 1024)}MB`;
  showToast(msg);
  emit("error", new Error(msg));
}

function onDelete(file) {
  revokeIfLocalBlobUrl(file?.url);
  // van-uploader 删除时已通过 v-model 更新 fileList，勿再 splice，否则可能多删一项
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
    :preview-image="previewImage"
    :deletable="deletable"
    :upload-text="uploadText"
    :after-read="onAfterRead"
    @oversize="onOversize"
    @delete="onDelete"
  >
    <div class="file-upload-trigger">
      <van-icon name="description" size="24" />
      <span class="file-upload-trigger__text">{{ uploadText }}</span>
    </div>
  </van-uploader>
</template>

<style scoped>
.file-upload-trigger {
  width: 80px;
  height: 80px;
  background: var(--van-gray-1);
  border: 1px dashed var(--van-border-color);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
}

.file-upload-trigger__text {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1;
}
</style>
