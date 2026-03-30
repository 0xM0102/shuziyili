<script setup lang="ts">
import { ReloadOutlined, SaveOutlined } from "@ant-design/icons-vue";
import { computed, onMounted, ref } from "vue";
import { api, type StaffPermissionDto, type StaffRoleDto, type StaffRolePermissionsDto } from "@/lib/api-client";
import { mapApiMessage } from "@/lib/auth-messages";
import { message } from "ant-design-vue";

const loading = ref(false);
const saving = ref(false);

const roles = ref<StaffRoleDto[]>([]);
const permissions = ref<StaffPermissionDto[]>([]);

const activeRoleName = ref<string>("");
const selectedPermissionCodes = ref<string[]>([]);
const search = ref("");

const activeRole = computed(() => roles.value.find((r) => r.roleName === activeRoleName.value) ?? null);

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

onMounted(() => {
  void refreshAll();
});
</script>

<template>
  <div class="mx-auto max-w-6xl">
    <div class="mb-4 flex items-start justify-between gap-3">
      <div>
        <h1 class="text-lg font-semibold">权限管理</h1>
        <p class="mt-1 text-sm text-gray-500">
          选择一个角色后，勾选其可访问的后台能力。仅拥有相应权限的账号才可进入对应页面/调用对应接口。
        </p>
      </div>
      <a-space>
        <a-button size="small" @click="refreshAll">
          <template #icon><ReloadOutlined /></template>
          刷新
        </a-button>
        <a-button type="primary" size="small" :loading="saving" :disabled="!activeRoleName" @click="saveRolePermissions">
          <template #icon><SaveOutlined /></template>
          保存
        </a-button>
      </a-space>
    </div>

    <a-alert v-if="roles.length === 0 && !loading" type="info" show-icon message="暂无角色数据（或权限不足）。" class="mb-4" />

    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :lg="7">
        <a-card bordered :loading="loading" title="角色">
          <a-radio-group
            class="w-full"
            :value="activeRoleName"
            @change="(e: any) => onRoleChange(e?.target?.value)"
          >
            <a-space direction="vertical" class="w-full">
              <a-radio v-for="r in roles" :key="r.roleName" :value="r.roleName">
                <span class="font-medium">{{ r.displayName }}</span>
                <span class="ml-2 text-xs text-gray-500">({{ r.roleName }})</span>
              </a-radio>
            </a-space>
          </a-radio-group>
        </a-card>
      </a-col>

      <a-col :xs="24" :lg="17">
        <a-card bordered :loading="loading" title="权限">
          <template #extra>
            <a-space>
              <a-button size="small" @click="selectAllEnabled" :disabled="permissions.length === 0">全选可用</a-button>
              <a-button size="small" @click="clearAll" :disabled="selectedPermissionCodes.length === 0">清空</a-button>
            </a-space>
          </template>

          <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div class="min-w-[240px] flex-1">
              <a-input
                v-model:value="search"
                placeholder="搜索权限：名称 / code / 描述"
                allow-clear
              />
            </div>
            <div class="text-xs text-gray-500">
              当前角色：<span class="font-medium text-gray-700">{{ activeRole?.displayName ?? "-" }}</span>
              <span class="ml-2">已选 {{ selectedPermissionCodes.length }} 项</span>
            </div>
          </div>

          <a-checkbox-group v-model:value="selectedPermissionCodes">
            <a-list :data-source="filteredPermissions" :split="false">
              <template #renderItem="{ item }">
                <a-list-item class="px-0">
                  <div class="w-full rounded border border-gray-200 px-3 py-3 hover:border-gray-300">
                    <div class="flex items-start justify-between gap-3">
                      <a-checkbox :value="item.permissionCode" :disabled="!item.enabled">
                        <span class="font-medium">{{ item.displayName }}</span>
                      </a-checkbox>
                      <span class="text-xs text-gray-500">{{ item.permissionCode }}</span>
                    </div>
                    <p v-if="item.description" class="mt-2 text-xs text-gray-500">{{ item.description }}</p>
                    <a-tag v-if="!item.enabled" color="default" class="mt-2">已禁用</a-tag>
                  </div>
                </a-list-item>
              </template>
            </a-list>
          </a-checkbox-group>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

