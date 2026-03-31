<script setup lang="ts">
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons-vue";
import { onMounted, ref } from "vue";
import { api, type StaffRole, type StaffUserDto } from "@/lib/api-client";
import { mapApiMessage } from "@/lib/auth-messages";
import { STAFF_ROLE_OPTIONS, formatDateTimeZhCN, getStaffAvatarInitial } from "@/lib/staff-ui";
import { message } from "ant-design-vue";

type Row = StaffUserDto;

const loading = ref(false);
const rows = ref<Row[]>([]);
const searchKeyword = ref("");
const changingRoleId = ref<number | null>(null);

function newCreateForm() {
  return {
    identifier: "",
    password: "",
    role: "editor" as StaffRole,
    nickname: "",
    avatarUrl: "",
    bio: "",
  };
}

const createOpen = ref(false);
const creating = ref(false);
const createForm = ref(newCreateForm());

const editOpen = ref(false);
const savingProfile = ref(false);
const editRow = ref<Row | null>(null);
const editForm = ref({
  nickname: "",
  avatarUrl: "",
  bio: "",
});

function rowAvatarText(row: Row) {
  return getStaffAvatarInitial(row);
}

async function refresh() {
  loading.value = true;
  try {
    const r = await api.admin.staff.list(searchKeyword.value);
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

async function createUser() {
  const identifier = createForm.value.identifier.trim();
  const password = createForm.value.password;
  if (!identifier) {
    void message.warning("请输入账号（邮箱或手机号）");
    return;
  }
  if (!password || password.trim().length < 6) {
    void message.warning("请输入至少 6 位密码");
    return;
  }
  creating.value = true;
  try {
    const r = await api.admin.staff.create({
      identifier,
      password,
      role: createForm.value.role,
      nickname: createForm.value.nickname.trim() || undefined,
      avatarUrl: createForm.value.avatarUrl.trim() || undefined,
      bio: createForm.value.bio.trim() || undefined,
    });
    if (!r.ok) {
      void message.error(mapApiMessage(r.message));
      return;
    }
    void message.success("已创建后台账号");
    createOpen.value = false;
    createForm.value = newCreateForm();
    await refresh();
  } finally {
    creating.value = false;
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
    const r = await api.admin.staff.updateProfile(row.id, {
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

async function changeRole(row: Row, role: StaffRole) {
  if (row.role === role) return;
  changingRoleId.value = row.id;
  try {
    const r = await api.admin.staff.setRole(row.id, role);
    if (!r.ok || !r.data) {
      void message.error(mapApiMessage(r.message));
      return;
    }
    void message.success("已更新角色");
    await refresh();
  } finally {
    changingRoleId.value = null;
  }
}

const columns = [
  { title: "头像", key: "avatar", width: 68, align: "center" as const },
  { title: "账号", dataIndex: "identifier", key: "identifier", width: 200, ellipsis: true },
  { title: "昵称", dataIndex: "nickname", key: "nickname", width: 160, ellipsis: true },
  { title: "角色", key: "role", width: 132 },
  { title: "创建时间", dataIndex: "createdAt", key: "createdAt", width: 168 },
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
        <a-button type="primary" @click="createOpen = true">
          <template #icon><PlusOutlined /></template>
          新建操作员
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
      :scroll="{ x: 1100 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'avatar'">
          <a-avatar :size="40" :src="record.avatarUrl || undefined" class="row-avatar">
            {{ rowAvatarText(record) }}
          </a-avatar>
        </template>
        <template v-if="column.key === 'role'">
          <a-select
            :value="record.role"
            size="small"
            class="role-select"
            :options="STAFF_ROLE_OPTIONS"
            :loading="changingRoleId === record.id"
            :disabled="changingRoleId === record.id"
            @change="(v: string) => changeRole(record, v as StaffRole)"
          />
        </template>
        <template v-if="column.key === 'createdAt'">
          {{ formatDateTimeZhCN(record.createdAt) }}
        </template>
        <template v-if="column.key === 'actions'">
          <a-button type="link" size="small" @click="openEdit(record)">编辑资料</a-button>
        </template>
      </template>
    </a-table>
  </a-card>

  <a-modal v-model:open="createOpen" title="新建后台账号" :confirm-loading="creating" width="520px" @ok="createUser">
    <a-form layout="vertical">
      <a-form-item label="账号（邮箱或手机号）" required>
        <a-input v-model:value="createForm.identifier" placeholder="例如 mang@gansa.top" />
      </a-form-item>
      <a-form-item label="初始密码" required>
        <a-input-password v-model:value="createForm.password" placeholder="至少 6 位" />
      </a-form-item>
      <a-form-item label="角色">
        <a-select v-model:value="createForm.role" :options="STAFF_ROLE_OPTIONS" style="width: 100%" />
      </a-form-item>
      <a-divider orientation="left">可选资料</a-divider>
      <a-form-item label="昵称">
        <a-input v-model:value="createForm.nickname" placeholder="最多 64 字" :maxlength="64" show-count />
      </a-form-item>
      <a-form-item label="头像 URL">
        <a-input v-model:value="createForm.avatarUrl" placeholder="https://..." />
      </a-form-item>
      <a-form-item label="简介">
        <a-textarea v-model:value="createForm.bio" placeholder="最多 500 字" :rows="3" :maxlength="500" show-count />
      </a-form-item>
    </a-form>
  </a-modal>

  <a-modal
    v-model:open="editOpen"
    title="编辑操作员资料"
    :confirm-loading="savingProfile"
    width="520px"
    @ok="saveProfile"
  >
    <p v-if="editRow" class="edit-hint">账号：{{ editRow.identifier }}</p>
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

<style scoped>
.row-avatar {
  border: 1px solid #eef0f4;
}

.role-select {
  min-width: 118px;
}

.edit-hint {
  margin: 0 0 12px;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.55);
}
</style>
