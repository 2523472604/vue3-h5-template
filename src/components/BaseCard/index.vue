<script setup>
/**
 * 基础卡片容器（纯样式）
 *
 * ```vue
 * <BaseCard>内容区域</BaseCard>
 * ```
 */
import { computed } from "vue";

const props = defineProps({
  /** 阴影：none | sm | md */
  shadow: {
    type: String,
    default: "sm",
    validator: val => ["none", "sm", "md"].includes(val)
  },
  /** 是否显示边框 */
  border: {
    type: Boolean,
    default: false
  },
  /** 圆角 */
  radius: {
    type: [Number, String],
    default: 12
  },
  /** 内边距，传 0 或 "0" 可去掉 */
  padding: {
    type: [Number, String],
    default: "12px 16px"
  }
});

const cardClass = computed(() => [
  "base-card",
  `base-card--shadow-${props.shadow}`,
  { "base-card--border": props.border }
]);

const cardStyle = computed(() => ({
  borderRadius:
    typeof props.radius === "number" ? `${props.radius}px` : props.radius,
  padding:
    typeof props.padding === "number" ? `${props.padding}px` : props.padding
}));
</script>

<template>
  <div :class="cardClass" :style="cardStyle">
    <slot />
  </div>
</template>

<style scoped>
.base-card {
  background: var(--color-background-2);
  color: var(--color-text);
  font-size: 14px;
  line-height: 1.6;
  overflow: hidden;
}

.base-card--border {
  border: 1px solid var(--van-border-color);
}

.base-card--shadow-sm {
  box-shadow: 0 2px 12px rgba(100, 101, 102, 0.08);
}

.base-card--shadow-md {
  box-shadow: 0 4px 16px rgba(100, 101, 102, 0.12);
}
</style>
