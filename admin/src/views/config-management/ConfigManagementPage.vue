<script setup lang="ts">
import { EditOutlined, ReloadOutlined, SettingOutlined } from "@ant-design/icons-vue";
import { computed, onMounted, ref } from "vue";
import { api, type PortalDataSource, type PortalUpstreamStatus } from "@/lib/api-client";
import { mapApiMessage } from "@/lib/auth-messages";
import { message } from "ant-design-vue";

type SourceGroup = "news" | "weather" | "home";

const TIANAPI_SOURCE_IDS = new Set(["source.tianapi-news", "source.tianapi-home"]);

const GROUP_ORDER: SourceGroup[] = ["news", "weather", "home"];

const GROUP_META: Record<SourceGroup, { title: string; desc: string; hint?: string }> = {
  news: { title: "主资讯", desc: "门户 /news", hint: "同时仅可启用一个数据源" },
  weather: {
    title: "天气",
    desc: "门户 /weather",
    hint: "聚合天气无逐小时预报；同时仅可启用一个",
  },
  home: { title: "首页", desc: "地区资讯模块", hint: "与天聚主资讯独立，可单独开关" },
};

const loading = ref(false);
const togglingId = ref<string | null>(null);
const savingAreaname = ref(false);
const areanameDrawerOpen = ref(false);
const areanameDraft = ref("");
const sources = ref<PortalDataSource[]>([]);
const tianapiAreaname = ref("");
const envDefaults = ref<{
  newsProvider: string;
  weatherProvider: string;
  tianapiAreaname: string;
} | null>(null);

const envHint = computed(() => {
  const d = envDefaults.value;
  if (!d) return "";
  return `未切换时回退 env：资讯 ${d.newsProvider} · 天气 ${d.weatherProvider}`;
});

const groupedSources = computed(() =>
  GROUP_ORDER.map((key) => ({
    key,
    ...GROUP_META[key],
    items: sources.value.filter((s) => s.group === key),
  })).filter((g) => g.items.length > 0)
);

const areanameDisplay = computed(() => tianapiAreaname.value.trim() || "未设置");

function isTianapiSource(row: PortalDataSource) {
  return TIANAPI_SOURCE_IDS.has(row.id);
}

function upstreamTag(u: PortalUpstreamStatus | undefined) {
  if (!u) return { color: "default", text: "—" };
  if (u.configured) return { color: "success", text: "Key 已配置" };
  if (u.enabled) return { color: "warning", text: "未配 Key" };
  return { color: "default", text: "env 未启用" };
}

function rowHint(row: PortalDataSource) {
  if (row.enabled) return "当前生效";
  if (!row.upstream?.configured) return "需先在 api.env 配置 Key";
  return "";
}

function openAreanameDrawer() {
  areanameDraft.value = tianapiAreaname.value;
  areanameDrawerOpen.value = true;
}

async function load() {
  loading.value = true;
  try {
    const r = await api.admin.getPortalSettings();
    if (!r.ok || !r.data) {
      envDefaults.value = null;
      sources.value = [];
      void message.error(mapApiMessage(r.message));
      return;
    }
    envDefaults.value = r.data.envDefaults;
    sources.value = r.data.sources ?? [];
    tianapiAreaname.value = r.data.tianapiAreaname ?? "";
  } finally {
    loading.value = false;
  }
}

async function onToggle(row: PortalDataSource, checked: boolean) {
  if (togglingId.value) return;
  if (checked && !row.upstream?.configured) {
    void message.warning("请先在服务器 api.env 配置该数据源的 Key");
    return;
  }
  togglingId.value = row.id;
  try {
    const r = await api.admin.updatePortalSettingItem(row.id, checked ? "true" : "false");
    if (!r.ok) {
      void message.error(mapApiMessage(r.message));
      return;
    }
    void message.success("已更新");
    await load();
  } finally {
    togglingId.value = null;
  }
}

async function saveAreaname() {
  const value = areanameDraft.value.trim();
  if (!value) {
    void message.warning("请填写地区名");
    return;
  }
  savingAreaname.value = true;
  try {
    const r = await api.admin.updatePortalSettingItem("tianapi.areaname", value);
    if (!r.ok) {
      void message.error(mapApiMessage(r.message));
      return;
    }
    void message.success("地区名已保存");
    areanameDrawerOpen.value = false;
    await load();
  } finally {
    savingAreaname.value = false;
  }
}

onMounted(() => void load());
</script>

<template>
  <a-card :bordered="true">
    <template #title>
      <span class="titleRow">
        <SettingOutlined />
        <span>配置管理</span>
      </span>
    </template>
    <template #extra>
      <a-button size="small" @click="load">
        <template #icon><ReloadOutlined /></template>
        刷新
      </a-button>
    </template>

    <p v-if="envHint" class="envHint">{{ envHint }}</p>

    <a-spin :spinning="loading">
      <div class="groups">
        <section v-for="group in groupedSources" :key="group.key" class="group">
          <header class="groupHead">
            <div>
              <h3 class="groupTitle">{{ group.title }}</h3>
              <p class="groupDesc">{{ group.desc }}</p>
            </div>
            <span v-if="group.hint" class="groupHint">{{ group.hint }}</span>
          </header>

          <ul class="sourceList">
            <li
              v-for="row in group.items"
              :key="row.id"
              class="sourceRow"
              :class="{ sourceRowActive: row.enabled }"
            >
              <div class="sourceMain">
                <span class="sourceLabel">{{ row.label }}</span>
                <div class="sourceMeta">
                  <a-tag :color="upstreamTag(row.upstream).color" class="sourceTag">
                    {{ upstreamTag(row.upstream).text }}
                  </a-tag>
                  <span v-if="rowHint(row)" class="sourceStatus">{{ rowHint(row) }}</span>
                </div>
                <div
                  v-if="isTianapiSource(row) && row.upstream?.configured"
                  class="areanameInline"
                >
                  <span class="areanameInlineLabel">地区名</span>
                  <span class="areanameInlineValue">{{ areanameDisplay }}</span>
                  <a-button type="link" size="small" class="areanameBtn" @click="openAreanameDrawer">
                    <template #icon><EditOutlined /></template>
                    配置
                  </a-button>
                </div>
              </div>
              <a-switch
                :checked="row.enabled"
                :loading="togglingId === row.id"
                :disabled="!row.enabled && !row.upstream?.configured"
                checked-children="开"
                un-checked-children="关"
                @change="(checked: boolean) => onToggle(row, checked)"
              />
            </li>
          </ul>
        </section>
      </div>
    </a-spin>
  </a-card>

  <a-drawer
    v-model:open="areanameDrawerOpen"
    title="天聚地区名"
    placement="right"
    :width="400"
    :mask-closable="false"
    :destroy-on-close="false"
  >
    <template #extra>
      <a-button type="primary" :loading="savingAreaname" @click="saveAreaname">保存</a-button>
    </template>

    <a-form layout="vertical">
      <a-form-item label="areaname" required>
        <a-input
          v-model:value="areanameDraft"
          :maxlength="32"
          placeholder="新疆"
          allow-clear
        />
      </a-form-item>
      <p class="drawerHelp">
        省级名称，不带「省」「市」。主资讯选天聚、或开启首页天聚地区块时，请求天聚「地区新闻」接口使用此参数；两处共用同一配置。
      </p>
    </a-form>
  </a-drawer>
</template>

<style scoped>
.titleRow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.envHint {
  margin: 0 0 16px;
  font-size: 13px;
  color: #8c8c8c;
}

.groups {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.group {
  border: 1px solid #eef0f4;
  border-radius: 12px;
  overflow: hidden;
  background: #fafbfc;
}

.groupHead {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #eef0f4;
  background: #fff;
}

.groupTitle {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.88);
}

.groupDesc {
  margin: 2px 0 0;
  font-size: 12px;
  color: #8c8c8c;
}

.groupHint {
  flex-shrink: 0;
  font-size: 12px;
  color: #8c8c8c;
  text-align: right;
  max-width: 12rem;
  line-height: 1.4;
}

.sourceList {
  margin: 0;
  padding: 8px;
  list-style: none;
}

.sourceRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 14px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid transparent;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.sourceRow + .sourceRow {
  margin-top: 6px;
}

.sourceRowActive {
  border-color: rgba(22, 119, 255, 0.35);
  box-shadow: 0 0 0 1px rgba(22, 119, 255, 0.08);
}

.sourceMain {
  min-width: 0;
  flex: 1;
}

.sourceLabel {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.88);
}

.sourceMeta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.sourceTag {
  margin: 0;
}

.sourceStatus {
  font-size: 12px;
  color: #8c8c8c;
}

.sourceRowActive .sourceStatus {
  color: #1677ff;
  font-weight: 500;
}

.areanameInline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 6px 10px;
  border-radius: 8px;
  background: #f5f8ff;
  border: 1px solid #e6eeff;
}

.areanameInlineLabel {
  font-size: 12px;
  color: #8c8c8c;
}

.areanameInlineValue {
  font-size: 13px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.88);
}

.areanameBtn {
  margin-left: auto;
  padding-inline: 4px;
  height: auto;
}

.drawerHelp {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: #8c8c8c;
}
</style>
