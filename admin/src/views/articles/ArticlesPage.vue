<script setup lang="ts">
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons-vue";
import { computed, onMounted, reactive, ref } from "vue";
import { api } from "@/lib/api-client";
import { mapApiMessage } from "@/lib/auth-messages";
import { message } from "ant-design-vue";
import type { UploadProps } from "ant-design-vue";
import MarkdownIt from "markdown-it";

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
const drawerWidth = ref<number | string>(720);
const contentMode = ref<"edit" | "preview">("edit");

const md = new MarkdownIt({
  html: false, // 禁止原始 HTML，避免 XSS
  linkify: true,
  breaks: true,
});

const contentPreviewHtml = computed(() => md.render(form.content || ""));

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
  contentMode.value = "edit";
  modalOpen.value = true;
}

function openEdit(a: Article) {
  form.title = a.title ?? "";
  form.summary = a.summary ?? "";
  form.content = a.content ?? "";
  form.coverUrl = a.coverUrl ?? "";
  form.status = (a.status === "published" ? "published" : "draft") as "draft" | "published";
  editingId.value = a.id;
  contentMode.value = "edit";
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
  try {
    drawerWidth.value = window.innerWidth >= 1024 ? 720 : "100%";
  } catch {
    drawerWidth.value = 720;
  }
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

  <a-drawer
    v-model:open="modalOpen"
    :title="modalTitle"
    placement="right"
    :width="drawerWidth"
    :mask-closable="false"
    :keyboard="false"
    :closable="true"
    :destroy-on-close="false"
  >
    <template #extra>
      <a-space>
        <a-button @click="refresh">刷新列表</a-button>
        <a-button type="primary" :loading="saving" @click="save">保存</a-button>
      </a-space>
    </template>

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
        <a-segmented
          v-model:value="form.status"
          :options="[{ label: '草稿', value: 'draft' }, { label: '已发布', value: 'published' }]"
        />
      </a-form-item>
      <a-form-item label="正文">
        <a-segmented
          v-model:value="contentMode"
          class="mb-3"
          :options="[{ label: '编辑', value: 'edit' }, { label: '预览', value: 'preview' }]"
        />
        <div v-if="contentMode === 'edit'">
          <a-textarea
            v-model:value="form.content"
            :rows="14"
            placeholder="支持 Markdown：# 标题、- 列表、**加粗**、[链接](url) 等"
          />
          <p class="mt-2 text-xs text-gray-500">
            预览为安全渲染：不会执行 HTML。图片可先上传到「媒体库」后用 Markdown 引用：`![](图片URL)`。
          </p>
        </div>
        <div v-else class="md-preview" v-html="contentPreviewHtml" />
      </a-form-item>
    </a-form>
  </a-drawer>
</template>

<style scoped>
.md-preview :deep(h1),
.md-preview :deep(h2),
.md-preview :deep(h3) {
  font-weight: 600;
  margin: 0.75rem 0 0.5rem;
}
.md-preview :deep(p) {
  margin: 0.5rem 0;
}
.md-preview :deep(ul) {
  padding-left: 1.25rem;
  margin: 0.5rem 0;
  list-style: disc;
}
.md-preview :deep(ol) {
  padding-left: 1.25rem;
  margin: 0.5rem 0;
  list-style: decimal;
}
.md-preview :deep(code) {
  padding: 0.1rem 0.3rem;
  border-radius: 0.25rem;
  background: rgba(0, 0, 0, 0.04);
}
.md-preview :deep(pre) {
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: rgba(0, 0, 0, 0.04);
  overflow: auto;
}
.md-preview :deep(a) {
  color: #1677ff;
}
.md-preview :deep(blockquote) {
  margin: 0.75rem 0;
  padding-left: 0.75rem;
  border-left: 3px solid rgba(0, 0, 0, 0.15);
  color: rgba(0, 0, 0, 0.65);
}
</style>

