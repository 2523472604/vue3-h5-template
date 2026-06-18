import { inject, onBeforeUnmount, reactive } from "vue";

export const NAV_BAR_CONFIG_KEY = Symbol("navBarConfig");

export function createNavBarConfig() {
  return reactive({
    /** 覆盖标题（优先级高于 route.meta.title） */
    title: "",
    /** 覆盖是否显示返回箭头 */
    leftArrow: undefined,
    /** 覆盖是否显示右侧深色模式按钮 */
    showDarkMode: undefined,
    /** 覆盖是否隐藏 NavBar */
    hidden: undefined
  });
}

/**
 * 页面内动态覆盖 NavBar（离开页面自动恢复）
 *
 * @example
 * useNavBar({ title: "订单详情", leftArrow: true });
 */
export function useNavBar(options = {}) {
  const config = inject(NAV_BAR_CONFIG_KEY, null);
  if (!config) return null;

  const keys = ["title", "leftArrow", "showDarkMode", "hidden"];
  const prev = {};

  keys.forEach(key => {
    if (options[key] !== undefined) {
      prev[key] = config[key];
      config[key] = options[key];
    }
  });

  onBeforeUnmount(() => {
    keys.forEach(key => {
      if (options[key] !== undefined) {
        config[key] = key === "title" ? "" : undefined;
      }
    });
  });

  return config;
}
