import { defineStore } from "pinia";
import { loginApi } from "@/api/auth";
import { useCachedViewStoreHook } from "@/store/modules/cachedView";
import {
  clearAuthStorage,
  getToken,
  getUserInfo,
  setToken,
  setUserInfo
} from "@/utils/auth-token";
import { store } from "@/store";

export const useUserStore = defineStore({
  id: "user",
  state: () => ({
    token: getToken(),
    userInfo: getUserInfo()
  }),
  getters: {
    isLoggedIn: state => Boolean(state.token)
  },
  actions: {
    /** 登录（对接后端接口，开发环境走 mock） */
    async login(payload) {
      const data = await loginApi(payload);
      this.token = data.token;
      this.userInfo = data.userInfo || null;
      setToken(this.token);
      if (this.userInfo) {
        setUserInfo(this.userInfo);
      }
      return data;
    },
    /** 退出登录 */
    logout() {
      this.resetAuth();
      useCachedViewStoreHook().delAllCachedViews();
    },
    /** 仅清本地登录态（401 时也会调用） */
    resetAuth() {
      this.token = "";
      this.userInfo = null;
      clearAuthStorage();
    }
  }
});

export function useUserStoreHook() {
  return useUserStore(store);
}
