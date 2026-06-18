import { createRouter, createWebHashHistory } from "vue-router";
import routes from "./routes";
import { setupRouterGuard } from "./permission";

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

setupRouterGuard(router);

export default router;
