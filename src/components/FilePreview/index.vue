<script setup>
import { computed, ref } from "vue";
import { showImagePreview, showToast } from "vant";
import "vant/es/cell/style";
import "vant/es/icon/style";
import "vant/es/image-preview/style";
import "vant/es/popup/style";
import "vant/es/loading/style";
import "vant/es/toast/style";

const props = defineProps({
  files: {
    type: Array,
    default: () => []
  },
  showDownload: {
    type: Boolean,
    default: true
  },
  /** 点击整行时尝试预览（仅可预览类型） */
  clickToPreview: {
    type: Boolean,
    default: true
  },
  /** 文本预览最大字节数 */
  maxTextPreviewSize: {
    type: Number,
    default: 512 * 1024
  }
});

const emit = defineEmits(["download", "preview", "preview-image"]);

const previewVisible = ref(false);
const previewLoading = ref(false);
const previewMode = ref("");
const previewUrl = ref("");
const previewText = ref("");
const previewTitle = ref("");

function getNameFromUrl(url) {
  const raw = String(url || "");
  const plain = raw.split("?")[0].split("#")[0];
  const parts = plain.split("/");
  return decodeURIComponent(parts[parts.length - 1] || "未命名文件");
}

function getExt(nameOrUrl) {
  const plain = String(nameOrUrl || "").split("?")[0].split("#")[0];
  const match = plain.match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toLowerCase() : "";
}

function getFileKind(file) {
  const type = String(file?.type || "").toLowerCase();
  const name = file?.name || file?.url || "";
  const ext = getExt(name);

  if (type.startsWith("image/") || /^(png|jpe?g|gif|webp|bmp|svg|heic|heif|jfif)$/.test(ext)) {
    return "image";
  }
  if (type.startsWith("video/") || /^(mp4|webm|ogg|mov|m4v|3gp)$/.test(ext)) {
    return "video";
  }
  if (type.startsWith("audio/") || /^(mp3|wav|ogg|m4a|aac|flac)$/.test(ext)) {
    return "audio";
  }
  if (type === "application/pdf" || ext === "pdf") {
    return "pdf";
  }
  if (
    type.startsWith("text/") ||
    type === "application/json" ||
    /^(txt|json|xml|html?|css|js|md|csv|log|yaml|yml)$/.test(ext)
  ) {
    return "text";
  }
  return "other";
}

function isImageType(file) {
  return getFileKind(file) === "image";
}

function canPreview(file) {
  return getFileKind(file) !== "other";
}

const normalizedFiles = computed(() =>
  (Array.isArray(props.files) ? props.files : [])
    .filter(Boolean)
    .map(item => {
      if (typeof item === "string") {
        return {
          name: getNameFromUrl(item),
          url: item,
          size: 0,
          type: ""
        };
      }
      return {
        name: item.name || getNameFromUrl(item.url),
        url: item.url,
        size: Number(item.size) || 0,
        type: item.type || ""
      };
    })
    .filter(it => Boolean(it.url))
);

const imageUrls = computed(() =>
  normalizedFiles.value.filter(it => isImageType(it)).map(it => it.url)
);

function formatSize(size) {
  const n = Number(size) || 0;
  if (!n) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

function getIconName(file) {
  const kind = getFileKind(file);
  if (kind === "image") return "photo-o";
  if (kind === "video") return "video-o";
  if (kind === "audio") return "music-o";
  if (kind === "pdf") return "description";
  if (kind === "text") return "notes-o";
  return "description";
}

function openImagePreview(url) {
  const list = imageUrls.value;
  if (!list.length) return;
  const start = Math.max(0, list.indexOf(url));
  emit("preview-image", url);
  showImagePreview({
    images: list,
    startPosition: start,
    closeable: true
  });
}

function closePreviewModal() {
  previewVisible.value = false;
  previewMode.value = "";
  previewUrl.value = "";
  previewText.value = "";
  previewTitle.value = "";
  previewLoading.value = false;
}

async function openTextPreview(file) {
  if (file.size && file.size > props.maxTextPreviewSize) {
    showToast("文本过大，请下载后查看");
    return false;
  }

  previewLoading.value = true;
  try {
    const res = await fetch(file.url);
    if (!res.ok) throw new Error("load failed");
    const text = await res.text();
    if (text.length > props.maxTextPreviewSize) {
      showToast("文本过大，请下载后查看");
      return false;
    }
    previewText.value = text;
    return true;
  } catch {
    showToast("文本预览失败，请尝试下载");
    return false;
  } finally {
    previewLoading.value = false;
  }
}

async function previewFile(file) {
  const kind = getFileKind(file);
  emit("preview", file);

  if (kind === "image") {
    openImagePreview(file.url);
    return;
  }

  if (kind === "other") {
    showToast("该文件类型暂不支持在线预览，请下载后查看");
    return;
  }

  previewTitle.value = file.name;
  previewMode.value = kind;
  previewUrl.value = file.url;
  previewText.value = "";
  previewVisible.value = true;

  if (kind === "text") {
    const ok = await openTextPreview(file);
    if (!ok) closePreviewModal();
  }
}

function downloadFile(file) {
  emit("download", file);
  const link = document.createElement("a");
  link.href = file.url;
  link.download = file.name || "file";
  link.target = "_blank";
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function onRowClick(file) {
  if (!props.clickToPreview || !canPreview(file)) return;
  previewFile(file);
}
</script>

<template>
  <div class="file-preview">
    <div v-if="!normalizedFiles.length" class="file-preview-empty">暂无文件</div>

    <van-cell
      v-for="(file, index) in normalizedFiles"
      :key="file.url || index"
      class="file-preview-item"
      :class="{ 'is-previewable': canPreview(file) && clickToPreview }"
      :title="file.name"
      :label="formatSize(file.size) || undefined"
      center
      @click="onRowClick(file)"
    >
      <template #icon>
        <van-icon :name="getIconName(file)" size="18" />
      </template>
      <template #right-icon>
        <div class="file-preview-actions">
          <button
            v-if="canPreview(file)"
            type="button"
            class="file-preview-btn"
            @click.stop="previewFile(file)"
          >
            预览
          </button>
          <button
            v-if="showDownload"
            type="button"
            class="file-preview-btn"
            @click.stop="downloadFile(file)"
          >
            下载
          </button>
        </div>
      </template>
    </van-cell>

    <van-popup
      v-model:show="previewVisible"
      position="bottom"
      round
      closeable
      :style="{ height: '72vh' }"
      class="file-preview-modal"
      @closed="closePreviewModal"
    >
      <div class="file-preview-modal__header">{{ previewTitle }}</div>

      <div class="file-preview-modal__body">
        <van-loading v-if="previewLoading" size="24" vertical>
          加载中...
        </van-loading>

        <video
          v-else-if="previewMode === 'video'"
          class="file-preview-media"
          :src="previewUrl"
          controls
          playsinline
          webkit-playsinline
          preload="metadata"
        />

        <audio
          v-else-if="previewMode === 'audio'"
          class="file-preview-audio"
          :src="previewUrl"
          controls
          preload="metadata"
        />

        <iframe
          v-else-if="previewMode === 'pdf'"
          class="file-preview-pdf"
          :src="previewUrl"
          title="PDF 预览"
        />

        <pre v-else-if="previewMode === 'text'" class="file-preview-text">{{
          previewText
        }}</pre>
      </div>
    </van-popup>
  </div>
</template>

<style scoped>
.file-preview {
  border: 1px solid var(--van-border-color);
  border-radius: 12px;
  overflow: hidden;
  background: var(--van-background-2);
}

.file-preview-empty {
  padding: 16px 12px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.file-preview-item :deep(.van-cell__title) {
  margin-left: 8px;
}

.file-preview-item.is-previewable {
  cursor: pointer;
}

.file-preview-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-preview-btn {
  border: none;
  background: transparent;
  color: var(--van-primary-color);
  font-size: 12px;
  padding: 0;
}

.file-preview-modal__header {
  padding: 14px 40px 10px 16px;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
  word-break: break-all;
}

.file-preview-modal__body {
  height: calc(72vh - 52px);
  padding: 0 12px 12px;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-preview-media {
  width: 100%;
  max-height: 100%;
  background: #000;
  border-radius: 8px;
}

.file-preview-audio {
  width: 100%;
}

.file-preview-pdf {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 8px;
  background: var(--van-gray-1);
}

.file-preview-text {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 12px;
  box-sizing: border-box;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 12px;
  line-height: 1.6;
  color: var(--color-text);
  background: var(--van-gray-1);
  border-radius: 8px;
}
</style>
