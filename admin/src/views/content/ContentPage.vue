<script setup lang="ts">
import { onMounted, ref } from "vue";
import { api } from "@/lib/api-client";
import { mapApiMessage } from "@/lib/auth-messages";
import { message } from "ant-design-vue";

type Row = {
  key: string;
  title: string;
  status: string;
  updatedAt: string;
};

const loading = ref(false);
const rows = ref<Row[]>([]);

const columns = [
  { title: "标题", dataIndex: "title", key: "title" },
  { title: "状态", dataIndex: "status", key: "status" },
  { title: "更新时间", dataIndex: "updatedAt", key: "updatedAt" },
];

async function refresh() {
  loading.value = true;
  try {
    const resp = await api.admin.listArticles();
    if (!resp.ok || !resp.data) {
      rows.value = [];
      void message.error(mapApiMessage(resp.message));
      return;
    }
    rows.value = resp.data.items.map((it) => ({
      key: it.id,
      title: it.title,
      status: it.status === "published" ? "已发布" : "草稿",
      updatedAt: new Date(it.updatedAt).toISOString().slice(0, 10),
    }));
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void refresh();
});
</script>

<template>
  <a-card title="内容管理（旧占位，已由「文章管理」替代）" :bordered="true">
    <a-space direction="vertical" size="middle" style="width: 100%">
      <a-segmented :options="['资讯', '活动', '便民', '旅游']" :value="'资讯'" disabled />

      <a-table
        :columns="columns"
        :data-source="rows"
        :loading="loading"
        :pagination="false"
        size="middle"
      />
    </a-space>
  </a-card>
</template>

