import router from "@/router";
import { clearAuthStorage } from "@/utils/auth-token";

let isHandling = false;

/** 401 未授权：清凭证并跳转登录 */
export async function handleUnauthorized() {
  if (isHandling) return;
  isHandling = true;

  clearAuthStorage();

  try {
    const { useUserStoreHook } = await import("@/store/modules/user");
    useUserStoreHook().resetAuth();
  } catch {
    // ignore
  }

  if (router.currentRoute.value.name !== "Login") {
    await router.replace({
      name: "Login",
      query: { redirect: router.currentRoute.value.fullPath }
    });
  }

  isHandling = false;
}
