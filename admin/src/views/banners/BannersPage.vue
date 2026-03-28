<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { api } from "@/lib/api-client";
import { mapApiMessage } from "@/lib/auth-messages";
import { message } from "ant-design-vue";
import type { UploadProps } from "ant-design-vue";

type Banner = {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  slot: "home_main" | "home_side_top" | "home_side_bottom";
  enabled: boolean;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
};

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
  slot: "home_main" as "home_main" | "home_side_top" | "home_side_bottom",
  enabled: true,
  sortOrder: 0,
});

const slotOptions = [
  { label: "主 Banner（左侧大图）", value: "home_main" },
  { label: "副 Banner（右上）", value: "home_side_top" },
  { label: "副 Banner（右下）", value: "home_side_bottom" },
];

function slotLabel(slot: Banner["slot"]) {
  const v = slotOptions.find((s) => s.value === slot);
  return v?.label ?? slot;
}

const modalTitle = computed(() => (editingId.value ? "编辑 Banner" : "新建 Banner"));

function resetForm() {
  form.title = "";
  form.imageUrl = "";
  form.linkUrl = "";
  form.slot = "home_main";
  form.enabled = true;
  form.sortOrder = 0;
  editingId.value = null;
}

async function refresh() {
  loading.value = true;
  try {
    const r = await api.admin.listBanners();
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
  form.slot = b.slot ?? "home_main";
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
  if ((form.slot === "home_side_top" || form.slot === "home_side_bottom") && !link) {
    void message.warning("右侧副 Banner 需要填写跳转链接（例如 /a/文章ID）");
    return;
  }
  saving.value = true;
  try {
    const payload = {
      title: form.title.trim() || "Banner",
      imageUrl,
      linkUrl: link ? link : null,
      slot: form.slot,
      enabled: form.enabled,
      sortOrder: Number.isFinite(form.sortOrder) ? form.sortOrder : 0,
    };
    const r = editingId.value
      ? await api.admin.updateBanner(editingId.value, payload)
      : await api.admin.createBanner(payload);
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
  { title: "分类位", key: "slot", width: 180 },
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
  <a-card :bordered="true">
    <template #extra>
      <a-space>
        <a-button @click="refresh">刷新</a-button>
        <a-button type="primary" @click="openCreate">新建 Banner</a-button>
      </a-space>
    </template>

    <a-table
      :columns="columns"
      :data-source="items"
      :loading="loading"
      row-key="id"
      :pagination="{ pageSize: 20 }"
      size="middle"
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
      <a-form-item label="分类位" required>
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

