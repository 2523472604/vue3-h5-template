<script setup>
/**
 * 全屏内容页容器（表单、详情等通用）
 *
 * ```vue
 * <PageShell>
 *   <CardSection title="基本信息">...</CardSection>
 *   <StickyActionBar>...</StickyActionBar>
 * </PageShell>
 * ```
 */
defineProps({
  /** 是否为底部固定操作栏预留空间 */
  actionBar: {
    type: Boolean,
    default: true
  }
});
</script>

<template>
  <div
    class="page-shell"
    :class="{ 'page-shell--action-bar': actionBar }"
  >
    <slot />
  </div>
</template>

<style scoped>
.page-shell {
  min-height: calc(100vh - var(--van-nav-bar-height, 46px));
  padding: 12px 0 0;
  background: var(--van-background);
  box-sizing: border-box;
}

.page-shell--action-bar {
  padding-bottom: calc(80px + env(safe-area-inset-bottom));
}
</style>
