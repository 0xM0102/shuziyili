<script setup lang="ts">
import {
  ClockCircleOutlined,
  FileTextOutlined,
  HomeOutlined,
  LinkOutlined,
  PictureOutlined,
  ReloadOutlined,
  RightOutlined,
  TagsOutlined,
  UserOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons-vue";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { api } from "@/lib/api-client";
import { mapApiMessage } from "@/lib/auth-messages";

const router = useRouter();

type Summary = {
  portalUsersTotal: number;
  staffUsersTotal: number;
  articlesTotal: number;
  articlesPublished: number;
  articlesDraft: number;
  flashTotal: number;
  flashEnabled: number;
  flashExternalTotal: number;
  flashInternalTotal: number;
  flashExternalEnabled: number;
  flashInternalEnabled: number;
  flashTagsTotal: number;
  bannersTotal: number;
};

const loading = ref(false);
const errMsg = ref<string | null>(null);
const summary = ref<Summary | null>(null);
const lastUpdatedAt = ref<number | null>(null);

const flashEnabledRate = computed(() => {
  const s = summary.value;
  if (!s || s.flashTotal <= 0) return 0;
  return Math.round((s.flashEnabled / s.flashTotal) * 100);
});

async function refresh() {
  loading.value = true;
  errMsg.value = null;
  try {
    const r = await api.admin.dashboard.summary();
    if (!r.ok || !r.data) {
      summary.value = null;
      errMsg.value = mapApiMessage(r.message);
      return;
    }
    summary.value = r.data;
    lastUpdatedAt.value = Date.now();
  } finally {
    loading.value = false;
  }
}

const statItems = computed(() => [
  {
    key: "portal-users",
    title: "平台用户",
    value: summary.value?.portalUsersTotal ?? 0,
    sub: "",
    icon: UserOutlined,
    path: "/portal-users",
  },
  {
    key: "staff-users",
    title: "后台账号",
    value: summary.value?.staffUsersTotal ?? 0,
    sub: "",
    icon: UserSwitchOutlined,
    path: "/staff-users",
  },
  {
    key: "articles",
    title: "文章",
    value: summary.value?.articlesTotal ?? 0,
    sub: `已发布 ${summary.value?.articlesPublished ?? 0} · 草稿 ${summary.value?.articlesDraft ?? 0}`,
    icon: FileTextOutlined,
    path: "/articles",
  },
  {
    key: "flash-links",
    title: "快讯",
    value: summary.value?.flashTotal ?? 0,
    sub: `启用 ${summary.value?.flashEnabled ?? 0}（${flashEnabledRate.value}%） · 外链 ${
      summary.value?.flashExternalTotal ?? 0
    } · 站内 ${summary.value?.flashInternalTotal ?? 0}`,
    icon: LinkOutlined,
    path: "/flash-links",
  },
  {
    key: "flash-tags",
    title: "标签",
    value: summary.value?.flashTagsTotal ?? 0,
    sub: "",
    icon: TagsOutlined,
    path: "/flash-tags",
  },
  {
    key: "banners",
    title: "Banner",
    value: summary.value?.bannersTotal ?? 0,
    sub: "",
    icon: HomeOutlined,
    path: "/banners",
  },
]);

const quickEntries = [
  { key: "portal-users", title: "平台用户", icon: UserOutlined, path: "/portal-users" },
  { key: "staff-users", title: "后台账号", icon: UserSwitchOutlined, path: "/staff-users" },
  { key: "articles", title: "文章管理", icon: FileTextOutlined, path: "/articles" },
  { key: "flash-links", title: "快讯", icon: LinkOutlined, path: "/flash-links" },
  { key: "flash-tags", title: "标签管理", icon: TagsOutlined, path: "/flash-tags" },
  { key: "banners", title: "Banner 管理", icon: HomeOutlined, path: "/banners" },
  { key: "media", title: "媒体库", icon: PictureOutlined, path: "/media" },
] as const;

const lastUpdatedText = computed(() => {
  if (!lastUpdatedAt.value) return "尚未刷新";
  return new Date(lastUpdatedAt.value).toLocaleString("zh-CN", { hour12: false });
});

onMounted(() => void refresh());
</script>

<template>
  <a-space direction="vertical" size="middle" style="width: 100%">
    <a-card :bordered="true" title="概览">
      <template #extra>
        <a-space :size="10">
          <span class="updateHint">
            <ClockCircleOutlined />
            数据更新：{{ lastUpdatedText }}
          </span>
          <a-button :loading="loading" @click="refresh">
          <template #icon><ReloadOutlined /></template>
          刷新
        </a-button>
        </a-space>
      </template>

      <a-alert v-if="errMsg" type="warning" show-icon class="mb-4">
        <template #message>无法获取数据</template>
        <template #description>{{ errMsg }}</template>
      </a-alert>

      <a-row :gutter="[12, 12]" class="statRow">
        <a-col v-for="item in statItems" :key="item.key" class="statCol" :xs="24" :sm="12" :lg="8">
          <a-card :bordered="true" class="statCard" @click="router.push(item.path)">
            <div class="statInner">
              <div class="statTop">
                <div class="statHeader">
                  <component :is="item.icon" class="statIcon" />
                  <div class="statTitle">{{ item.title }}</div>
                </div>
                <RightOutlined class="goIcon" />
              </div>
              <div class="statNum">
                <a-statistic :value="item.value" />
              </div>
              <!-- 占位固定高度，避免有/无副标题时卡片高低不齐；同行卡片由列 flex 拉齐 -->
              <div class="statSubWrap">
                <span v-if="item.sub" class="statSub">{{ item.sub }}</span>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </a-card>

    <a-card :bordered="true" title="快捷入口">
      <a-row :gutter="[12, 12]">
        <a-col v-for="entry in quickEntries" :key="entry.key" :xs="12" :sm="8" :lg="6">
          <a-button block class="quickBtn" @click="router.push(entry.path)">
            <template #icon><component :is="entry.icon" /></template>
            {{ entry.title }}
          </a-button>
        </a-col>
      </a-row>
    </a-card>
  </a-space>
</template>

<style scoped>
.updateHint {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: rgba(0, 0, 0, 0.55);
  font-size: 12px;
}
.statRow :deep(.ant-col) {
  display: flex;
}
.statCol {
  display: flex;
}
.statCard {
  cursor: pointer;
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease;
}
.statCard:hover {
  border-color: #c8dfff !important;
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.12);
  transform: translateY(-1px);
}
.statCard :deep(.ant-card-body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 14px;
  min-height: 0;
}
.statInner {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.statTop {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  margin-bottom: 8px;
}
.statNum {
  flex-shrink: 0;
}
.statNum :deep(.ant-statistic-content) {
  font-size: 22px;
  line-height: 1.25;
}
.statHeader {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.statIcon {
  font-size: 20px;
  color: #1677ff;
  opacity: 0.85;
}
.statTitle {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.65);
}
.goIcon {
  color: rgba(0, 0, 0, 0.3);
  font-size: 12px;
}
.statSubWrap {
  margin-top: auto;
  min-height: 40px;
  padding-top: 4px;
  display: flex;
  align-items: flex-start;
}
.statSub {
  font-size: 12px;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.55);
  word-break: break-word;
}
.quickBtn {
  text-align: left;
  height: 38px;
}
</style>
