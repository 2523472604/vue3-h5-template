<script setup>
/**
 * 结果反馈页 / 区块（成功、失败、等待、警告）
 */
import "vant/es/button/style";
import "vant/es/icon/style";

const props = defineProps({
  status: {
    type: String,
    default: "success",
    validator: val => ["success", "fail", "waiting", "warning"].includes(val)
  },
  title: {
    type: String,
    default: ""
  },
  description: {
    type: String,
    default: ""
  },
  /** 是否占满可视区域高度 */
  fullscreen: {
    type: Boolean,
    default: false
  }
});

const STATUS_MAP = {
  success: {
    icon: "checked",
    color: "var(--van-success-color, #07c160)",
    defaultTitle: "操作成功"
  },
  fail: {
    icon: "cross",
    color: "var(--van-danger-color, #ee0a24)",
    defaultTitle: "操作失败"
  },
  waiting: {
    icon: "clock-o",
    color: "var(--van-primary-color)",
    defaultTitle: "处理中"
  },
  warning: {
    icon: "warning-o",
    color: "var(--van-warning-color, #ff976a)",
    defaultTitle: "请注意"
  }
};

const meta = STATUS_MAP[props.status] || STATUS_MAP.success;
</script>

<template>
  <div
    class="result-page"
    :class="{ 'is-fullscreen': fullscreen }"
  >
    <div class="result-page__icon" :style="{ color: meta.color }">
      <van-icon :name="meta.icon" size="64" />
    </div>

    <h3 class="result-page__title">
      {{ title || meta.defaultTitle }}
    </h3>

    <p v-if="description" class="result-page__desc">
      {{ description }}
    </p>

    <div v-if="$slots.default || $slots.actions" class="result-page__content">
      <slot />
    </div>

    <div v-if="$slots.actions" class="result-page__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.result-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 24px 24px;
  text-align: center;
}

.result-page.is-fullscreen {
  min-height: calc(100vh - 46px - env(safe-area-inset-top));
  justify-content: center;
}

.result-page__icon {
  margin-bottom: 16px;
}

.result-page__title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: var(--van-text-color);
}

.result-page__desc {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-secondary, var(--van-text-color-2));
  max-width: 280px;
}

.result-page__content {
  width: 100%;
  margin-top: 20px;
}

.result-page__actions {
  display: flex;
  gap: 12px;
  width: 100%;
  max-width: 320px;
  margin-top: 24px;
}

.result-page__actions :deep(.van-button) {
  flex: 1;
}
</style>
