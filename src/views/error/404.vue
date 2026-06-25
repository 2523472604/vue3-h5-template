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
    <div
      class="relative flex min-h-[calc(100vh-var(--van-nav-bar-height)-env(safe-area-inset-top))] items-center justify-center overflow-hidden bg-[var(--color-background-2)] px-6 pb-[calc(40px+env(safe-area-inset-bottom))] pt-8"
    >
      <div class="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          class="absolute -right-[18%] -top-[12%] h-[72vmin] w-[72vmin] animate-pulse rounded-full bg-primary/15 blur-3xl"
        />
      </div>

      <transition
        appear
        enter-active-class="transition duration-700 ease-out"
        enter-from-class="opacity-0 translate-y-5"
        enter-to-class="opacity-100 translate-y-0"
      >
        <div class="relative z-10 w-full max-w-[320px]">
          <van-empty>
            <template #image>
              <p
                class="m-0 select-none bg-gradient-to-b from-primary via-[var(--color-primary-dark)] to-[var(--color-primary-darker)] bg-clip-text text-[clamp(88px,28vw,120px)] font-extralight leading-none tracking-tight text-transparent"
              >
                404
              </p>
              <div
                class="mx-auto my-5 h-[3px] w-8 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-85"
              />
            </template>

            <template #description>
              <h1
                class="m-0 text-[20px] font-semibold leading-snug text-[var(--color-text)]"
              >
                页面走丢了
              </h1>
              <p
                class="mt-2.5 text-[14px] leading-relaxed text-[var(--color-text-secondary)]"
              >
                您访问的链接不存在或已被移除
              </p>
            </template>

            <div class="mt-9 flex w-full flex-col gap-3">
              <van-button block round type="primary" @click="goHome">
                返回首页
              </van-button>
              <van-button block round plain type="primary" @click="goBack">
                返回上一页
              </van-button>
            </div>
          </van-empty>
        </div>
      </transition>
    </div>
  </van-config-provider>
</template>
