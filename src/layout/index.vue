<script setup>
import tabbar from "@/components/Tabbar/index.vue";
import NavBar from "@/components/NavBar/index.vue";
import { useDarkMode } from "@/hooks/useToggleDarkMode";
import { createNavBarConfig, NAV_BAR_CONFIG_KEY } from "@/hooks/useNavBar";
import { useCachedViewStoreHook } from "@/store/modules/cachedView";
import { computed, provide } from "vue";
import { useRoute } from "vue-router";

const navBarConfig = createNavBarConfig();
provide(NAV_BAR_CONFIG_KEY, navBarConfig);

const route = useRoute();
const showTabbar = computed(() => route.meta?.showTabbar !== false);

const cachedViews = computed(() => {
  return useCachedViewStoreHook().cachedViewList;
});

const darkMode = useDarkMode();
</script>

<template>
  <div class="app-wrapper">
    <van-config-provider :theme="darkMode ? 'dark' : 'light'">
      <nav-bar />
      <router-view v-slot="{ Component }">
        <keep-alive :include="cachedViews">
          <component :is="Component" />
        </keep-alive>
      </router-view>
      <tabbar v-if="showTabbar" />
    </van-config-provider>
  </div>
</template>

<style lang="less" scoped>
@import "@/styles/mixin.less";

.app-wrapper {
  .clearfix();
  position: relative;
  height: 100%;
  width: 100%;
}
</style>
