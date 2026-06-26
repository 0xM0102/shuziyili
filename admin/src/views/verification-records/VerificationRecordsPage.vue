<script setup lang="ts">
import { ReloadOutlined } from "@ant-design/icons-vue";
import { onMounted, ref } from "vue";
import { api } from "@/lib/api-client";
import { mapApiMessage } from "@/lib/auth-messages";
import { message } from "ant-design-vue";

type Row = {
  id: number;
  recipient: string;
  scene: string;
  createdAt: number;
  expiresAt: number;
  used: boolean;
  usedAt: number;
  plainCode: string | null;
  requestOrigin: string | null;
};

const loading = ref(false);
const rows = ref<Row[]>([]);
const total = ref(0);
const page = ref(0);
const pageSize = ref(50);

function sceneLabel(s: string) {
  if (s === "login") return "登录";
  if (s === "register") return "注册";
  return s;
}

async function refresh() {
  loading.value = true;
  try {
    const r = await api.admin.verificationRecords.list(page.value, pageSize.value);
    if (!r.ok || !r.data) {
      rows.value = [];
      total.value = 0;
      void message.error(mapApiMessage(r.message));
      return;
    }
    rows.value = r.data.items;
    total.value = r.data.total;
  } finally {
    loading.value = false;
  }
}

function onTableChange(pag: { current?: number; pageSize?: number }) {
  page.value = (pag.current ?? 1) - 1;
  pageSize.value = pag.pageSize ?? 50;
  void refresh();
}

const columns = [
  { title: "接收方", dataIndex: "recipient", key: "recipient", ellipsis: true, width: 200 },
  { title: "来源", key: "requestOrigin", ellipsis: true, width: 180 },
  { title: "验证码", key: "plainCode", width: 100 },
  { title: "场景", key: "scene", width: 88 },
  { title: "发送时间", key: "createdAt", width: 170 },
  { title: "过期时间", key: "expiresAt", width: 170 },
  { title: "状态", key: "used", width: 88 },
  { title: "核销时间", key: "usedAt", width: 170 },
];

function fmt(ms: number) {
  if (!ms) return "—";
  return new Date(ms).toLocaleString("zh-CN", { hour12: false });
}

onMounted(() => void refresh());
</script>

<template>
  <a-card :bordered="true">
    <template #extra>
      <a-button size="small" @click="refresh">
        <template #icon><ReloadOutlined /></template>
        刷新
      </a-button>
    </template>

    <a-table
      :columns="columns"
      :data-source="rows"
      :loading="loading"
      row-key="id"
      :pagination="{
        current: page + 1,
        pageSize: pageSize,
        total: total,
        showSizeChanger: true,
        pageSizeOptions: ['20', '50', '100'],
        showTotal: (t: number) => `共 ${t} 条`,
      }"
      size="middle"
      :scroll="{ x: 1280 }"
      @change="onTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'plainCode'">
          <span class="mono">{{ record.plainCode ?? "—" }}</span>
        </template>
        <template v-if="column.key === 'requestOrigin'">
          <span :title="record.requestOrigin ?? undefined">{{ record.requestOrigin ?? "—" }}</span>
        </template>
        <template v-if="column.key === 'scene'">
          {{ sceneLabel(record.scene) }}
        </template>
        <template v-if="column.key === 'createdAt'">
          {{ fmt(record.createdAt) }}
        </template>
        <template v-if="column.key === 'expiresAt'">
          {{ fmt(record.expiresAt) }}
        </template>
        <template v-if="column.key === 'used'">
          <a-tag :color="record.used ? 'default' : 'processing'">
            {{ record.used ? "已用" : "未用" }}
          </a-tag>
        </template>
        <template v-if="column.key === 'usedAt'">
          {{ record.used ? fmt(record.usedAt) : "—" }}
        </template>
      </template>
    </a-table>
  </a-card>
</template>

<style scoped>
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  letter-spacing: 0.06em;
}
</style>
