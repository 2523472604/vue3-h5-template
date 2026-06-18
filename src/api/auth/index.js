import { http } from "@/utils/http";

/**
 * 登录
 * @param {{ username: string, password: string }} data
 * @returns {Promise<{ token: string, userInfo?: object }>}
 */
export function loginApi(data) {
  return http.request({
    url: "/auth/login",
    method: "post",
    data,
    headers: {
      "Content-Type": "application/json"
    }
  });
}
