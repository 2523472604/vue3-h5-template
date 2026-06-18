<script setup name="Login">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { showToast } from "vant";
import { useDarkMode } from "@/hooks/useToggleDarkMode";
import { useUserStoreHook } from "@/store/modules/user";
import "vant/es/field/style";
import "vant/es/button/style";
import "vant/es/cell-group/style";
import "vant/es/toast/style";

const route = useRoute();
const router = useRouter();
const darkMode = useDarkMode();
const userStore = useUserStoreHook();

const username = ref("");
const password = ref("");
const loading = ref(false);

async function onLogin() {
  if (!username.value.trim() || !password.value.trim()) {
    showToast("请输入账号和密码");
    return;
  }

  loading.value = true;
  try {
    await userStore.login({
      username: username.value.trim(),
      password: password.value
    });

    const redirect = route.query.redirect;
    if (typeof redirect === "string" && redirect && redirect !== "/login") {
      router.replace(redirect);
    } else {
      router.replace({ name: "Demo" });
    }
  } catch {
    // 错误提示由 http 拦截器处理
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <van-config-provider :theme="darkMode ? 'dark' : 'light'">
    <div class="login-page">
      <div class="login-page__bg" />

      <div class="login-page__content">
        <div class="login-page__brand">
          <img
            class="login-page__logo"
            src="~@/assets/logo_melomini.png"
            alt="logo"
          />
          <h1 class="login-page__title">Vue3 H5 Template</h1>
          <p class="login-page__desc">移动端项目基础模板</p>
        </div>

        <div class="login-page__form">
          <van-cell-group inset>
            <van-field
              v-model="username"
              label="账号"
              placeholder="请输入账号"
              clearable
            />
            <van-field
              v-model="password"
              type="password"
              label="密码"
              placeholder="请输入密码"
              clearable
            />
          </van-cell-group>

          <van-button
            class="login-page__submit"
            type="primary"
            block
            round
            :loading="loading"
            @click="onLogin"
          >
            登录
          </van-button>

          <p class="login-page__tip">开发环境走 mock 登录，任意账号密码均可</p>
        </div>
      </div>
    </div>
  </van-config-provider>
</template>

<style scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: var(--color-background-2);
}

.login-page__bg {
  position: absolute;
  inset: 0 0 auto;
  height: 42vh;
  background: linear-gradient(160deg, #41b883 0%, #2f9e6b 70%, #248a5c 100%);
}

.login-page__content {
  position: relative;
  z-index: 1;
  padding: calc(48px + env(safe-area-inset-top)) 24px 24px;
}

.login-page__brand {
  text-align: center;
  color: #fff;
  margin-bottom: 36px;
}

.login-page__logo {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.login-page__title {
  margin: 16px 0 6px;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.3;
}

.login-page__desc {
  margin: 0;
  font-size: 13px;
  opacity: 0.9;
}

.login-page__form {
  padding-top: 8px;
}

.login-page__submit {
  margin-top: 24px;
  height: 44px;
  font-size: 16px;
  border: none;
  background: linear-gradient(135deg, #41b883, #2f9e6b);
}

.login-page__tip {
  margin: 16px 0 0;
  text-align: center;
  font-size: 12px;
  color: var(--color-text-secondary, var(--van-text-color-2));
}
</style>
