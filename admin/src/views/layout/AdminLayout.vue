<script setup lang="ts">
import {
  CalendarOutlined,
  ControlOutlined,
  DashboardOutlined,
  FileTextOutlined,
  FolderOutlined,
  HomeOutlined,
  LinkOutlined,
  StarOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  KeyOutlined,
  PictureOutlined,
  PhoneOutlined,
  SendOutlined,
  SettingOutlined,
  UserOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons-vue";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import HelpTip from "@/components/HelpTip.vue";
import { helpForPath } from "@/page-help";
import { api, clearToken } from "@/lib/api-client";
import { refreshStaffMe, staffMe } from "@/lib/staff-session";
import { getStaffAvatarInitial } from "@/lib/staff-ui";

const route = useRoute();
const router = useRouter();

/** a-sub-menu 的 key，与路由路径无关 */
const CONTENT_SUBMENU_KEY = "content";
const ADMIN_SUBMENU_KEY = "admin";

const collapsed = ref(false);
const selectedKeys = ref<string[]>([]);
/** 展开的子菜单（如「内容管理」） */
const openKeys = ref<string[]>([]);

/** 仅叶子菜单项可跳转；顺序即侧栏展示顺序 */
const menuItems = [
  { key: "dashboard", path: "/dashboard" },
  { key: "portal-users", path: "/portal-users" },
  { key: "staff-users", path: "/staff-users" },
  { key: "verification-records", path: "/verification-records" },
  { key: "permissions", path: "/permissions" },
  { key: "articles", path: "/articles" },
  { key: "banners", path: "/banners" },
  { key: "flash-links", path: "/flash-links" },
  { key: "flash-tags", path: "/flash-tags" },
  { key: "media", path: "/media" },
  { key: "home-curation", path: "/home-curation" },
  { key: "events", path: "/events" },
  { key: "convenience", path: "/convenience" },
] as const;

/** 归入「内容管理」子菜单的路由前缀 */
const CONTENT_PATH_PREFIXES = [
  "/articles",
  "/home-curation",
  "/banners",
  "/flash-links",
  "/flash-tags",
  "/media",
  "/events",
  "/convenience",
] as const;
/** 归入「后台管理」子菜单的路由前缀 */
const ADMIN_PATH_PREFIXES = ["/staff-users", "/permissions", "/verification-records"] as const;
const PAGE_TITLES = [
  { prefix: "/articles", title: "文章管理" },
  { prefix: "/home-curation", title: "首页运营" },
  { prefix: "/banners", title: "Banner 管理" },
  { prefix: "/flash-links", title: "快讯" },
  { prefix: "/flash-tags", title: "标签管理" },
  { prefix: "/media", title: "媒体库" },
  { prefix: "/events", title: "活动管理" },
  { prefix: "/convenience", title: "便民管理" },
  { prefix: "/portal-users", title: "平台用户" },
  { prefix: "/staff-users", title: "后台账号" },
  { prefix: "/verification-records", title: "验证发送记录" },
  { prefix: "/permissions", title: "权限管理" },
  { prefix: "/profile", title: "个人设置" },
] as const;

watch(
  () => route.path,
  (p) => {
    const hit = menuItems.find((i) => p.startsWith(i.path));
    selectedKeys.value = [hit?.key ?? "dashboard"];
    const open: string[] = [];
    if (ADMIN_PATH_PREFIXES.some((prefix) => p.startsWith(prefix))) open.push(ADMIN_SUBMENU_KEY);
    if (CONTENT_PATH_PREFIXES.some((prefix) => p.startsWith(prefix))) open.push(CONTENT_SUBMENU_KEY);
    openKeys.value = open;
  },
  { immediate: true }
);

function onMenuClick(e: { key: string }) {
  const item = menuItems.find((i) => i.key === e.key);
  if (item) void router.push(item.path);
}

const title = computed(() => {
  const hit = PAGE_TITLES.find((item) => route.path.startsWith(item.prefix));
  return hit?.title ?? "仪表盘";
});

const staffAvatarText = computed(() => {
  const m = staffMe.value;
  if (!m) return "?";
  return getStaffAvatarInitial(m);
});

onMounted(() => void refreshStaffMe());

const pageHelp = computed(() => helpForPath(route.path));

const logout = async () => {
  try {
    await api.auth.logout();
  } finally {
    clearToken();
    staffMe.value = null;
    await router.push("/login");
  }
};
</script>

<template>
  <a-layout class="root">
    <a-layout-sider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      class="sider"
      width="220"
    >
      <div class="brand">
        <img src="/yl_logo.svg" alt="" class="logo" width="32" height="32" />
        <div class="brandLines">
          <span class="name">数字伊犁</span>
          <span class="sub">管理后台</span>
        </div>
      </div>
      <div class="siderMenuWrap">
        <a-menu
          v-model:selectedKeys="selectedKeys"
          v-model:openKeys="openKeys"
          theme="dark"
          mode="inline"
          @click="onMenuClick"
        >
          <a-menu-item key="dashboard">
            <template #icon><DashboardOutlined /></template>
            <span>仪表盘</span>
          </a-menu-item>
          <a-menu-item key="portal-users">
            <template #icon><UserOutlined /></template>
            <span>平台用户</span>
          </a-menu-item>

          <a-sub-menu :key="ADMIN_SUBMENU_KEY">
            <template #title>
              <span class="subMenuTitle">
                <ControlOutlined class="subMenuIcon" />
                <span>后台管理</span>
              </span>
            </template>
            <a-menu-item key="staff-users">
              <template #icon><UserSwitchOutlined /></template>
              <span>后台账号</span>
            </a-menu-item>
            <a-menu-item key="permissions">
              <template #icon><KeyOutlined /></template>
              <span>权限管理</span>
            </a-menu-item>
            <a-menu-item key="verification-records">
              <template #icon><SendOutlined /></template>
              <span>验证发送记录</span>
            </a-menu-item>
          </a-sub-menu>

          <a-sub-menu :key="CONTENT_SUBMENU_KEY">
            <template #title>
              <span class="subMenuTitle">
                <FolderOutlined class="subMenuIcon" />
                <span>内容管理</span>
              </span>
            </template>
            <a-menu-item key="articles">
              <template #icon><FileTextOutlined /></template>
              <span>文章管理</span>
            </a-menu-item>
            <a-menu-item key="home-curation">
              <template #icon><StarOutlined /></template>
              <span>首页运营</span>
            </a-menu-item>
            <a-menu-item key="banners">
              <template #icon><HomeOutlined /></template>
              <span>Banner 管理</span>
            </a-menu-item>
            <a-menu-item key="flash-links">
              <template #icon><LinkOutlined /></template>
              <span>快讯</span>
            </a-menu-item>
            <a-menu-item key="flash-tags">
              <template #icon><FileTextOutlined /></template>
              <span>标签管理</span>
            </a-menu-item>
            <a-menu-item key="media">
              <template #icon><PictureOutlined /></template>
              <span>媒体库</span>
            </a-menu-item>
            <a-menu-item key="events">
              <template #icon><CalendarOutlined /></template>
              <span>活动管理</span>
            </a-menu-item>
            <a-menu-item key="convenience">
              <template #icon><PhoneOutlined /></template>
              <span>便民管理</span>
            </a-menu-item>
          </a-sub-menu>
        </a-menu>
      </div>
    </a-layout-sider>

    <a-layout class="main">
      <a-layout-header class="header">
        <div class="left">
          <a-button type="text" class="iconBtn" aria-label="展开或收起侧栏" @click="collapsed = !collapsed">
            <template #icon>
              <MenuUnfoldOutlined v-if="collapsed" />
              <MenuFoldOutlined v-else />
            </template>
          </a-button>
          <span class="pageTitle">{{ title }}</span>
          <HelpTip v-if="pageHelp" :content="pageHelp" />
        </div>

        <div class="right">
          <a-dropdown v-if="staffMe" placement="bottomRight">
            <span class="avatarTrigger" role="button" tabindex="0" aria-label="账号菜单">
              <img
                v-if="staffMe.avatarUrl"
                :key="staffMe.avatarUrl"
                :src="staffMe.avatarUrl"
                alt=""
                class="headerAvatarImg"
              />
              <a-avatar v-else :size="32">{{ staffAvatarText }}</a-avatar>
            </span>
            <template #overlay>
              <a-menu>
                <a-menu-item key="profile" @click="router.push('/profile')">
                  <SettingOutlined />
                  个人设置
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout" danger @click="logout">
                  <LogoutOutlined />
                  退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <a-layout-content class="content">
        <div class="contentInner">
          <router-view />
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<style scoped>
.root {
  height: 100%;
  overflow: hidden;
}
.sider {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  box-shadow: 4px 0 20px rgba(0, 21, 41, 0.12);
}
.siderMenuWrap {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 12px;
  color: rgba(255, 255, 255, 0.92);
  font-weight: 700;
  letter-spacing: 0.2px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.logo {
  flex: 0 0 auto;
  object-fit: contain;
}
.brandLines {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  line-height: 1.2;
}
.name {
  font-size: 16px;
}
.sub {
  font-size: 12px;
  opacity: 0.75;
  font-weight: 600;
}
.main {
  min-width: 0;
  overflow: hidden;
}
.header {
  height: 64px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border-bottom: 1px solid #eef0f4;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.06);
}
.left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.iconBtn {
  width: 40px;
  height: 40px;
}
.pageTitle {
  font-size: 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.88);
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.avatarTrigger {
  display: inline-flex;
  cursor: pointer;
  line-height: 1;
  border-radius: 50%;
  outline: none;
  transition: box-shadow 0.2s ease;
}
.avatarTrigger:hover {
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.25);
}
.avatarTrigger:focus-visible {
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px #1677ff;
}

.headerAvatarImg {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}
.content {
  height: calc(100% - 64px);
  overflow: auto;
  background: #f5f7fa;
}
.contentInner {
  padding: 16px;
  min-width: 0;
}
.subMenuTitle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.subMenuIcon {
  font-size: 14px;
}
</style>
