<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api, clearToken } from "@/lib/api-client";

const route = useRoute();
const router = useRouter();

const collapsed = ref(false);
const selectedKeys = ref<string[]>([]);

const menuItems = [
  { key: "dashboard", label: "仪表盘", path: "/dashboard" },
  { key: "portal-users", label: "平台用户", path: "/portal-users" },
  { key: "staff-users", label: "后台账号", path: "/staff-users" },
  { key: "articles", label: "文章管理", path: "/articles" },
  { key: "banners", label: "首页配置", path: "/banners" },
  { key: "media", label: "媒体库", path: "/media" },
] as const;

watch(
  () => route.path,
  (p) => {
    const hit = menuItems.find((i) => p.startsWith(i.path));
    selectedKeys.value = [hit?.key ?? "dashboard"];
  },
  { immediate: true }
);

const title = computed(() => {
  if (route.path.startsWith("/articles")) return "文章管理";
  if (route.path.startsWith("/banners")) return "首页配置";
  if (route.path.startsWith("/media")) return "媒体库";
  if (route.path.startsWith("/portal-users")) return "平台用户";
  if (route.path.startsWith("/staff-users")) return "后台账号";
  return "仪表盘";
});

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
        <div class="dot" />
        <span class="name">数字伊犁</span>
        <span class="sub">管理后台</span>
      </div>
      <div class="siderMenuWrap">
        <a-menu
          theme="dark"
          mode="inline"
          :selectedKeys="selectedKeys"
          @click="
            (e: { key: string }) => {
              const item = menuItems.find((i) => i.key === e.key);
              if (item) router.push(item.path);
            }
          "
        >
          <a-menu-item key="dashboard">仪表盘</a-menu-item>
          <a-menu-item key="portal-users">平台用户</a-menu-item>
          <a-menu-item key="staff-users">后台账号</a-menu-item>
          <a-menu-item key="articles">文章管理</a-menu-item>
          <a-menu-item key="banners">首页配置</a-menu-item>
          <a-menu-item key="media">媒体库</a-menu-item>
        </a-menu>
      </div>
    </a-layout-sider>

    <a-layout class="main">
      <a-layout-header class="header">
        <div class="left">
          <a-button type="text" class="iconBtn" @click="collapsed = !collapsed">
            <span class="hamburger">≡</span>
          </a-button>
          <span class="pageTitle">{{ title }}</span>
        </div>

        <div class="right">
          <a-button type="default" @click="logout">退出</a-button>
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
  align-items: baseline;
  gap: 8px;
  padding: 16px 14px;
  color: rgba(255, 255, 255, 0.92);
  font-weight: 700;
  letter-spacing: 0.2px;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #2174ff;
  flex: 0 0 auto;
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
.hamburger {
  font-size: 18px;
  line-height: 1;
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
</style>

