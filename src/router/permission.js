import { useUserStoreHook } from "@/store/modules/user";
import { useCachedViewStoreHook } from "@/store/modules/cachedView";
import { ROUTE_WHITE_LIST } from "@/constants/route";
import NProgress from "@/utils/progress";
import setPageTitle from "@/utils/set-page-title";

/**
 * 路由守卫：登录校验 + 页面 title + keep-alive 缓存
 */
export function setupRouterGuard(router) {
  router.beforeEach((to, from, next) => {
    NProgress.start();
    useCachedViewStoreHook().addCachedView(to);
    setPageTitle(to.meta.title);

    const userStore = useUserStoreHook();
    const isWhiteList = ROUTE_WHITE_LIST.includes(to.name);

    if (userStore.isLoggedIn) {
      if (to.name === "Login") {
        next({ name: "Demo", replace: true });
        return;
      }
      next();
      return;
    }

    if (isWhiteList) {
      next();
      return;
    }

    next({
      name: "Login",
      query: { redirect: to.fullPath },
      replace: true
    });
  });

  router.afterEach(() => {
    NProgress.done();
  });
}
