import { defineMock } from "vite-plugin-mock-dev-server";

export default defineMock([
  {
    url: "/dev-api/auth/login",
    method: "POST",
    delay: 400,
    body({ body }) {
      const username = body?.username?.trim?.() || "";
      const password = body?.password?.trim?.() || "";

      if (!username || !password) {
        return {
          code: 400,
          message: "请输入账号和密码",
          result: null
        };
      }

      return {
        code: 200,
        message: "OK",
        result: {
          token: `mock-token-${Date.now()}`,
          userInfo: {
            username,
            nickname: username
          }
        }
      };
    }
  }
]);
