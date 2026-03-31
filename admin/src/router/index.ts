import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

import AdminLayout from "@/views/layout/AdminLayout.vue";
import LoginPage from "@/views/login/LoginPage.vue";
import DashboardPage from "@/views/dashboard/DashboardPage.vue";
import MediaPage from "@/views/media/MediaPage.vue";
import ArticlesPage from "@/views/articles/ArticlesPage.vue";
import HomeCurationPage from "@/views/home-curation/HomeCurationPage.vue";
import BannersPage from "@/views/banners/BannersPage.vue";
import FlashLinksPage from "@/views/flash-links/FlashLinksPage.vue";
import FlashTagsPage from "@/views/flash-tags/FlashTagsPage.vue";
import PortalUsersPage from "@/views/portal-users/PortalUsersPage.vue";
import StaffUsersPage from "@/views/staff-users/StaffUsersPage.vue";
import VerificationRecordsPage from "@/views/verification-records/VerificationRecordsPage.vue";
import PermissionsPage from "@/views/permissions/PermissionsPage.vue";
import StaffProfilePage from "@/views/profile/StaffProfilePage.vue";
import { clearToken, getToken } from "@/lib/api-client";
import { refreshStaffMe } from "@/lib/staff-session";

const routes: RouteRecordRaw[] = [
  { path: "/login", name: "login", component: LoginPage },
  {
    path: "/",
    component: AdminLayout,
    children: [
      { path: "", redirect: "/dashboard" },
      { path: "dashboard", name: "dashboard", component: DashboardPage },
      { path: "articles", name: "articles", component: ArticlesPage },
      { path: "home-curation", name: "home-curation", component: HomeCurationPage },
      { path: "media", name: "media", component: MediaPage },
      { path: "banners", name: "banners", component: BannersPage },
      { path: "flash-links", name: "flash-links", component: FlashLinksPage },
      { path: "flash-tags", name: "flash-tags", component: FlashTagsPage },
      { path: "portal-users", name: "portal-users", component: PortalUsersPage },
      { path: "staff-users", name: "staff-users", component: StaffUsersPage },
      {
        path: "verification-records",
        name: "verification-records",
        component: VerificationRecordsPage,
      },
      { path: "permissions", name: "permissions", component: PermissionsPage },
      { path: "profile", name: "profile", component: StaffProfilePage },
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
