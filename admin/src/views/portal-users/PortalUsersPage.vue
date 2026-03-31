<script setup lang="ts">
import { ReloadOutlined } from "@ant-design/icons-vue";
import { onMounted, ref } from "vue";
import { api, type PortalUserDto } from "@/lib/api-client";
import { mapApiMessage } from "@/lib/auth-messages";
import { message } from "ant-design-vue";

type Row = PortalUserDto;

const loading = ref(false);
const rows = ref<Row[]>([]);
/** 按账号（手机号/邮箱）模糊查询 */
const searchKeyword = ref("");

const editOpen = ref(false);
const savingProfile = ref(false);
const editRow = ref<Row | null>(null);
const editForm = ref({
  nickname: "",
  avatarUrl: "",
  bio: "",
});

async function refresh() {
  loading.value = true;
  try {
    const r = await api.admin.portalUsers.list(searchKeyword.value);
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
  { title: "昵称", dataIndex: "nickname", key: "nickname", width: 160, ellipsis: true },
  { title: "注册时间", dataIndex: "createdAt", key: "createdAt", width: 120 },
  { title: "操作", key: "actions", width: 100 },
];

onMounted(() => void refresh());
</script>

<template>
  <a-card :bordered="true">
    <template #extra>
      <a-space wrap>
        <a-input-search
          v-model:value="searchKeyword"
          placeholder="手机号或邮箱"
          allow-clear
          style="width: min(100vw - 8rem, 280px)"
          @search="refresh"
        />
        <a-button size="small" @click="refresh">
          <template #icon><ReloadOutlined /></template>
          刷新
        </a-button>
      </a-space>
    </template>

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
