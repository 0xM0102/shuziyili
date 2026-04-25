import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import Components from "unplugin-vue-components/vite";
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";

export default defineConfig({
  plugins: [
    vue(),
    // Auto-import Ant Design Vue components used in templates.
    // This avoids globally registering the entire component library.
    Components({
      dts: true,
      resolvers: [AntDesignVueResolver({ importStyle: false })],
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5174,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("/node_modules/ant-design-vue/")) return "vendor-antd";
          if (id.includes("/node_modules/@ant-design/icons-vue/")) return "vendor-antd-icons";
          if (id.includes("/node_modules/markdown-it/")) return "vendor-markdown";
          if (id.includes("/node_modules/pinia/")) return "vendor-pinia";
          return "vendor-misc";
        },
      },
    },
  },
});

