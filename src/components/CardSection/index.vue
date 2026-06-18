<script setup>
/**
 * 卡片分组（标题 + BaseCard + van-cell-group）
 *
 * variant="form" 时统一 label / 必填星号 / 内容区对齐（表单页）
 */
import BaseCard from "@/components/BaseCard/index.vue";
import "vant/es/cell-group/style";

defineProps({
  title: {
    type: String,
    default: ""
  },
  /** default 详情展示 | form 表单编辑 */
  variant: {
    type: String,
    default: "default",
    validator: val => ["default", "form"].includes(val)
  },
  /** 与 van-form 的 label-width 保持一致 */
  labelWidth: {
    type: String,
    default: "6.2em"
  }
});
</script>

<template>
  <section
    class="card-section"
    :class="{ 'card-section--form': variant === 'form' }"
    :style="{ '--card-section-label-width': labelWidth }"
  >
    <BaseCard :padding="0" shadow="none">
      <h3
        v-if="title || $slots.title"
        class="card-section__title"
        :class="{ 'card-section__title--form': variant === 'form' }"
      >
        <span v-if="variant === 'form'" class="card-section__title-label">
          <span class="card-section__bar" aria-hidden="true" />
          <span class="card-section__title-text">
            <slot name="title">{{ title }}</slot>
          </span>
        </span>
        <template v-else>
          <span class="card-section__bar" aria-hidden="true" />
          <span class="card-section__title-text">
            <slot name="title">{{ title }}</slot>
          </span>
        </template>
      </h3>

      <van-cell-group :border="false">
        <slot />
      </van-cell-group>
    </BaseCard>
  </section>
</template>

<style scoped>
.card-section {
  padding: 0 16px;
}

.card-section + .card-section {
  margin-top: 20px;
}

.card-section__title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 12px 16px 8px;
  font-size: 14px;
  line-height: 24px;
  font-weight: 600;
  color: var(--color-text);
}

.card-section__title--form {
  gap: 0;
}

.card-section__title-label {
  display: flex;
  align-items: center;
  gap: 5px;
  width: var(--card-section-label-width);
  max-width: var(--card-section-label-width);
  flex: none;
}

.card-section__bar {
  flex-shrink: 0;
  width: 3px;
  height: 14px;
  border-radius: 2px;
  background: var(--van-primary-color);
}

.card-section__title-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 表单模式：field / cell 统一 label 宽度与内容左对齐 */
.card-section--form :deep(.van-field__label) {
  width: var(--card-section-label-width);
  margin-right: var(--van-field-label-margin-right, 12px);
}

.card-section--form :deep(.van-cell__title) {
  flex: none;
  width: var(--card-section-label-width);
  max-width: var(--card-section-label-width);
  margin-right: var(--van-field-label-margin-right, 12px);
}

.card-section--form :deep(.van-cell__value) {
  flex: 1;
  text-align: left;
}

.card-section--form :deep(.area-picker .van-cell__value),
.card-section--form :deep(.date-time-picker .van-cell__value),
.card-section--form :deep(.popup-multi-select .van-cell__value),
.card-section--form :deep(.popup-select .van-cell__value) {
  flex: 1;
  text-align: left;
}

.card-section--form :deep(.van-cell--required::before) {
  left: var(--van-padding-md, 16px);
}

.card-section--form :deep(.van-cell--required .van-cell__title) {
  padding-left: 8px;
}
</style>
