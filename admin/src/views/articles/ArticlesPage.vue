<script setup lang="ts">
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons-vue";
import { computed, onMounted, reactive, ref } from "vue";
import { api } from "@/lib/api-client";
import { mapApiMessage } from "@/lib/auth-messages";
import { message } from "ant-design-vue";
import type { UploadProps } from "ant-design-vue";

type Article = {
  id: string;
  title: string;
  summary: string;
  content: string;
  coverUrl: string | null;
  status: string;
  createdAt: number;
  updatedAt: number;
};

const loading = ref(false);
const items = ref<Article[]>([]);

const modalOpen = ref(false);
const saving = ref(false);
const editingId = ref<string | null>(null);
const uploading = ref(false);

const form = reactive({
  title: "",
  summary: "",
  content: "",
  coverUrl: "",
  status: "draft" as "draft" | "published",
});

const modalTitle = computed(() => (editingId.value ? "编辑文章" : "新建文章"));

function resetForm() {
  form.title = "";
  form.summary = "";
  form.content = "";
  form.coverUrl = "";
  form.status = "draft";
  editingId.value = null;
}

async function refresh() {
  loading.value = true;
  try {
    const r = await api.admin.listArticles();
    if (!r.ok || !r.data) {
      items.value = [];
      void message.error(mapApiMessage(r.message));
      return;
    }
    items.value = r.data.items as Article[];
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  resetForm();
  modalOpen.value = true;
}

function openEdit(a: Article) {
  form.title = a.title ?? "";
  form.summary = a.summary ?? "";
  form.content = a.content ?? "";
  form.coverUrl = a.coverUrl ?? "";
  form.status = (a.status === "published" ? "published" : "draft") as "draft" | "published";
  editingId.value = a.id;
  modalOpen.value = true;
}

async function save() {
  const title = form.title.trim();
  if (!title) {
    void message.warning("请输入标题");
    return;
  }
  saving.value = true;
  try {
    const payload = {
      title,
      summary: form.summary.trim(),
      content: form.content,
      coverUrl: form.coverUrl.trim() ? form.coverUrl.trim() : null,
      status: form.status,
    };
    const r = editingId.value
      ? await api.admin.updateArticle(editingId.value, payload)
      : await api.admin.createArticle(payload);
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

const beforeUploadCover: UploadProps["beforeUpload"] = async (file) => {
  uploading.value = true;
  try {
    const r = await api.admin.uploadMedia(file as unknown as File);
    if (!r.ok || !r.data) {
      void message.error(mapApiMessage(r.message));
      return false;
    }
    form.coverUrl = r.data.url;
    void message.success("封面上传成功，已填入 URL");
    return false;
  } finally {
    uploading.value = false;
  }
};

async function remove(id: string) {
  const r = await api.admin.deleteArticle(id);
  if (!r.ok) {
    void message.error(mapApiMessage(r.message));
    return;
  }
  void message.success("已删除");
  await refresh();
}

const columns = [
  { title: "标题", dataIndex: "title", key: "title" },
  { title: "状态", dataIndex: "status", key: "status", width: 120 },
  { title: "更新时间", dataIndex: "updatedAt", key: "updatedAt", width: 140 },
  { title: "链接", key: "link", width: 160 },
  { title: "操作", key: "actions", width: 220 },
];

onMounted(() => {
  void refresh();
});

function articlePath(id: string) {
  return `/a/${id}`;
}

function siteBase() {
  const v = (import.meta.env.VITE_SITE_BASE_URL as string | undefined) ?? "";
  return (v || "http://localhost:3000").replace(/\/$/, "");
}

function articleUrl(id: string) {
  return `${siteBase()}${articlePath(id)}`;
}

async function copyLink(id: string) {
  const path = articlePath(id);
  try {
    await navigator.clipboard.writeText(path);
    void message.success("链接已复制");
  } catch {
    void message.error("复制失败");
  }
}
</script>

<template>
  <a-card :bordered="true">
    <template #extra>
      <a-space>
        <a-button @click="refresh">
          <template #icon><ReloadOutlined /></template>
          刷新
        </a-button>
        <a-button type="primary" @click="openCreate">
          <template #icon><PlusOutlined /></template>
          新建文章
        </a-button>
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
        <template v-if="column.key === 'status'">
          <a-tag v-if="record.status === 'published'" color="success">已发布</a-tag>
          <a-tag v-else color="default">草稿</a-tag>
        </template>
        <template v-if="column.key === 'updatedAt'">
          {{ new Date(record.updatedAt).toISOString().slice(0, 10) }}
        </template>
        <template v-if="column.key === 'link'">
          <a-space>
            <a-button type="link" size="small" @click="copyLink(record.id)">复制</a-button>
            <a :href="articleUrl(record.id)" target="_blank" rel="noreferrer" class="text-xs">
              打开
            </a>
          </a-space>
        </template>
        <template v-if="column.key === 'actions'">
          <a-space>
            <a-button type="link" size="small" @click="openEdit(record)">编辑</a-button>
            <a-popconfirm title="确定删除该文章？" @confirm="remove(record.id)">
              <a-button type="link" danger size="small">删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>
  </a-card>

  <a-modal v-model:open="modalOpen" :title="modalTitle" :confirm-loading="saving" @ok="save" @cancel="modalOpen = false">
    <a-form layout="vertical">
      <a-form-item label="标题" required>
        <a-input v-model:value="form.title" placeholder="请输入标题" />
      </a-form-item>
      <a-form-item label="摘要">
        <a-textarea v-model:value="form.summary" :rows="2" placeholder="可选，用于列表展示" />
      </a-form-item>
      <a-form-item label="封面图 URL">
        <a-space style="width: 100%">
          <a-input v-model:value="form.coverUrl" placeholder="可粘贴链接，或右侧直接上传" />
          <a-upload
            :before-upload="beforeUploadCover"
            :show-upload-list="false"
            accept="image/jpeg,image/png,image/gif,image/webp"
          >
            <a-button type="primary" :loading="uploading">上传封面</a-button>
          </a-upload>
        </a-space>
      </a-form-item>
      <a-form-item label="状态">
        <a-segmented v-model:value="form.status" :options="[{ label: '草稿', value: 'draft' }, { label: '已发布', value: 'published' }]" />
      </a-form-item>
      <a-form-item label="正文">
        <a-textarea v-model:value="form.content" :rows="8" placeholder="先用纯文本占位，后续可接富文本编辑器" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

