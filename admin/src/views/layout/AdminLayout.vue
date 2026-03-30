<script setup lang="ts">
import {
  DashboardOutlined,
  FileTextOutlined,
  FolderOutlined,
  HomeOutlined,
  LinkOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  KeyOutlined,
  PictureOutlined,
  SendOutlined,
  UserOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons-vue";
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import HelpTip from "@/components/HelpTip.vue";
import { helpForPath } from "@/page-help";
import { api, clearToken } from "@/lib/api-client";

const route = useRoute();
const router = useRouter();

/** a-sub-menu 的 key，与路由 /content 无关 */
const CONTENT_SUBMENU_KEY = "content";

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
] as const;

/** 归入「内容管理」子菜单的路由前缀 */
const CONTENT_PATH_PREFIXES = ["/articles", "/banners", "/flash-links", "/flash-tags", "/media"] as const;

watch(
  () => route.path,
  (p) => {
    const hit = menuItems.find((i) => p.startsWith(i.path));
    selectedKeys.value = [hit?.key ?? "dashboard"];
    openKeys.value = CONTENT_PATH_PREFIXES.some((prefix) => p.startsWith(prefix))
      ? [CONTENT_SUBMENU_KEY]
      : [];
  },
  { immediate: true }
);

function onMenuClick(e: { key: string }) {
  const item = menuItems.find((i) => i.key === e.key);
  if (item) void router.push(item.path);
}

const title = computed(() => {
  if (route.path.startsWith("/articles")) return "文章管理";
  if (route.path.startsWith("/banners")) return "Banner 管理";
  if (route.path.startsWith("/flash-links")) return "快讯";
  if (route.path.startsWith("/flash-tags")) return "标签管理";
  if (route.path.startsWith("/media")) return "媒体库";
  if (route.path.startsWith("/portal-users")) return "平台用户";
  if (route.path.startsWith("/staff-users")) return "后台账号";
  if (route.path.startsWith("/verification-records")) return "验证发送记录";
  if (route.path.startsWith("/permissions")) return "权限管理";
  return "仪表盘";
});

const pageHelp = computed(() => helpForPath(route.path));

const logout = async () => {
  try {
    await api.auth.logout();
  } finally {
    clearToken();
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
          <a-menu-item key="staff-users">
            <template #icon><UserSwitchOutlined /></template>
            <span>后台账号</span>
          </a-menu-item>
          <a-menu-item key="verification-records">
            <template #icon><SendOutlined /></template>
            <span>验证发送记录</span>
          </a-menu-item>
          <a-menu-item key="permissions">
            <template #icon><KeyOutlined /></template>
            <span>权限管理</span>
          </a-menu-item>

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
          <a-button type="default" @click="logout">
            <template #icon><LogoutOutlined /></template>
            退出
          </a-button>
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
  border-bottom: 1px solid #e7e7e7;
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
  font-size: 15px;
  font-weight: 700;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.right {
  display: flex;
  align-items: center;
  gap: 8px;
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

