import Layout from "@/layout/index.vue";
import Demo from "@/views/demo/index.vue";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/index.vue"),
    meta: {
      title: "登录"
    }
  },
  {
    path: "/",
    name: "root",
    component: Layout,
    redirect: { name: "Login" },
    children: [
      {
        path: "demo",
        name: "Demo",
        component: Demo,
        meta: {
          title: "主页",
          showNavBar: true,
          leftArrow: false,
          showDarkMode: true
        }
      },
      {
        path: "tools",
        name: "Tools",
        component: () => import("@/views/tools/index.vue"),
        meta: {
          title: "工具",
          showNavBar: true,
          leftArrow: false,
          showDarkMode: true
        }
      },
      {
        path: "about",
        name: "About",
        component: () => import("@/views/about/index.vue"),
        meta: {
          title: "关于",
          showNavBar: true,
          leftArrow: false,
          showDarkMode: true,
          noCache: true
        }
      },
      {
        path: "list-demo",
        name: "ListDemo",
        component: () => import("@/views/list/index.vue"),
        meta: {
          title: "全屏列表",
          showNavBar: true,
          leftArrow: true,
          showTabbar: false,
          showDarkMode: true,
          noCache: true
        }
      },
      {
        path: "form-demo",
        name: "FormDemo",
        component: () => import("@/views/form/index.vue"),
        meta: {
          title: "表单示例",
          showNavBar: true,
          leftArrow: true,
          showTabbar: false,
          showDarkMode: true,
          noCache: true
        }
      },
      {
        path: "detail-demo/:id?",
        name: "DetailDemo",
        component: () => import("@/views/detail/index.vue"),
        meta: {
          title: "详情示例",
          showNavBar: true,
          leftArrow: true,
          showTabbar: false,
          showDarkMode: true,
          noCache: true
        }
      },
      {
        path: ":pathMatch(.*)*",
        name: "NotFound",
        component: () => import("@/views/error/404.vue"),
        meta: {
          title: "页面不存在",
          showNavBar: true,
          leftArrow: true,
          showTabbar: false,
          showDarkMode: true,
          noCache: true
        }
      }
    ]
  }
];

export default routes;
