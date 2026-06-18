<script setup>
/**
 * 全局 NavBar 公共组件
 *
 * ---------------------------------------------------------------------------
 * 【默认行为】
 * - 自动读取当前路由 meta.title 作为标题
 * - 主 Tab 页默认不显示返回箭头（meta.leftArrow !== true）
 * - 右侧默认显示深色模式切换按钮
 *
 * 【路由 meta 配置】
 * - title: 页面标题
 * - showNavBar: false 隐藏 NavBar
 * - leftArrow: true 显示返回箭头（点击 router.back()）
 * - showDarkMode: false 隐藏右侧深色模式按钮
 *
 * 【页面内动态覆盖】
 * useNavBar({ title: "详情", leftArrow: true });
 *
 * 【自定义插槽】
 * 在页面中设置 meta.showNavBar: false，然后局部使用 <NavBar> 并传入 #left/#title/#right
 * ---------------------------------------------------------------------------
 */
import { computed, inject, useSlots } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDarkMode, useToggleDarkMode } from "@/hooks/useToggleDarkMode";
import { NAV_BAR_CONFIG_KEY } from "@/hooks/useNavBar";
import "vant/es/nav-bar/style";

const props = defineProps({
  /** 手动指定标题（优先级最高） */
  title: {
    type: String,
    default: ""
  },
  /** 是否显示返回箭头；不传则读取路由 meta / useNavBar */
  leftArrow: {
    type: Boolean,
    default: undefined
  },
  /** 是否显示右侧深色模式按钮；不传则读取路由 meta / useNavBar */
  showDarkMode: {
    type: Boolean,
    default: undefined
  },
  border: {
    type: Boolean,
    default: true
  },
  fixed: {
    type: Boolean,
    default: true
  },
  placeholder: {
    type: Boolean,
    default: true
  }
});

const route = useRoute();
const router = useRouter();
const slots = useSlots();
const pageConfig = inject(NAV_BAR_CONFIG_KEY, null);

const visible = computed(() => {
  if (pageConfig?.hidden === true) return false;
  if (pageConfig?.hidden === false) return true;
  return route.meta?.showNavBar !== false;
});

const resolvedTitle = computed(
  () => props.title || pageConfig?.title || route.meta?.title || ""
);

const resolvedLeftArrow = computed(() => {
  if (props.leftArrow !== undefined) return props.leftArrow;
  if (pageConfig?.leftArrow !== undefined) return pageConfig.leftArrow;
  return Boolean(route.meta?.leftArrow);
});

const resolvedShowDarkMode = computed(() => {
  if (props.showDarkMode !== undefined) return props.showDarkMode;
  if (pageConfig?.showDarkMode !== undefined) return pageConfig.showDarkMode;
  return route.meta?.showDarkMode !== false;
});

const darkMode = useDarkMode();

function onClickLeft() {
  if (window.history.state?.back) {
    router.back();
    return;
  }
  router.push({ name: "Demo" });
}

function onClickRight() {
  useToggleDarkMode();
}
</script>

<template>
  <van-nav-bar
    v-if="visible"
    :title="slots.title ? undefined : resolvedTitle"
    :left-arrow="resolvedLeftArrow && !slots.left"
    :border="border"
    :fixed="fixed"
    :placeholder="placeholder"
    @click-left="onClickLeft"
  >
    <template v-if="slots.left" #left>
      <slot name="left" />
    </template>

    <template v-if="slots.title" #title>
      <slot name="title" />
    </template>

    <template #right>
      <slot name="right">
        <svg-icon
          v-if="resolvedShowDarkMode"
          class="nav-bar-theme-icon"
          :name="darkMode ? 'light' : 'dark'"
          @click="onClickRight"
        />
      </slot>
    </template>
  </van-nav-bar>
</template>

<style scoped>
.nav-bar-theme-icon {
  font-size: 18px;
  cursor: pointer;
}
</style>
