<script setup>
/**
 * 卡片样式公共组件
 *
 * ---------------------------------------------------------------------------
 * 【怎么用】
 *
 * ```vue
 * <BaseCard title="订单信息" subtitle="2026-03-18">
 *   <p>卡片内容</p>
 *   <template #extra>
 *     <span class="text-[var(--van-primary-color)]">详情</span>
 *   </template>
 *   <template #footer>
 *     <van-button size="small" type="primary">提交</van-button>
 *   </template>
 * </BaseCard>
 * ```
 *
 * 【无内边距内容区（如图表、图片通栏）】
 * ```vue
 * <BaseCard title="数据概览" body-padding="0">
 *   <div class="h-[120px] bg-[var(--van-gray-1)]" />
 * </BaseCard>
 * ```
 * ---------------------------------------------------------------------------
 */
import { computed, useSlots } from "vue";

const props = defineProps({
  /** 卡片标题 */
  title: {
    type: String,
    default: ""
  },
  /** 卡片副标题 */
  subtitle: {
    type: String,
    default: ""
  },
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
  /** 内容区内边距，传 0 或 "0" 可去掉 */
  bodyPadding: {
    type: [Number, String],
    default: "12px 16px"
  },
  /** 是否可点击（显示按压反馈） */
  clickable: {
    type: Boolean,
    default: false
  },
  /** 底部是否有分割线 */
  footerDivider: {
    type: Boolean,
    default: true
  },
  /** 头部是否有分割线 */
  headerDivider: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["click"]);

const slots = useSlots();

const hasHeader = computed(
  () =>
    Boolean(props.title || props.subtitle || slots.title || slots.extra || slots.header)
);

const hasFooter = computed(() => Boolean(slots.footer));

const cardClass = computed(() => [
  "base-card",
  `base-card--shadow-${props.shadow}`,
  {
    "base-card--border": props.border,
    "base-card--clickable": props.clickable,
    "base-card--header-divider": props.headerDivider && hasHeader.value,
    "base-card--footer-divider": props.footerDivider && hasFooter.value
  }
]);

const cardStyle = computed(() => ({
  borderRadius:
    typeof props.radius === "number" ? `${props.radius}px` : props.radius
}));

const bodyStyle = computed(() => ({
  padding:
    typeof props.bodyPadding === "number"
      ? `${props.bodyPadding}px`
      : props.bodyPadding
}));

function onClick(event) {
  if (!props.clickable) return;
  emit("click", event);
}
</script>

<template>
  <div :class="cardClass" :style="cardStyle" @click="onClick">
    <slot v-if="slots.header" name="header" />

    <div v-else-if="hasHeader" class="base-card__header">
      <div class="base-card__header-main">
        <div v-if="title || slots.title" class="base-card__title">
          <slot name="title">{{ title }}</slot>
        </div>
        <div v-if="subtitle" class="base-card__subtitle">{{ subtitle }}</div>
      </div>
      <div v-if="slots.extra" class="base-card__extra">
        <slot name="extra" />
      </div>
    </div>

    <div class="base-card__body" :style="bodyStyle">
      <slot />
    </div>

    <div v-if="hasFooter" class="base-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
.base-card {
  background: var(--color-background-2);
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

.base-card--clickable {
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.base-card--clickable:active {
  transform: scale(0.995);
  opacity: 0.96;
}

.base-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px 0;
}

.base-card--header-divider .base-card__header {
  padding-bottom: 12px;
  border-bottom: 1px solid var(--van-border-color);
}

.base-card__header-main {
  flex: 1;
  min-width: 0;
}

.base-card__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.4;
}

.base-card__subtitle {
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-text-secondary, var(--van-text-color-2));
  line-height: 1.4;
}

.base-card__extra {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--color-text-secondary, var(--van-text-color-2));
}

.base-card__body {
  color: var(--color-text);
  font-size: 14px;
  line-height: 1.6;
}

.base-card__footer {
  padding: 10px 16px 12px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.base-card--footer-divider .base-card__footer {
  border-top: 1px solid var(--van-border-color);
}
</style>
