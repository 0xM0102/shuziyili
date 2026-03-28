import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

import AdminLayout from "@/views/layout/AdminLayout.vue";
import LoginPage from "@/views/login/LoginPage.vue";
import DashboardPage from "@/views/dashboard/DashboardPage.vue";
import ContentPage from "@/views/content/ContentPage.vue";
import MediaPage from "@/views/media/MediaPage.vue";
import ArticlesPage from "@/views/articles/ArticlesPage.vue";
import BannersPage from "@/views/banners/BannersPage.vue";
import PortalUsersPage from "@/views/portal-users/PortalUsersPage.vue";
import StaffUsersPage from "@/views/staff-users/StaffUsersPage.vue";
import { api, clearToken, getToken } from "@/lib/api-client";

const routes: RouteRecordRaw[] = [
  { path: "/login", name: "login", component: LoginPage },
  {
    path: "/",
    component: AdminLayout,
    children: [
      { path: "", redirect: "/dashboard" },
      { path: "dashboard", name: "dashboard", component: DashboardPage },
      { path: "content", name: "content", component: ContentPage },
      { path: "articles", name: "articles", component: ArticlesPage },
      { path: "media", name: "media", component: MediaPage },
      { path: "banners", name: "banners", component: BannersPage },
      { path: "portal-users", name: "portal-users", component: PortalUsersPage },
      { path: "staff-users", name: "staff-users", component: StaffUsersPage },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  if (to.path === "/login") return true;
  const token = getToken();
  if (!token) return { path: "/login" };
  const resp = await api.auth.me();
  if (!resp.ok) {
    clearToken();
    return { path: "/login" };
  }
  return true;
});

export default router;
