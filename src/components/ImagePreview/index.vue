<script setup>
import { computed } from "vue";
import { showImagePreview } from "vant";
import "vant/es/image-preview/style";
import "vant/es/image/style";

const props = defineProps({
  images: {
    type: Array,
    default: () => []
  },
  startPosition: {
    type: Number,
    default: 0
  },
  closeable: {
    type: Boolean,
    default: true
  },
  showIndex: {
    type: Boolean,
    default: true
  },
  loop: {
    type: Boolean,
    default: true
  },
  /**
   * 是否渲染缩略图列表（不需要缩略图时可用 slot 自行触发 open）
   */
  showThumbs: {
    type: Boolean,
    default: true
  },
  thumbSize: {
    type: [Number, String],
    default: 80
  },
  thumbFit: {
    type: String,
    default: "cover"
  },
  thumbRadius: {
    type: [Number, String],
    default: 8
  },
  thumbGap: {
    type: [Number, String],
    default: 8
  }
});

const emit = defineEmits(["open", "close"]);

const safeImages = computed(() => (Array.isArray(props.images) ? props.images : []).filter(Boolean));
const thumbGapStyle = computed(() =>
  typeof props.thumbGap === "number" ? `${props.thumbGap}px` : props.thumbGap
);

function open(index = props.startPosition) {
  const images = safeImages.value;
  if (!images.length) return;

  const start = Math.min(Math.max(Number(index) || 0, 0), images.length - 1);

  emit("open", start);
  showImagePreview({
    images,
    startPosition: start,
    closeable: props.closeable,
    showIndex: props.showIndex,
    loop: props.loop,
    onClose() {
      emit("close");
    }
  });
}

defineExpose({ open });
</script>

<template>
  <slot :open="open" :images="safeImages" />

  <div
    v-if="showThumbs && safeImages.length"
    class="image-preview-thumbs"
    :style="{ gap: thumbGapStyle }"
  >
    <div
      v-for="(url, idx) in safeImages"
      :key="url + idx"
      class="image-preview-thumb"
      @click="open(idx)"
    >
      <van-image
        :src="url"
        :width="thumbSize"
        :height="thumbSize"
        :radius="thumbRadius"
        :fit="thumbFit"
      />
    </div>
  </div>
</template>

<style scoped>
.image-preview-thumbs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.image-preview-thumb {
  cursor: pointer;
}
</style>

