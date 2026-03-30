<script setup lang="ts">
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons-vue";
import { onMounted, reactive, ref, watch } from "vue";
import { api } from "@/lib/api-client";
import { mapApiMessage } from "@/lib/auth-messages";
import { message } from "ant-design-vue";

type TargetKind = "FLASH" | "ARTICLE";

type TagRow = {
  id: number;
  targetKind: TargetKind;
  label: string;
  sortOrder: number;
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
};

const loading = ref(false);
const rows = ref<TagRow[]>([]);

const activeKind = ref<TargetKind>("FLASH");

const modalOpen = ref(false);
const saving = ref(false);
const editingId = ref<number | null>(null);

const form = reactive({
  label: "",
  sortOrder: 0,
  enabled: true,
});

function resetForm() {
  form.label = "";
  form.sortOrder = 0;
  form.enabled = true;
  editingId.value = null;
}

async function refresh(kind: TargetKind) {
  loading.value = true;
  try {
    const r = await api.admin.flashTags.list(kind);
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

onMounted(() => {
  void refresh(activeKind.value);
});

watch(
  () => activeKind.value,
  (k) => {
    void refresh(k);
  }
);

function openCreate() {
  resetForm();
  modalOpen.value = true;
}

function openEdit(row: TagRow) {
  editingId.value = row.id;
  form.label = row.label;
  form.sortOrder = row.sortOrder;
  form.enabled = row.enabled;
  modalOpen.value = true;
}

async function save() {
  const label = form.label.trim();
  if (!label) {
    void message.warning("请填写标签名称");
    return;
  }
  saving.value = true;
  try {
    const payload = {
      targetKind: activeKind.value,
      label,
      sortOrder: Number.isFinite(form.sortOrder) ? form.sortOrder : 0,
      enabled: form.enabled,
    };
    const r = editingId.value
      ? await api.admin.flashTags.update(editingId.value, payload)
      : await api.admin.flashTags.create(payload);
    if (!r.ok) {
      void message.error(mapApiMessage(r.message));
      return;
    }
    void message.success("已保存");
    modalOpen.value = false;
    await refresh(activeKind.value);
  } finally {
    saving.value = false;
  }
}

async function remove(id: number) {
  const r = await api.admin.flashTags.remove(id);
  if (!r.ok) {
    void message.error(mapApiMessage(r.message));
    return;
  }
  void message.success("已删除");
  await refresh(activeKind.value);
}

const columns = [
  { title: "标签", dataIndex: "label", key: "label", ellipsis: true },
  { title: "排序", dataIndex: "sortOrder", key: "sortOrder", width: 90 },
  { title: "启用", key: "enabled", dataIndex: "enabled", width: 90 },
  { title: "操作", key: "actions", width: 160 },
];
</script>

<template>
  <a-card :bordered="true" title="标签管理">
    <template #extra>
      <a-space>
        <a-button @click="refresh(activeKind)">
          <template #icon><ReloadOutlined /></template>
          刷新
        </a-button>
        <a-button type="primary" @click="openCreate">
          <template #icon><PlusOutlined /></template>
          新建
        </a-button>
      </a-space>
    </template>

    <a-tabs v-model:activeKey="activeKind" type="line" class="mb-4">
      <a-tab-pane key="FLASH" tab="快讯" />
      <a-tab-pane key="ARTICLE" tab="文章" />
    </a-tabs>

    <p class="mb-4 text-sm text-gray-500">
      标签用于快讯时间线的分类展示。每个分类下标签名称要求唯一。
    </p>

    <a-table
      :columns="columns"
      :data-source="rows"
      :loading="loading"
      row-key="id"
      :pagination="{ pageSize: 20 }"
      size="middle"
      :scroll="{ x: 840 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'enabled'">
          <a-tag v-if="record.enabled" color="success">启用</a-tag>
          <a-tag v-else color="default">停用</a-tag>
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

    <a-modal
      v-model:open="modalOpen"
      :title="editingId ? '编辑标签' : '新建标签'"
      :confirm-loading="saving"
      width="520px"
      @ok="save"
      @cancel="modalOpen = false"
    >
      <a-form layout="vertical">
        <a-form-item label="标签名称" required>
          <a-input v-model:value="form.label" placeholder="例如：便民电话 / 活动提醒" />
        </a-form-item>
        <a-form-item label="排序（越小越靠前）">
          <a-input-number v-model:value="form.sortOrder" :min="0" :step="1" style="width: 100%" />
        </a-form-item>
        <a-form-item label="启用">
          <a-switch v-model:checked="form.enabled" />
        </a-form-item>
      </a-form>
    </a-modal>
  </a-card>
</template>

