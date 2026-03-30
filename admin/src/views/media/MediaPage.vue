<script setup lang="ts">
import { ReloadOutlined, UploadOutlined } from "@ant-design/icons-vue";
import { onMounted, ref } from "vue";
import { api } from "@/lib/api-client";
import { mapApiMessage } from "@/lib/auth-messages";
import { message } from "ant-design-vue";

type Config = {
  enabled: boolean;
  configured: boolean;
  region: string;
  bucket: string;
  publicBaseUrl: string;
  keyPrefix: string;
};

type Row = {
  key: string;
  size: number;
  lastModified: number;
  url: string;
};

const cfg = ref<Config | null>(null);
const loading = ref(false);
const rows = ref<Row[]>([]);
const uploading = ref(false);

const columns = [
  { title: "预览", key: "thumb", width: 96 },
  { title: "Key", dataIndex: "key", key: "key", ellipsis: true },
  { title: "大小", dataIndex: "size", key: "size", width: 100 },
  { title: "更新时间", dataIndex: "lastModified", key: "lastModified", width: 120 },
  { title: "操作", key: "actions", width: 200 },
];

async function loadConfig() {
  const r = await api.admin.mediaConfig();
  if (r.ok && r.data) cfg.value = r.data as Config;
}

async function refresh() {
  loading.value = true;
  try {
    const r = await api.admin.listMedia();
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

async function beforeUpload(file: File) {
  uploading.value = true;
  try {
    const r = await api.admin.uploadMedia(file);
    if (!r.ok || !r.data) {
      void message.error(mapApiMessage(r.message));
      return false;
    }
    void message.success("上传成功");
    await refresh();
    return false;
  } finally {
    uploading.value = false;
  }
}

async function copyUrl(url: string) {
  try {
    await navigator.clipboard.writeText(url);
    void message.success("链接已复制");
  } catch {
    void message.error("复制失败");
  }
}

async function remove(key: string) {
  const r = await api.admin.deleteMedia(key);
  if (!r.ok) {
    void message.error(mapApiMessage(r.message));
    return;
  }
  void message.success("已删除");
  await refresh();
}

onMounted(async () => {
  await loadConfig();
  await refresh();
});

function fmtSize(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}
</script>

<template>
  <a-space direction="vertical" size="middle" style="width: 100%">
    <a-card title="COS 配置（只读）" size="small">
      <a-descriptions v-if="cfg" bordered size="small" :column="1">
        <a-descriptions-item label="Region">{{ cfg.region }}</a-descriptions-item>
        <a-descriptions-item label="Bucket">{{ cfg.bucket }}</a-descriptions-item>
        <a-descriptions-item label="访问域名">{{ cfg.publicBaseUrl }}</a-descriptions-item>
        <a-descriptions-item label="对象前缀">{{ cfg.keyPrefix }}</a-descriptions-item>
        <a-descriptions-item label="密钥状态">
          <a-tag v-if="cfg.configured" color="success">已配置</a-tag>
          <a-tag v-else color="warning">未配置（请设置 SHUZIYILI_COS_SECRET_ID / SHUZIYILI_COS_SECRET_KEY）</a-tag>
        </a-descriptions-item>
      </a-descriptions>
    </a-card>

    <a-card title="图片上传" size="small">
      <a-upload :before-upload="beforeUpload" :show-upload-list="false" accept="image/jpeg,image/png,image/gif,image/webp">
        <a-button type="primary" :loading="uploading">
          <template #icon><UploadOutlined /></template>
          选择图片上传
        </a-button>
      </a-upload>
      <p v-if="cfg" class="upload-hint">
        路径前缀：<code>{{ cfg.keyPrefix }}yyyy/MM/dd/…</code>
      </p>
    </a-card>

    <a-card :bordered="true">
      <template #extra>
        <a-button size="small" @click="refresh">
          <template #icon><ReloadOutlined /></template>
          刷新
        </a-button>
      </template>
      <a-table
        :columns="columns"
        :data-source="rows"
        :loading="loading"
        :pagination="{ pageSize: 20 }"
        row-key="key"
        size="middle"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'thumb'">
            <img :src="record.url" alt="" style="width: 72px; height: 72px; object-fit: cover; border-radius: 4px" />
          </template>
          <template v-if="column.key === 'size'">
            {{ fmtSize(record.size) }}
          </template>
          <template v-if="column.key === 'lastModified'">
            {{ new Date(record.lastModified).toISOString().slice(0, 10) }}
          </template>
          <template v-if="column.key === 'actions'">
            <a-space>
              <a-button type="link" size="small" @click="copyUrl(record.url)">复制链接</a-button>
              <a-popconfirm title="确定删除该文件？" @confirm="remove(record.key)">
                <a-button type="link" danger size="small">删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </a-space>
</template>

<style scoped>
.upload-hint {
  margin-top: 8px;
  margin-bottom: 0;
  font-size: 12px;
  color: #999;
}
.upload-hint code {
  font-size: 11px;
}
</style>
