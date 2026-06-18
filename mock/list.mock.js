import { defineMock } from "vite-plugin-mock-dev-server";

const TOTAL = 80;

export default defineMock([
  {
    url: "/dev-api/list/get",
    delay: 500,
    body({ query }) {
      const page = Number(query.page) || 1;
      const pageSize = Number(query.pageSize) || 10;
      const start = (page - 1) * pageSize;
      const list = [];

      for (let i = 0; i < pageSize && start + i < TOTAL; i += 1) {
        const id = start + i + 1;
        list.push({
          id,
          title: `列表示例 ${id}`
        });
      }

      return {
        code: 200,
        message: "OK",
        result: {
          list,
          total: TOTAL,
          page,
          pageSize
        }
      };
    }
  },
  {
    url: "/dev-api/list/error",
    delay: 500,
    body: {
      code: 40010,
      message: "ERROR",
      result: null
    }
  }
]);
