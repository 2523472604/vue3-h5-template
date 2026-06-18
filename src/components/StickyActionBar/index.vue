<script setup>
/**
 * 底部固定操作栏（含 safe-area）
 *
 * 页面内容需预留底部空间，可开启 placeholder 自动占位
 */
import { computed } from "vue";
import "vant/es/button/style";

const props = defineProps({
  /** 是否 fixed 贴底；false 时相对父容器 absolute 定位 */
  fixed: {
    type: Boolean,
    default: true
  },
  /** 是否渲染占位块，避免内容被遮挡 */
  placeholder: {
    type: Boolean,
    default: true
  },
  /** 占位高度，默认随内容自适应时可手动指定 */
  placeholderHeight: {
    type: String,
    default: ""
  },
  /** 是否显示顶部分割线 */
  border: {
    type: Boolean,
    default: true
  },
  /** 背景模糊 */
  blur: {
    type: Boolean,
    default: true
  },
  /** 内边距 */
  padding: {
    type: String,
    default: "12px 16px"
  },
  zIndex: {
    type: [Number, String],
    default: 100
  }
});

const barClass = computed(() => ({
  "sticky-action-bar": true,
  "is-fixed": props.fixed,
  "is-relative": !props.fixed,
  "has-border": props.border,
  "has-blur": props.blur
}));
</script>

<template>
  <div class="sticky-action-bar-wrap">
    <div
      v-if="placeholder"
      class="sticky-action-bar__placeholder"
      :style="placeholderHeight ? { height: placeholderHeight } : undefined"
      aria-hidden="true"
    />

    <div
      :class="barClass"
      :style="{ padding, zIndex }"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped>
.sticky-action-bar-wrap {
  width: 100%;
}

.sticky-action-bar__placeholder {
  height: calc(68px + env(safe-area-inset-bottom));
}

.sticky-action-bar {
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--van-background-2, var(--color-background-2));
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.sticky-action-bar.is-fixed {
  position: fixed;
}

.sticky-action-bar.is-relative {
  position: absolute;
}

.sticky-action-bar.has-border {
  border-top: 1px solid var(--van-border-color);
}

.sticky-action-bar.has-blur {
  backdrop-filter: saturate(180%) blur(12px);
}

.sticky-action-bar :deep(.van-button) {
  flex: 1;
}
</style>
