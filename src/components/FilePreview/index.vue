<script setup>
import { computed } from "vue";
import { showImagePreview } from "vant";
import "vant/es/cell/style";
import "vant/es/icon/style";
import "vant/es/image-preview/style";

const props = defineProps({
  files: {
    type: Array,
    default: () => []
  },
  showOpen: {
    type: Boolean,
    default: true
  },
  showDownload: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(["open", "download", "preview-image"]);

function getNameFromUrl(url) {
  const raw = String(url || "");
  const plain = raw.split("?")[0].split("#")[0];
  const parts = plain.split("/");
  return decodeURIComponent(parts[parts.length - 1] || "未命名文件");
}

function isImageType(file) {
  const type = String(file?.type || "");
  if (type.startsWith("image/")) return true;
  const name = String(file?.name || file?.url || "");
  return /\.(png|jpe?g|gif|webp|bmp|svg|heic|heif|jfif)$/i.test(name);
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

function openFile(file) {
  emit("open", file);
  window.open(file.url, "_blank");
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
</script>

<template>
  <div class="file-preview">
    <div v-if="!normalizedFiles.length" class="file-preview-empty">暂无文件</div>

    <van-cell
      v-for="(file, index) in normalizedFiles"
      :key="file.url || index"
      class="file-preview-item"
      :title="file.name"
      :label="formatSize(file.size) || undefined"
      center
    >
      <template #icon>
        <van-icon :name="isImageType(file) ? 'photo-o' : 'description'" size="18" />
      </template>
      <template #right-icon>
        <div class="file-preview-actions">
          <button
            v-if="isImageType(file)"
            type="button"
            class="file-preview-btn"
            @click.stop="openImagePreview(file.url)"
          >
            预览
          </button>
          <button
            v-if="showOpen"
            type="button"
            class="file-preview-btn"
            @click.stop="openFile(file)"
          >
            打开
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
</style>
