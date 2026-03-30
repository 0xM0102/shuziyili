<script setup lang="ts">
import {
  FileTextOutlined,
  HomeOutlined,
  LinkOutlined,
  PictureOutlined,
  ReloadOutlined,
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
  } finally {
    loading.value = false;
  }
}

onMounted(() => void refresh());
</script>

<template>
  <a-space direction="vertical" size="middle" style="width: 100%">
    <a-card :bordered="true" title="概览">
      <template #extra>
        <a-button :loading="loading" @click="refresh">
          <template #icon><ReloadOutlined /></template>
          刷新
        </a-button>
      </template>

      <a-alert v-if="errMsg" type="warning" show-icon class="mb-4">
        <template #message>无法获取数据</template>
        <template #description>{{ errMsg }}</template>
      </a-alert>

      <a-row :gutter="[12, 12]">
        <a-col :xs="24" :sm="12" :lg="8">
          <a-card :bordered="true" class="statCard" @click="router.push('/portal-users')">
            <a-space align="start">
              <UserOutlined class="statIcon" />
              <div>
                <div class="statTitle">平台用户</div>
                <a-statistic :value="summary?.portalUsersTotal ?? 0" />
              </div>
            </a-space>
          </a-card>
        </a-col>

        <a-col :xs="24" :sm="12" :lg="8">
          <a-card :bordered="true" class="statCard" @click="router.push('/staff-users')">
            <a-space align="start">
              <UserSwitchOutlined class="statIcon" />
              <div>
                <div class="statTitle">后台账号</div>
                <a-statistic :value="summary?.staffUsersTotal ?? 0" />
              </div>
            </a-space>
          </a-card>
        </a-col>

        <a-col :xs="24" :sm="12" :lg="8">
          <a-card :bordered="true" class="statCard" @click="router.push('/articles')">
            <a-space align="start">
              <FileTextOutlined class="statIcon" />
              <div>
                <div class="statTitle">文章</div>
                <a-statistic :value="summary?.articlesTotal ?? 0" />
                <div class="statSub">
                  已发布 {{ summary?.articlesPublished ?? 0 }} · 草稿 {{ summary?.articlesDraft ?? 0 }}
                </div>
              </div>
            </a-space>
          </a-card>
        </a-col>

        <a-col :xs="24" :sm="12" :lg="8">
          <a-card :bordered="true" class="statCard" @click="router.push('/flash-links')">
            <a-space align="start">
              <LinkOutlined class="statIcon" />
              <div>
                <div class="statTitle">快讯</div>
                <a-statistic :value="summary?.flashTotal ?? 0" />
                <div class="statSub">
                  启用 {{ summary?.flashEnabled ?? 0 }}（{{ flashEnabledRate }}%） ·
                  外链 {{ summary?.flashExternalTotal ?? 0 }} · 站内 {{ summary?.flashInternalTotal ?? 0 }}
                </div>
              </div>
            </a-space>
          </a-card>
        </a-col>

        <a-col :xs="24" :sm="12" :lg="8">
          <a-card :bordered="true" class="statCard" @click="router.push('/flash-tags')">
            <a-space align="start">
              <TagsOutlined class="statIcon" />
              <div>
                <div class="statTitle">标签</div>
                <a-statistic :value="summary?.flashTagsTotal ?? 0" />
              </div>
            </a-space>
          </a-card>
        </a-col>

        <a-col :xs="24" :sm="12" :lg="8">
          <a-card :bordered="true" class="statCard" @click="router.push('/banners')">
            <a-space align="start">
              <HomeOutlined class="statIcon" />
              <div>
                <div class="statTitle">Banner</div>
                <a-statistic :value="summary?.bannersTotal ?? 0" />
              </div>
            </a-space>
          </a-card>
        </a-col>
      </a-row>
    </a-card>

    <a-card :bordered="true" title="快捷入口">
      <a-space wrap>
        <a-button type="primary" @click="router.push('/portal-users')">
          <template #icon><UserOutlined /></template>
          平台用户
        </a-button>
        <a-button @click="router.push('/staff-users')">
          <template #icon><UserSwitchOutlined /></template>
          后台账号
        </a-button>
        <a-button @click="router.push('/articles')">
          <template #icon><FileTextOutlined /></template>
          文章管理
        </a-button>
        <a-button @click="router.push('/flash-links')">
          <template #icon><LinkOutlined /></template>
          快讯
        </a-button>
        <a-button @click="router.push('/flash-tags')">
          <template #icon><TagsOutlined /></template>
          标签管理
        </a-button>
        <a-button @click="router.push('/banners')">
          <template #icon><HomeOutlined /></template>
          Banner 管理
        </a-button>
        <a-button @click="router.push('/media')">
          <template #icon><PictureOutlined /></template>
          媒体库
        </a-button>
      </a-space>
    </a-card>
  </a-space>
</template>

<style scoped>
.statCard {
  cursor: pointer;
}
.statCard :deep(.ant-card-body) {
  padding: 14px 14px;
}
.statIcon {
  font-size: 22px;
  color: rgba(0, 0, 0, 0.55);
  margin-top: 2px;
}
.statTitle {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.65);
  margin-bottom: 6px;
}
.statSub {
  margin-top: 6px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.55);
}
</style>
