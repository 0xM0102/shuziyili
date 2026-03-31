<template>
  <a-config-provider :theme="adminTheme">
    <router-view />
  </a-config-provider>
</template>

<script setup lang="ts">
import type { ThemeConfig } from "ant-design-vue/es/config-provider/context";

/** 与 global.css 中的观感一致；内容区左右留白仍由 AdminLayout `.contentInner { padding: 16px }` 控制 */
const adminTheme: ThemeConfig = {
  token: {
    borderRadius: 8,
    borderRadiusLG: 10,
    colorPrimary: "#1677ff",
    colorBorder: "#e5e8ef",
    colorBorderSecondary: "#eef0f4",
    colorBgLayout: "#f5f7fa",
    colorBgContainer: "#ffffff",
    colorText: "rgba(0, 0, 0, 0.88)",
    colorTextSecondary: "rgba(0, 0, 0, 0.55)",
    colorTextTertiary: "rgba(0, 0, 0, 0.45)",
    controlHeight: 36,
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif',
  },
};
</script>
