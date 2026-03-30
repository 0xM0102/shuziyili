<script setup lang="ts">
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons-vue";
import { computed, onMounted, reactive, ref, watch } from "vue";
import { api } from "@/lib/api-client";
import { mapApiMessage } from "@/lib/auth-messages";
import { message } from "ant-design-vue";
import type { UploadProps } from "ant-design-vue";

type BannerScopeTab = "home" | "travel";

type Banner = {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  scope: string;
  slot: string;
  enabled: boolean;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
};

const activeScope = ref<BannerScopeTab>("home");

const loading = ref(false);
const items = ref<Banner[]>([]);

const modalOpen = ref(false);
const saving = ref(false);
const editingId = ref<number | null>(null);
const uploading = ref(false);

const form = reactive({
  title: "",
  imageUrl: "",
  linkUrl: "",
  slot: "home_main",
  enabled: true,
  sortOrder: 0,
});

const homeSlotOptions = [
  { label: "主 Banner（左侧大图）", value: "home_main" },
  { label: "副 Banner（右上）", value: "home_side_top" },
  { label: "副 Banner（右下）", value: "home_side_bottom" },
];

const travelSlotOptions = [
  { label: "主 Banner（旅游大焦点）", value: "travel_main" },
  { label: "副 Banner（右上）", value: "travel_side_top" },
  { label: "副 Banner（右下）", value: "travel_side_bottom" },
];

const slotOptions = computed(() =>
  activeScope.value === "travel" ? travelSlotOptions : homeSlotOptions
);

function defaultSlotForScope(scope: BannerScopeTab): string {
  return scope === "travel" ? "travel_main" : "home_main";
}

function isSideSlot(slot: string) {
  return (
    slot === "home_side_top" ||
    slot === "home_side_bottom" ||
    slot === "travel_side_top" ||
    slot === "travel_side_bottom"
  );
}

function slotLabel(slot: string) {
  const all = [...homeSlotOptions, ...travelSlotOptions];
  const v = all.find((s) => s.value === slot);
  return v?.label ?? slot;
}

const modalTitle = computed(() => (editingId.value ? "编辑 Banner" : "新建 Banner"));

function resetForm() {
  form.title = "";
  form.imageUrl = "";
  form.linkUrl = "";
  form.slot = defaultSlotForScope(activeScope.value);
  form.enabled = true;
  form.sortOrder = 0;
  editingId.value = null;
}

watch(activeScope, () => {
  if (modalOpen.value) {
    modalOpen.value = false;
  }
  form.slot = defaultSlotForScope(activeScope.value);
  void refresh();
});

async function refresh() {
  loading.value = true;
  try {
    const r = await api.admin.listBanners(activeScope.value);
    if (!r.ok || !r.data) {
      items.value = [];
      void message.error(mapApiMessage(r.message));
      return;
    }
    items.value = r.data.items as Banner[];
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  resetForm();
  modalOpen.value = true;
}

function openEdit(b: Banner) {
  form.title = b.title ?? "";
  form.imageUrl = b.imageUrl ?? "";
  form.linkUrl = b.linkUrl ?? "";
  form.slot = b.slot ?? defaultSlotForScope(activeScope.value);
  form.enabled = !!b.enabled;
  form.sortOrder = b.sortOrder ?? 0;
  editingId.value = b.id;
  modalOpen.value = true;
}

async function save() {
  const imageUrl = form.imageUrl.trim();
  if (!imageUrl) {
    void message.warning("请填写图片 URL（可从媒体库复制链接）");
    return;
  }
  const link = form.linkUrl.trim();
  if (isSideSlot(form.slot) && !link) {
    void message.warning("副 Banner 需要填写跳转链接（例如 /a/文章ID 或 /travel/...）");
    return;
  }
  saving.value = true;
  try {
    const payloadBase = {
      title: form.title.trim() || "Banner",
      imageUrl,
      linkUrl: link ? link : null,
      slot: form.slot,
      enabled: form.enabled,
      sortOrder: Number.isFinite(form.sortOrder) ? form.sortOrder : 0,
    };
    const r = editingId.value
      ? await api.admin.updateBanner(editingId.value, payloadBase)
      : await api.admin.createBanner({
          ...payloadBase,
          scope: activeScope.value,
        });
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

const beforeUpload: UploadProps["beforeUpload"] = async (file) => {
  uploading.value = true;
  try {
    const r = await api.admin.uploadMedia(file as unknown as File);
    if (!r.ok || !r.data) {
      void message.error(mapApiMessage(r.message));
      return false;
    }
    form.imageUrl = r.data.url;
    void message.success("上传成功，已填入图片 URL");
    return false;
  } finally {
    uploading.value = false;
  }
};

async function remove(id: number) {
  const r = await api.admin.deleteBanner(id);
  if (!r.ok) {
    void message.error(mapApiMessage(r.message));
    return;
  }
  void message.success("已删除");
  await refresh();
}

const columns = [
  { title: "预览", key: "thumb", width: 120 },
  { title: "标题", dataIndex: "title", key: "title" },
  { title: "展示位", key: "slot", width: 200 },
  { title: "启用", key: "enabled", width: 90 },
  { title: "排序", dataIndex: "sortOrder", key: "sortOrder", width: 90 },
  { title: "更新时间", dataIndex: "updatedAt", key: "updatedAt", width: 140 },
  { title: "操作", key: "actions", width: 220 },
];

onMounted(() => {
  void refresh();
});
</script>

<template>
  <a-card :bordered="true" title="Banner 管理">
    <template #extra>
      <a-space>
        <a-button @click="refresh">
          <template #icon><ReloadOutlined /></template>
          刷新
        </a-button>
        <a-button type="primary" @click="openCreate">
          <template #icon><PlusOutlined /></template>
          新建 Banner
        </a-button>
      </a-space>
    </template>

    <p class="mb-4 text-sm text-gray-500">
      全站 Banner 统一在此维护，按板块（Tab）区分展示位置；门户首页与旅游频道各自有主图与两个副位。
    </p>

    <a-tabs v-model:activeKey="activeScope" class="banner-tabs">
      <a-tab-pane key="home" tab="门户首页" />
      <a-tab-pane key="travel" tab="旅游频道" />
    </a-tabs>

    <a-table
      :columns="columns"
      :data-source="items"
      :loading="loading"
      row-key="id"
      :pagination="{ pageSize: 20 }"
      size="middle"
      class="mt-4"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'thumb'">
          <img
            :src="record.imageUrl"
            alt=""
            style="width: 96px; height: 54px; object-fit: cover; border-radius: 4px; border: 1px solid #e7e7e7"
          />
        </template>
        <template v-if="column.key === 'enabled'">
          <a-tag v-if="record.enabled" color="success">启用</a-tag>
          <a-tag v-else color="default">停用</a-tag>
        </template>
        <template v-if="column.key === 'slot'">
          <a-tag color="blue">{{ slotLabel(record.slot) }}</a-tag>
        </template>
        <template v-if="column.key === 'updatedAt'">
          {{ new Date(record.updatedAt).toISOString().slice(0, 10) }}
        </template>
        <template v-if="column.key === 'actions'">
          <a-space>
            <a-button type="link" size="small" @click="openEdit(record)">编辑</a-button>
            <a-popconfirm title="确定删除该 Banner？" @confirm="remove(record.id)">
              <a-button type="link" danger size="small">删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>
  </a-card>

  <a-modal v-model:open="modalOpen" :title="modalTitle" :confirm-loading="saving" @ok="save" @cancel="modalOpen = false">
    <a-form layout="vertical">
      <a-form-item label="标题">
        <a-input v-model:value="form.title" placeholder="可选" />
      </a-form-item>
      <a-form-item label="图片 URL" required>
        <a-space style="width: 100%">
          <a-input v-model:value="form.imageUrl" placeholder="可粘贴链接，或右侧直接上传" />
          <a-upload
            :before-upload="beforeUpload"
            :show-upload-list="false"
            accept="image/jpeg,image/png,image/gif,image/webp"
          >
            <a-button type="primary" :loading="uploading">上传图片</a-button>
          </a-upload>
        </a-space>
      </a-form-item>
      <a-form-item label="跳转链接">
        <a-input v-model:value="form.linkUrl" placeholder="例如 /travel 或 https://..." />
      </a-form-item>
      <a-form-item label="展示位" required>
        <a-select v-model:value="form.slot" :options="slotOptions" />
      </a-form-item>
      <a-form-item label="启用">
        <a-switch v-model:checked="form.enabled" />
      </a-form-item>
      <a-form-item label="排序（越小越靠前）">
        <a-input-number v-model:value="form.sortOrder" :min="0" :step="1" style="width: 100%" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<style scoped>
.banner-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 0;
}
</style>
