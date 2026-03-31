<script setup lang="ts">
import { ReloadOutlined, SaveOutlined } from "@ant-design/icons-vue";
import { computed, onMounted, ref } from "vue";
import { api, type StaffPermissionDto, type StaffRoleDto } from "@/lib/api-client";
import { mapApiMessage } from "@/lib/auth-messages";
import { message } from "ant-design-vue";

const loading = ref(false);
const saving = ref(false);

const roles = ref<StaffRoleDto[]>([]);
const permissions = ref<StaffPermissionDto[]>([]);

const activeRoleName = ref<string>("");
const selectedPermissionCodes = ref<string[]>([]);
const search = ref("");

const roleOptions = computed(() =>
  roles.value.map((r) => ({
    label: `${r.displayName}（${r.roleName}）`,
    value: r.roleName,
  }))
);

const filteredPermissions = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return permissions.value;
  return permissions.value.filter((p) => {
    const hay = `${p.permissionCode} ${p.displayName} ${p.description}`.toLowerCase();
    return hay.includes(q);
  });
});

const enabledPermissionCodes = computed(() =>
  permissions.value.filter((p) => p.enabled).map((p) => p.permissionCode)
);

const columns = [
  { title: "授权", key: "grant", width: 72, align: "center" as const },
  { title: "权限名称", dataIndex: "displayName", key: "displayName", ellipsis: true },
  { title: "权限码", dataIndex: "permissionCode", key: "permissionCode", width: 220, ellipsis: true },
  { title: "说明", dataIndex: "description", key: "description", ellipsis: true },
  { title: "状态", key: "status", width: 88 },
];

async function refreshForRole(roleName?: string) {
  const rn = roleName ?? activeRoleName.value;
  if (!rn) return;
  const r = await api.admin.rbac.listRolePermissions(rn);
  if (!r.ok || !r.data) {
    selectedPermissionCodes.value = [];
    void message.error(mapApiMessage(r.message));
    return;
  }
  selectedPermissionCodes.value = r.data.permissionCodes ?? [];
}

async function refreshAll() {
  loading.value = true;
  try {
    const rr = await api.admin.rbac.listRoles();
    const pr = await api.admin.rbac.listPermissions();
    if (!rr.ok || !rr.data || !pr.ok || !pr.data) {
      roles.value = [];
      permissions.value = [];
      void message.error(mapApiMessage(!rr.ok ? rr.message : pr.message));
      return;
    }
    roles.value = rr.data;
    permissions.value = pr.data;
    if (!activeRoleName.value && roles.value.length > 0) {
      activeRoleName.value = roles.value[0].roleName;
    }
    await refreshForRole();
  } finally {
    loading.value = false;
  }
}

async function saveRolePermissions() {
  const rn = activeRoleName.value;
  if (!rn) return;
  saving.value = true;
  try {
    const r = await api.admin.rbac.setRolePermissions(rn, selectedPermissionCodes.value);
    if (!r.ok) {
      void message.error(mapApiMessage(r.message));
      return;
    }
    void message.success("已保存角色权限");
  } finally {
    saving.value = false;
  }
}

function onRoleChange(rn: string) {
  activeRoleName.value = rn;
  void refreshForRole(rn);
}

function selectAllEnabled() {
  selectedPermissionCodes.value = [...enabledPermissionCodes.value];
}

function clearAll() {
  selectedPermissionCodes.value = [];
}

function onGrantChange(record: StaffPermissionDto, checked: boolean) {
  if (!record.enabled) return;
  const code = record.permissionCode;
  const arr = [...selectedPermissionCodes.value];
  const i = arr.indexOf(code);
  if (checked && i === -1) arr.push(code);
  if (!checked && i >= 0) arr.splice(i, 1);
  selectedPermissionCodes.value = arr;
}

onMounted(() => {
  void refreshAll();
});
</script>

<template>
  <a-card :bordered="true" title="权限管理">
    <template #extra>
      <a-space wrap>
        <a-select
          v-model:value="activeRoleName"
          :options="roleOptions"
          placeholder="选择角色"
          :disabled="roles.length === 0"
          style="width: min(100vw - 10rem, 240px)"
          @change="(v: string) => onRoleChange(v)"
        />
        <a-input-search
          v-model:value="search"
          placeholder="筛选：名称 / 权限码 / 说明"
          allow-clear
          style="width: min(100vw - 10rem, 260px)"
        />
        <a-button size="small" :disabled="permissions.length === 0" @click="selectAllEnabled">全选可用</a-button>
        <a-button size="small" :disabled="selectedPermissionCodes.length === 0" @click="clearAll">清空</a-button>
        <a-button size="small" @click="refreshAll">
          <template #icon><ReloadOutlined /></template>
          刷新
        </a-button>
        <a-button type="primary" size="small" :loading="saving" :disabled="!activeRoleName" @click="saveRolePermissions">
          <template #icon><SaveOutlined /></template>
          保存
        </a-button>
      </a-space>
    </template>

    <a-alert
      v-if="roles.length === 0 && !loading"
      type="info"
      show-icon
      message="暂无角色数据，或当前账号无权限。"
      class="mb-4"
    />

    <a-table
      :columns="columns"
      :data-source="filteredPermissions"
      :loading="loading"
      row-key="permissionCode"
      :pagination="false"
      size="middle"
      :scroll="{ x: 900 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'grant'">
          <a-checkbox
            :checked="selectedPermissionCodes.includes(record.permissionCode)"
            :disabled="!record.enabled"
            @change="(e: any) => onGrantChange(record, !!e?.target?.checked)"
          />
        </template>
        <template v-if="column.key === 'status'">
          <a-tag v-if="record.enabled" color="success">可用</a-tag>
          <a-tag v-else color="default">已禁用</a-tag>
        </template>
      </template>
    </a-table>
  </a-card>
</template>
