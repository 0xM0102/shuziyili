import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

import AdminLayout from "@/views/layout/AdminLayout.vue";
import LoginPage from "@/views/login/LoginPage.vue";
import { clearToken, getToken } from "@/lib/api-client";
import { refreshStaffMe } from "@/lib/staff-session";

const routes: RouteRecordRaw[] = [
  { path: "/login", name: "login", component: LoginPage },
  {
    path: "/",
    component: AdminLayout,
    children: [
      { path: "", redirect: "/dashboard" },
      {
        path: "dashboard",
        name: "dashboard",
        component: () => import("@/views/dashboard/DashboardPage.vue"),
      },
      {
        path: "articles",
        name: "articles",
        component: () => import("@/views/articles/ArticlesPage.vue"),
      },
      {
        path: "home-curation",
        name: "home-curation",
        component: () => import("@/views/home-curation/HomeCurationPage.vue"),
      },
      { path: "media", name: "media", component: () => import("@/views/media/MediaPage.vue") },
      {
        path: "banners",
        name: "banners",
        component: () => import("@/views/banners/BannersPage.vue"),
      },
      {
        path: "flash-links",
        name: "flash-links",
        component: () => import("@/views/flash-links/FlashLinksPage.vue"),
      },
      {
        path: "flash-tags",
        name: "flash-tags",
        component: () => import("@/views/flash-tags/FlashTagsPage.vue"),
      },
      {
        path: "portal-users",
        name: "portal-users",
        component: () => import("@/views/portal-users/PortalUsersPage.vue"),
      },
      {
        path: "staff-users",
        name: "staff-users",
        component: () => import("@/views/staff-users/StaffUsersPage.vue"),
      },
      {
        path: "verification-records",
        name: "verification-records",
        component: () => import("@/views/verification-records/VerificationRecordsPage.vue"),
      },
      {
        path: "permissions",
        name: "permissions",
        component: () => import("@/views/permissions/PermissionsPage.vue"),
      },
      {
        path: "profile",
        name: "profile",
        component: () => import("@/views/profile/StaffProfilePage.vue"),
      },
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
  const ok = await refreshStaffMe();
  if (!ok) {
    clearToken();
    return { path: "/login" };
  }
  return true;
});

export default router;
