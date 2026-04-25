import { createApp } from "vue";
import { createPinia } from "pinia";
import "ant-design-vue/dist/reset.css";

import router from "./router";
import App from "./App.vue";
import "./styles/global.css";

createApp(App).use(createPinia()).use(router).mount("#app");

