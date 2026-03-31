<script setup lang="ts">
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons-vue";
import { onMounted, ref, watch } from "vue";
import { api } from "@/lib/api-client";
import { formatArticleStatus } from "@/lib/article-ui";
import { mapApiMessage } from "@/lib/auth-messages";
import { message } from "ant-design-vue";

type SlotRow = {
  slotId: number;
  articleId: string;
  title: string;
  status: string;
  sortOrder: number;
};

type ArticlePick = {
  id: string;
  title: string;
  status: string;
};

const loading = ref(false);
const saving = ref(false);
const rows = ref<SlotRow[]>([]);

const pickOpen = ref(false);
const articlesLoading = ref(false);
const articleRows = ref<ArticlePick[]>([]);

async function loadSlots() {
  loading.value = true;
  try {
    const r = await api.admin.listHomeArticleSlots();
    if (!r.ok || !r.data) {
      rows.value = [];
      void message.error(mapApiMessage(r.message));
      return;
    }
    rows.value = r.data.items;
  } finally {
    loading.value = false;
  }
}

async function saveOrder() {
  saving.value = true;
  try {
    const ids = rows.value.map((x) => x.articleId);
    const r = await api.admin.replaceHomeArticleSlots(ids);
    if (!r.ok) {
      void message.error(mapApiMessage(r.message));
      return;
    }
    void message.success("已保存");
    await loadSlots();
  } finally {
    saving.value = false;
  }
}

function move(idx: number, delta: number) {
  const j = idx + delta;
  if (j < 0 || j >= rows.value.length) return;
  const arr = [...rows.value];
  const t = arr[idx]!;
  arr[idx] = arr[j]!;
  arr[j] = t;
  rows.value = arr.map((r, i) => ({ ...r, sortOrder: i }));
}

function removeAt(idx: number) {
  rows.value = rows.value.filter((_, i) => i !== idx);
}

async function openPick() {
  pickOpen.value = true;
  articlesLoading.value = true;
  try {
    const r = await api.admin.listArticles();
    if (!r.ok || !r.data) {
      articleRows.value = [];
      void message.error(mapApiMessage(r.message));
      return;
    }
    const taken = new Set(rows.value.map((x) => x.articleId));
    articleRows.value = r.data.items
      .filter((a) => !taken.has(a.id))
      .map((a) => ({ id: a.id, title: a.title, status: a.status }));
  } finally {
    articlesLoading.value = false;
  }
}

function addArticle(a: ArticlePick) {
  const nextOrder = rows.value.length;
  rows.value = [
    ...rows.value,
    {
      slotId: 0,
      articleId: a.id,
      title: a.title,
      status: a.status,
      sortOrder: nextOrder,
    },
  ];
  pickOpen.value = false;
  void message.success("已加入列表，请保存");
}

const articleColumns = [
  { title: "标题", dataIndex: "title", key: "title", ellipsis: true },
  { title: "状态", dataIndex: "status", key: "status", width: 100 },
  { title: "操作", key: "act", width: 100 },
];

const columns = [
  { title: "顺序", key: "ord", width: 72 },
  { title: "标题", dataIndex: "title", key: "title", ellipsis: true },
  { title: "状态", dataIndex: "status", key: "status", width: 100 },
  { title: "文章 ID", dataIndex: "articleId", key: "articleId", width: 200, ellipsis: true },
  { title: "操作", key: "actions", width: 200 },
];

onMounted(() => void loadSlots());
</script>

<template>
  <a-card :bordered="true">
    <template #title>首页运营</template>
    <template #extra>
      <a-space wrap>
        <a-button size="small" @click="loadSlots">
          <template #icon><ReloadOutlined /></template>
          刷新
        </a-button>
        <a-button type="primary" :loading="saving" @click="saveOrder">保存当前顺序</a-button>
      </a-space>
    </template>

    <a-alert
      type="info"
      show-icon
      class="mb-4"
      message="与「文章管理」独立：此处仅维护首页「数伊精选」展示哪些已发布文章及顺序。门户只展示已发布文章。"
    />
    <p class="mb-3 text-sm text-gray-500">数伊精选（首页顶部「今日推荐」与精选列表）</p>

    <a-space class="mb-3">
      <a-button type="primary" @click="openPick">
        <template #icon><PlusOutlined /></template>
        添加文章
      </a-button>
    </a-space>

    <a-table
      :columns="columns"
      :data-source="rows"
      :loading="loading"
      row-key="articleId"
      :pagination="false"
      size="middle"
    >
      <template #bodyCell="{ column, index, record }">
        <template v-if="column.key === 'ord'">{{ (index ?? 0) + 1 }}</template>
        <template v-else-if="column.key === 'status'">{{ formatArticleStatus(record.status) }}</template>
        <template v-else-if="column.key === 'actions'">
          <a-space>
            <a-button
              type="link"
              size="small"
              :disabled="index === 0"
              @click="move(index!, -1)"
            >
              <ArrowUpOutlined />
            </a-button>
            <a-button
              type="link"
              size="small"
              :disabled="index === rows.length - 1"
              @click="move(index!, 1)"
            >
              <ArrowDownOutlined />
            </a-button>
            <a-button type="link" size="small" danger @click="removeAt(index!)">移除</a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-modal v-model:open="pickOpen" title="选择文章" width="720px" :footer="null">
      <a-table
        :columns="articleColumns"
        :data-source="articleRows"
        :loading="articlesLoading"
        row-key="id"
        size="small"
        :pagination="{ pageSize: 8 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">{{ formatArticleStatus(record.status) }}</template>
          <template v-else-if="column.key === 'act'">
            <a-button type="link" size="small" @click="addArticle(record as ArticlePick)">加入</a-button>
          </template>
        </template>
      </a-table>
    </a-modal>
  </a-card>
</template>
