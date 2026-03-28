<script setup lang="ts">
import { onMounted, ref } from "vue";
import { api, type PortalUserDto } from "@/lib/api-client";
import { mapApiMessage } from "@/lib/auth-messages";
import { message } from "ant-design-vue";

type Row = PortalUserDto;

const loading = ref(false);
const rows = ref<Row[]>([]);

const editOpen = ref(false);
const savingProfile = ref(false);
const editRow = ref<Row | null>(null);
const editForm = ref({
  displayName: "",
  nickname: "",
  avatarUrl: "",
  bio: "",
});

async function refresh() {
  loading.value = true;
  try {
    const r = await api.admin.portalUsers.list();
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

function openEdit(row: Row) {
  editRow.value = row;
  editForm.value = {
    displayName: row.displayName ?? "",
    nickname: row.nickname ?? "",
    avatarUrl: row.avatarUrl ?? "",
    bio: row.bio ?? "",
  };
  editOpen.value = true;
}

async function saveProfile() {
  const row = editRow.value;
  if (!row) return;
  savingProfile.value = true;
  try {
    const r = await api.admin.portalUsers.updateProfile(row.id, {
      displayName: editForm.value.displayName,
      nickname: editForm.value.nickname,
      avatarUrl: editForm.value.avatarUrl,
      bio: editForm.value.bio,
    });
    if (!r.ok || !r.data) {
      void message.error(mapApiMessage(r.message));
      return;
    }
    void message.success("已保存资料");
    editOpen.value = false;
    editRow.value = null;
    await refresh();
  } finally {
    savingProfile.value = false;
  }
}

const columns = [
  { title: "账号", dataIndex: "identifier", key: "identifier", width: 180 },
  { title: "昵称", dataIndex: "nickname", key: "nickname", width: 120, ellipsis: true },
  { title: "显示名", dataIndex: "displayName", key: "displayName", width: 120, ellipsis: true },
  { title: "注册时间", dataIndex: "createdAt", key: "createdAt", width: 120 },
  { title: "操作", key: "actions", width: 100 },
];

onMounted(() => void refresh());
</script>

<template>
  <a-card title="平台用户" :bordered="true">
    <template #extra>
      <a-button size="small" @click="refresh">刷新</a-button>
    </template>

    <a-alert
      type="info"
      show-icon
      message="说明"
      description="此处为在门户站点注册的客户账号（portal_users），与后台操作员数据完全分离。客户自行在门户注册；你可在此查看并协助修改资料。"
      style="margin-bottom: 12px"
    />

    <a-table
      :columns="columns"
      :data-source="rows"
      :loading="loading"
      row-key="id"
      :pagination="{ pageSize: 20 }"
      size="middle"
      :scroll="{ x: 760 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'createdAt'">
          {{ new Date(record.createdAt).toISOString().slice(0, 10) }}
        </template>
        <template v-if="column.key === 'actions'">
          <a-button type="link" size="small" @click="openEdit(record)">编辑资料</a-button>
        </template>
      </template>
    </a-table>
  </a-card>

  <a-modal
    v-model:open="editOpen"
    title="编辑平台用户资料"
    :confirm-loading="savingProfile"
    width="520px"
    @ok="saveProfile"
  >
    <p v-if="editRow" class="mb-3 text-sm text-gray-500">账号：{{ editRow.identifier }}</p>
    <a-form layout="vertical">
      <a-form-item label="显示名">
        <a-input v-model:value="editForm.displayName" :maxlength="64" show-count />
      </a-form-item>
      <a-form-item label="昵称">
        <a-input v-model:value="editForm.nickname" :maxlength="64" show-count />
      </a-form-item>
      <a-form-item label="头像 URL">
        <a-input v-model:value="editForm.avatarUrl" placeholder="https://..." />
      </a-form-item>
      <a-form-item label="简介">
        <a-textarea v-model:value="editForm.bio" :rows="4" :maxlength="500" show-count />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
