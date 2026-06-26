<script setup lang="ts">
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons-vue";
import { computed, onMounted, reactive, ref } from "vue";
import { api, type EventAdminDto, type EventCategoryCode } from "@/lib/api-client";
import { mapApiMessage } from "@/lib/auth-messages";
import { datetimeLocalInputToMs, msToDatetimeLocalInput } from "@/lib/datetime-local";
import { message } from "ant-design-vue";
import type { UploadProps } from "ant-design-vue";

const categoryOptions: { label: string; value: EventCategoryCode }[] = [
  { label: "市集", value: "market" },
  { label: "展览", value: "exhibition" },
  { label: "演出", value: "show" },
  { label: "亲子", value: "family" },
  { label: "运动", value: "sports" },
];

const loading = ref(false);
const rows = ref<EventAdminDto[]>([]);
const modalOpen = ref(false);
const saving = ref(false);
const uploading = ref(false);
const editingId = ref<string | null>(null);

const form = reactive({
  id: "",
  title: "",
  summary: "",
  coverUrl: "",
  location: "",
  category: "sports" as EventCategoryCode,
  startsAtLocal: "",
  endsAtLocal: "",
  organizer: "",
  registerUrl: "",
  highlightsText: "",
  published: true,
  sortOrder: 0,
});

const modalTitle = computed(() => (editingId.value ? "编辑活动" : "新建活动"));

function categoryLabel(code: string) {
  return categoryOptions.find((o) => o.value === code)?.label ?? code;
}

function fmt(ms: number) {
  if (!ms) return "—";
  return new Date(ms).toLocaleString("zh-CN", { hour12: false });
}

function resetForm() {
  form.id = "";
  form.title = "";
  form.summary = "";
  form.coverUrl = "";
  form.location = "";
  form.category = "sports";
  form.startsAtLocal = "";
  form.endsAtLocal = "";
  form.organizer = "";
  form.registerUrl = "";
  form.highlightsText = "";
  form.published = true;
  form.sortOrder = 0;
  editingId.value = null;
}

async function refresh() {
  loading.value = true;
  try {
    const r = await api.admin.events.list();
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

function openCreate() {
  resetForm();
  modalOpen.value = true;
}

function openEdit(row: EventAdminDto) {
  editingId.value = row.id;
  form.id = row.id;
  form.title = row.title;
  form.summary = row.summary;
  form.coverUrl = row.coverUrl;
  form.location = row.location;
  form.category = row.category;
  form.startsAtLocal = msToDatetimeLocalInput(row.startsAt);
  form.endsAtLocal = msToDatetimeLocalInput(row.endsAt);
  form.organizer = row.organizer;
  form.registerUrl = row.registerUrl ?? "";
  form.highlightsText = (row.highlights ?? []).join("\n");
  form.published = row.published;
  form.sortOrder = row.sortOrder;
  modalOpen.value = true;
}

const beforeUpload: UploadProps["beforeUpload"] = async (file) => {
  uploading.value = true;
  try {
    const r = await api.admin.uploadMedia(file as File, { scope: "cms" });
    if (!r.ok || !r.data?.url) {
      void message.error(mapApiMessage(r.message));
      return false;
    }
    form.coverUrl = r.data.url;
    void message.success("封面已上传");
  } finally {
    uploading.value = false;
  }
  return false;
};

async function save() {
  const title = form.title.trim();
  if (!title) {
    void message.warning("请填写活动标题");
    return;
  }
  const startsAt = datetimeLocalInputToMs(form.startsAtLocal);
  const endsAt = datetimeLocalInputToMs(form.endsAtLocal);
  if (!startsAt || !endsAt || endsAt < startsAt) {
    void message.warning("请填写有效的开始与结束时间");
    return;
  }
  if (!editingId.value) {
    const id = form.id.trim();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
      void message.warning("标识请用小写英文、数字与连字符，如 yili-marathon-2026");
      return;
    }
  }
  saving.value = true;
  try {
    const payload = {
      title,
      summary: form.summary.trim(),
      coverUrl: form.coverUrl.trim(),
      location: form.location.trim(),
      category: form.category,
      startsAt,
      endsAt,
      organizer: form.organizer.trim(),
      registerUrl: form.registerUrl.trim(),
      highlightsText: form.highlightsText,
      published: form.published,
      sortOrder: Number.isFinite(form.sortOrder) ? form.sortOrder : 0,
    };
    const r = editingId.value
      ? await api.admin.events.update(editingId.value, payload)
      : await api.admin.events.create({ ...payload, id: form.id.trim() });
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

async function remove(id: string) {
  const r = await api.admin.events.remove(id);
  if (!r.ok) {
    void message.error(mapApiMessage(r.message));
    return;
  }
  void message.success("已删除");
  await refresh();
}

const columns = [
  { title: "标题", dataIndex: "title", key: "title", ellipsis: true },
  { title: "类型", key: "category", width: 88 },
  { title: "开始", key: "startsAt", width: 170 },
  { title: "地点", dataIndex: "location", key: "location", ellipsis: true, width: 160 },
  { title: "发布", key: "published", width: 72 },
  { title: "排序", dataIndex: "sortOrder", key: "sortOrder", width: 72 },
  { title: "操作", key: "actions", width: 140 },
];

onMounted(() => void refresh());
</script>

<template>
  <a-card :bordered="true" title="活动管理">
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

    <a-table
      :columns="columns"
      :data-source="rows"
      :loading="loading"
      row-key="id"
      :pagination="{ pageSize: 20, showTotal: (t: number) => `共 ${t} 条` }"
      size="middle"
      :scroll="{ x: 960 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'category'">
          {{ categoryLabel(record.category) }}
        </template>
        <template v-if="column.key === 'startsAt'">
          {{ fmt(record.startsAt) }}
        </template>
        <template v-if="column.key === 'published'">
          <a-tag :color="record.published ? 'processing' : 'default'">
            {{ record.published ? "是" : "否" }}
          </a-tag>
        </template>
        <template v-if="column.key === 'actions'">
          <a-space>
            <a-button type="link" size="small" @click="openEdit(record)">编辑</a-button>
            <a-popconfirm title="确定删除此活动？" @confirm="remove(record.id)">
              <a-button type="link" danger size="small">删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>
  </a-card>

  <a-modal
    v-model:open="modalOpen"
    :title="modalTitle"
    width="720px"
    :confirm-loading="saving"
    @ok="save"
    @cancel="modalOpen = false"
  >
    <a-form layout="vertical">
      <a-form-item v-if="!editingId" label="标识（URL 路径，创建后不可改）" required>
        <a-input v-model:value="form.id" placeholder="例如 yili-marathon-2026" />
      </a-form-item>
      <a-form-item label="标题" required>
        <a-input v-model:value="form.title" placeholder="活动名称" />
      </a-form-item>
      <a-form-item label="简介">
        <a-textarea v-model:value="form.summary" :rows="2" placeholder="列表与详情页摘要" />
      </a-form-item>
      <a-form-item label="封面图 URL">
        <a-space style="width: 100%">
          <a-input v-model:value="form.coverUrl" placeholder="可粘贴链接，或右侧上传" />
          <a-upload
            :before-upload="beforeUpload"
            :show-upload-list="false"
            accept="image/jpeg,image/png,image/gif,image/webp"
          >
            <a-button :loading="uploading">上传</a-button>
          </a-upload>
        </a-space>
      </a-form-item>
      <a-form-item label="类型" required>
        <a-select v-model:value="form.category" :options="categoryOptions" />
      </a-form-item>
      <a-form-item label="开始时间" required>
        <a-input v-model:value="form.startsAtLocal" type="datetime-local" />
      </a-form-item>
      <a-form-item label="结束时间" required>
        <a-input v-model:value="form.endsAtLocal" type="datetime-local" />
      </a-form-item>
      <a-form-item label="地点">
        <a-input v-model:value="form.location" placeholder="活动地址" />
      </a-form-item>
      <a-form-item label="主办方">
        <a-input v-model:value="form.organizer" />
      </a-form-item>
      <a-form-item label="报名链接">
        <a-input v-model:value="form.registerUrl" placeholder="https://..." />
      </a-form-item>
      <a-form-item label="活动亮点（每行一条）">
        <a-textarea v-model:value="form.highlightsText" :rows="4" />
      </a-form-item>
      <a-form-item label="发布到门户">
        <a-switch v-model:checked="form.published" />
      </a-form-item>
      <a-form-item label="排序（越小越靠前）">
        <a-input-number v-model:value="form.sortOrder" :min="0" :step="1" style="width: 100%" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
