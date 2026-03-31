<script setup lang="ts">
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons-vue";
import { computed, onMounted, reactive, ref, watch } from "vue";
import { api } from "@/lib/api-client";
import { mapApiMessage } from "@/lib/auth-messages";
import { message } from "ant-design-vue";

type LinkKind = "EXTERNAL" | "INTERNAL";

type Row = {
  id: number;
  title: string;
  url: string;
  linkKind: LinkKind;
  sourceLabel: string;
  tagId: number | null;
  sortOrder: number;
  enabled: boolean;
  publishedAt: number;
  createdAt: number;
  updatedAt: number;
};

const loading = ref(false);
const rows = ref<Row[]>([]);
/** 与表格联动：仅前端筛选，不额外请求 */
const listTab = ref<"all" | "internal" | "external">("all");

const filteredRows = computed(() => {
  const t = listTab.value;
  if (t === "internal") return rows.value.filter((r) => r.linkKind === "INTERNAL");
  if (t === "external") return rows.value.filter((r) => r.linkKind === "EXTERNAL");
  return rows.value;
});

const modalOpen = ref(false);
const saving = ref(false);
const editingId = ref<number | null>(null);

const form = reactive({
  linkKind: "EXTERNAL" as LinkKind,
  title: "",
  url: "",
  sourceLabel: "",
  tagId: 0,
  sortOrder: 0,
  enabled: true,
  publishedAtLocal: "",
});

const INTERNAL_SOURCE_LABEL = "数字伊犁平台";
const lastExternalSourceLabel = ref("");
const lastExternalUrl = ref("");
const lastInternalSourceLabel = ref(INTERNAL_SOURCE_LABEL);

watch(
  () => form.linkKind,
  (k, prev) => {
    if (k === prev) return;
    if (k === "INTERNAL") {
      // 切到站内：记录外链信息；站内来源恢复为上次编辑过的值（默认数字伊犁平台）
      lastExternalSourceLabel.value = form.sourceLabel?.trim() || lastExternalSourceLabel.value;
      lastExternalUrl.value = form.url?.trim() || lastExternalUrl.value;
      form.sourceLabel = lastInternalSourceLabel.value || INTERNAL_SOURCE_LABEL;
      form.url = "";
    } else {
      // 切回外链：保存当前站内来源到缓存，并恢复外链来源与 URL
      lastInternalSourceLabel.value = form.sourceLabel?.trim() || lastInternalSourceLabel.value;
      form.sourceLabel = lastExternalSourceLabel.value || "";
      form.url = lastExternalUrl.value || "";
    }
  }
);

function msToLocalInput(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function localInputToMs(s: string): number {
  const t = new Date(s).getTime();
  return Number.isFinite(t) ? t : Date.now();
}

function resetForm() {
  form.linkKind = "EXTERNAL";
  form.title = "";
  form.url = "";
  form.sourceLabel = "";
  form.tagId = 0;
  form.sortOrder = 0;
  form.enabled = true;
  form.publishedAtLocal = msToLocalInput(Date.now());
  editingId.value = null;
}

const loadingTags = ref(false);
const flashTagOptions = ref<{ label: string; value: number }[]>([]);

async function refreshTags() {
  loadingTags.value = true;
  try {
    const r = await api.admin.flashTags.list("FLASH");
    if (!r.ok || !r.data) {
      flashTagOptions.value = [{ label: "无标签", value: 0 }];
      return;
    }
    flashTagOptions.value = [
      { label: "无标签", value: 0 },
      ...r.data.items.map((t) => ({ label: t.label, value: t.id })),
    ];
  } finally {
    loadingTags.value = false;
  }
}

async function refresh() {
  loading.value = true;
  try {
    const r = await api.admin.flashLinks.list();
    if (!r.ok || !r.data) {
      rows.value = [];
      void message.error(mapApiMessage(r.message));
      return;
    }
    rows.value = r.data.items.map((it) => ({
      ...it,
      linkKind: it.linkKind === "INTERNAL" ? "INTERNAL" : "EXTERNAL",
    }));
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  resetForm();
  if (listTab.value === "internal") form.linkKind = "INTERNAL";
  else if (listTab.value === "external") form.linkKind = "EXTERNAL";
  if (form.linkKind === "INTERNAL") {
    form.sourceLabel = INTERNAL_SOURCE_LABEL;
  }
  modalOpen.value = true;
}

function openEdit(row: Row) {
  editingId.value = row.id;
  form.linkKind = row.linkKind === "INTERNAL" ? "INTERNAL" : "EXTERNAL";
  form.title = row.title;
  form.url = row.linkKind === "EXTERNAL" ? row.url : "";
  form.sourceLabel = row.sourceLabel || (row.linkKind === "INTERNAL" ? INTERNAL_SOURCE_LABEL : "");
  form.tagId = row.tagId ?? 0;
  form.sortOrder = row.sortOrder;
  form.enabled = row.enabled;
  form.publishedAtLocal = msToLocalInput(row.publishedAt);

  // 进入编辑态时同步“外链缓存”，避免切换类型后丢失你原来填的外链信息
  if (row.linkKind === "EXTERNAL") {
    lastExternalUrl.value = row.url || lastExternalUrl.value;
    lastExternalSourceLabel.value = row.sourceLabel || lastExternalSourceLabel.value;
  }

  modalOpen.value = true;
}

async function save() {
  const title = form.title.trim();
  const url = form.url.trim();
  if (!title) {
    void message.warning("请填写快讯内容");
    return;
  }
  if (form.linkKind === "EXTERNAL" && !url) {
    void message.warning("请填写跳转链接");
    return;
  }
  const publishedAt = localInputToMs(form.publishedAtLocal);
  saving.value = true;
  try {
    const payload = {
      linkKind: form.linkKind,
      title,
      url: form.linkKind === "EXTERNAL" ? url : "",
      // INTERNAL 也允许手工编辑 sourceLabel；空值由后端兜底为数字伊犁平台
      sourceLabel: form.sourceLabel.trim(),
      tagId: form.tagId === 0 ? null : form.tagId,
      sortOrder: Number.isFinite(form.sortOrder) ? form.sortOrder : 0,
      enabled: form.enabled,
      publishedAt,
    };
    const r = editingId.value
      ? await api.admin.flashLinks.update(editingId.value, payload)
      : await api.admin.flashLinks.create(payload);
    if (!r.ok) {
      void message.error(mapApiMessage(r.message));
      return;
    }
    void message.success("已保存");
    modalOpen.value = false;
    await refresh();
  } finally {
    saving.value = false;
  }
}

async function remove(id: number) {
  const r = await api.admin.flashLinks.remove(id);
  if (!r.ok) {
    void message.error(mapApiMessage(r.message));
    return;
  }
  void message.success("已删除");
  await refresh();
}

function fmtTime(ms: number) {
  return new Date(ms).toLocaleString("zh-CN", { hour12: false });
}

function kindLabel(k: LinkKind) {
  return k === "INTERNAL" ? "站内" : "外链";
}

function tagLabelById(tagId: number | null) {
  if (!tagId) return "无";
  return flashTagOptions.value.find((o) => o.value === tagId)?.label ?? `#${tagId}`;
}

const columns = [
  { title: "类型", dataIndex: "linkKind", key: "linkKind", width: 72 },
  { title: "快讯内容", dataIndex: "title", key: "title", ellipsis: true },
  { title: "来源", dataIndex: "sourceLabel", key: "sourceLabel", width: 120, ellipsis: true },
  {
    title: "标签",
    dataIndex: "tagId",
    key: "tagId",
    width: 90,
  },
  { title: "发布时间", key: "publishedAt", width: 170 },
  { title: "排序", dataIndex: "sortOrder", key: "sortOrder", width: 72 },
  { title: "启用", key: "enabled", width: 72 },
  { title: "操作", key: "actions", width: 140 },
];

onMounted(() => {
  void refreshTags();
  void refresh();
});
</script>

<template>
  <a-card :bordered="true" title="快讯">
    <template #extra>
      <a-space>
        <a-button @click="refresh">
          <template #icon><ReloadOutlined /></template>
          刷新
        </a-button>
        <a-button type="primary" @click="openCreate">
          <template #icon><PlusOutlined /></template>
          新建
        </a-button>
      </a-space>
    </template>

    <a-tabs v-model:activeKey="listTab" type="line" class="mb-4">
      <a-tab-pane key="all" tab="全部" />
      <a-tab-pane key="internal" tab="站内" />
      <a-tab-pane key="external" tab="外链" />
    </a-tabs>

    <a-table
      :columns="columns"
      :data-source="filteredRows"
      :loading="loading"
      row-key="id"
      :pagination="{ pageSize: 20 }"
      size="middle"
      :scroll="{ x: 980 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'linkKind'">
          <a-tag :color="record.linkKind === 'INTERNAL' ? 'blue' : 'default'"> {{ kindLabel(record.linkKind) }} </a-tag>
        </template>
        <template v-if="column.key === 'tagId'">
          {{ tagLabelById(record.tagId) }}
        </template>
        <template v-if="column.key === 'publishedAt'">
          {{ fmtTime(record.publishedAt) }}
        </template>
        <template v-if="column.key === 'enabled'">
          <a-tag v-if="record.enabled" color="success">是</a-tag>
          <a-tag v-else color="default">否</a-tag>
        </template>
        <template v-if="column.key === 'actions'">
          <a-space>
            <a-button type="link" size="small" @click="openEdit(record)">编辑</a-button>
            <a-popconfirm title="确定删除？" @confirm="remove(record.id)">
              <a-button type="link" danger size="small">删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>
  </a-card>

  <a-modal
    v-model:open="modalOpen"
    :title="editingId ? '编辑快讯' : '新建快讯'"
    :confirm-loading="saving"
    width="560px"
    @ok="save"
    @cancel="modalOpen = false"
  >
    <a-form layout="vertical">
      <a-form-item label="类型" required>
        <a-radio-group v-model:value="form.linkKind">
          <a-radio value="EXTERNAL">外链（点文字后打开第三方页面）</a-radio>
          <a-radio value="INTERNAL">站内（仅展示这段文字，不跳转文章）</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="快讯内容" required>
        <a-textarea
          v-model:value="form.title"
          :rows="4"
          :maxlength="500"
          show-count
          placeholder="门户上展示的那一段文字；可一行或多行。"
        />
      </a-form-item>
      <a-form-item v-if="form.linkKind === 'EXTERNAL'" label="跳转链接" required>
        <a-input v-model:value="form.url" placeholder="https://..." />
        <div class="mt-1 text-xs text-gray-500">用户点击快讯标题或「访问原文」时在新窗口打开。</div>
      </a-form-item>
      <a-form-item label="标签">
        <a-select :loading="loadingTags" v-model:value="form.tagId" :options="flashTagOptions" />
      </a-form-item>
      <a-form-item label="来源标注">
        <a-input
          v-model:value="form.sourceLabel"
          :placeholder="form.linkKind === 'INTERNAL' ? '数字伊犁平台（可编辑）' : '可选，如：伊犁州政府网'"
        />
      </a-form-item>
      <a-form-item label="发布时间">
        <a-input v-model:value="form.publishedAtLocal" type="datetime-local" />
      </a-form-item>
      <a-form-item label="排序（越小越靠前）">
        <a-input-number v-model:value="form.sortOrder" :min="0" :step="1" style="width: 100%" />
      </a-form-item>
      <a-form-item label="启用">
        <a-switch v-model:checked="form.enabled" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
