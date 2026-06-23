<script setup name="NotFound">
import { useRouter } from "vue-router";
import { useDarkMode } from "@/hooks/useToggleDarkMode";
import { vantThemeVars } from "@/constants/theme";
import "vant/es/empty/style";
import "vant/es/button/style";

const router = useRouter();
const darkMode = useDarkMode();

function goHome() {
  router.replace({ name: "Demo" });
}

function goBack() {
  if (window.history.state?.back) {
    router.back();
    return;
  }
  goHome();
}
</script>

<template>
  <van-config-provider
    :theme="darkMode ? 'dark' : 'light'"
    :theme-vars="vantThemeVars"
  >
    <div class="not-found-page">
      <van-empty image="error" description="抱歉，您访问的页面不存在">
        <div class="not-found-page__actions">
          <van-button round type="primary" @click="goHome">返回首页</van-button>
          <van-button round plain @click="goBack">返回上一页</van-button>
        </div>
      </van-empty>
    </div>
  </van-config-provider>
</template>

<style scoped>
.not-found-page {
  min-height: calc(100vh - var(--van-nav-bar-height) - env(safe-area-inset-top));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px 40px;
  background: var(--color-background-2);
}

.not-found-page__actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 200px;
  margin-top: 8px;
}
</style>
