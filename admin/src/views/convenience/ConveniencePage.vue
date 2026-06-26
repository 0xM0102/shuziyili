<script setup lang="ts">
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons-vue";
import { computed, onMounted, reactive, ref } from "vue";
import {
  api,
  type ConvenienceCategoryAdminDto,
  type ConvenienceServiceAdminDto,
  type ConvenienceServiceStatus,
} from "@/lib/api-client";
import { mapApiMessage } from "@/lib/auth-messages";
import { message } from "ant-design-vue";

const statusOptions: { label: string; value: ConvenienceServiceStatus; color: string }[] = [
  { label: "常用入口", value: "common", color: "processing" },
  { label: "外部平台", value: "external", color: "blue" },
  { label: "待核实", value: "pending", color: "default" },
  { label: "已核验", value: "verified", color: "success" },
];

const iconOptions = [
  { label: "政务", value: "government" },
  { label: "医疗", value: "health" },
  { label: "快递", value: "shipping" },
  { label: "交通", value: "transport" },
  { label: "通信", value: "telecom" },
  { label: "银行", value: "banking" },
  { label: "采购", value: "shopping" },
  { label: "维修", value: "repair" },
  { label: "应急", value: "emergency" },
  { label: "社区", value: "community" },
  { label: "默认", value: "convenience" },
];

const localMessages: Record<string, string> = {
  invalid_slug: "分类标识需用小写英文、数字与连字符",
  category_has_services: "该分类下仍有服务，需先删除或迁移服务",
  invalid_source_url: "来源链接需以 http:// 或 https:// 开头",
  invalid_map_url: "地图链接需以 http:// 或 https:// 开头",
  invalid_status: "无效的服务状态",
};

const activeTab = ref<"services" | "categories">("services");
const loading = ref(false);
const categories = ref<ConvenienceCategoryAdminDto[]>([]);
const services = ref<ConvenienceServiceAdminDto[]>([]);
const selectedCategory = ref<string>("all");

const categoryModalOpen = ref(false);
const serviceModalOpen = ref(false);
const savingCategory = ref(false);
const savingService = ref(false);
const editingCategorySlug = ref<string | null>(null);
const editingServiceId = ref<string | null>(null);

const categoryForm = reactive({
  slug: "",
  title: "",
  shortTitle: "",
  description: "",
  icon: "convenience",
  keywordsText: "",
  enabled: true,
  sortOrder: 0,
});

const serviceForm = reactive({
  id: "",
  category: "",
  title: "",
  area: "",
  address: "",
  contact: "",
  hours: "",
  summary: "",
  tagsText: "",
  status: "pending" as ConvenienceServiceStatus,
  sourceUrl: "",
  mapUrl: "",
  emergency: false,
  enabled: true,
  sortOrder: 0,
});

const categoryOptions = computed(() =>
  categories.value.map((item) => ({ label: item.title, value: item.slug }))
);

const serviceRows = computed(() => {
  if (selectedCategory.value === "all") return services.value;
  return services.value.filter((item) => item.category === selectedCategory.value);
});

const categoryServiceCounts = computed(() => {
  const counts = new Map<string, number>();
  for (const service of services.value) {
    counts.set(service.category, (counts.get(service.category) ?? 0) + 1);
  }
  return counts;
});

function apiMessage(code: string | null | undefined) {
  return localMessages[code ?? ""] ?? mapApiMessage(code);
}

function categoryLabel(slug: string) {
  return categories.value.find((item) => item.slug === slug)?.title ?? slug;
}

function statusOption(status: ConvenienceServiceStatus) {
  return statusOptions.find((item) => item.value === status) ?? statusOptions[2];
}

function resetCategoryForm() {
  categoryForm.slug = "";
  categoryForm.title = "";
  categoryForm.shortTitle = "";
  categoryForm.description = "";
  categoryForm.icon = "convenience";
  categoryForm.keywordsText = "";
  categoryForm.enabled = true;
  categoryForm.sortOrder = categories.value.length * 10;
  editingCategorySlug.value = null;
}

function resetServiceForm() {
  serviceForm.id = "";
  serviceForm.category = categories.value[0]?.slug ?? "";
  serviceForm.title = "";
  serviceForm.area = "";
  serviceForm.address = "";
  serviceForm.contact = "";
  serviceForm.hours = "";
  serviceForm.summary = "";
  serviceForm.tagsText = "";
  serviceForm.status = "pending";
  serviceForm.sourceUrl = "";
  serviceForm.mapUrl = "";
  serviceForm.emergency = false;
  serviceForm.enabled = true;
  serviceForm.sortOrder = services.value.length * 10;
  editingServiceId.value = null;
}

async function refresh() {
  loading.value = true;
  try {
    const [categoryResp, serviceResp] = await Promise.all([
      api.admin.convenience.listCategories(),
      api.admin.convenience.listServices(),
    ]);
    if (!categoryResp.ok || !categoryResp.data) {
      categories.value = [];
      void message.error(apiMessage(categoryResp.message));
      return;
    }
    if (!serviceResp.ok || !serviceResp.data) {
      services.value = [];
      void message.error(apiMessage(serviceResp.message));
      return;
    }
    categories.value = categoryResp.data.items;
    services.value = serviceResp.data.items;
  } finally {
    loading.value = false;
  }
}

function openCreateCategory() {
  resetCategoryForm();
  categoryModalOpen.value = true;
}

function openEditCategory(row: ConvenienceCategoryAdminDto) {
  editingCategorySlug.value = row.slug;
  categoryForm.slug = row.slug;
  categoryForm.title = row.title;
  categoryForm.shortTitle = row.shortTitle;
  categoryForm.description = row.description;
  categoryForm.icon = row.icon;
  categoryForm.keywordsText = (row.keywords ?? []).join("\n");
  categoryForm.enabled = row.enabled;
  categoryForm.sortOrder = row.sortOrder;
  categoryModalOpen.value = true;
}

function openCreateService() {
  if (!categories.value.length) {
    void message.warning("请先创建便民分类");
    return;
  }
  resetServiceForm();
  serviceModalOpen.value = true;
}

function openEditService(row: ConvenienceServiceAdminDto) {
  editingServiceId.value = row.id;
  serviceForm.id = row.id;
  serviceForm.category = row.category;
  serviceForm.title = row.title;
  serviceForm.area = row.area;
  serviceForm.address = row.address;
  serviceForm.contact = row.contact;
  serviceForm.hours = row.hours;
  serviceForm.summary = row.summary;
  serviceForm.tagsText = (row.tags ?? []).join("\n");
  serviceForm.status = row.status;
  serviceForm.sourceUrl = row.sourceUrl ?? "";
  serviceForm.mapUrl = row.mapUrl ?? "";
  serviceForm.emergency = row.emergency;
  serviceForm.enabled = row.enabled;
  serviceForm.sortOrder = row.sortOrder;
  serviceModalOpen.value = true;
}

async function saveCategory() {
  const title = categoryForm.title.trim();
  if (!title) {
    void message.warning("请填写分类名称");
    return;
  }
  if (!editingCategorySlug.value && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(categoryForm.slug.trim())) {
    void message.warning("分类标识请用小写英文、数字与连字符");
    return;
  }
  savingCategory.value = true;
  try {
    const payload = {
      title,
      shortTitle: categoryForm.shortTitle.trim(),
      description: categoryForm.description.trim(),
      icon: categoryForm.icon,
      keywordsText: categoryForm.keywordsText,
      enabled: categoryForm.enabled,
      sortOrder: Number.isFinite(categoryForm.sortOrder) ? categoryForm.sortOrder : 0,
    };
    const r = editingCategorySlug.value
      ? await api.admin.convenience.updateCategory(editingCategorySlug.value, payload)
      : await api.admin.convenience.createCategory({ ...payload, slug: categoryForm.slug.trim() });
    if (!r.ok) {
      void message.error(apiMessage(r.message));
      return;
    }
    void message.success("已保存");
    categoryModalOpen.value = false;
    await refresh();
  } finally {
    savingCategory.value = false;
  }
}

async function saveService() {
  const title = serviceForm.title.trim();
  if (!title) {
    void message.warning("请填写服务名称");
    return;
  }
  if (!serviceForm.category) {
    void message.warning("请选择分类");
    return;
  }
  if (!editingServiceId.value && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(serviceForm.id.trim())) {
    void message.warning("服务标识请用小写英文、数字与连字符");
    return;
  }
  savingService.value = true;
  try {
    const payload = {
      category: serviceForm.category,
      title,
      area: serviceForm.area.trim(),
      address: serviceForm.address.trim(),
      contact: serviceForm.contact.trim(),
      hours: serviceForm.hours.trim(),
      summary: serviceForm.summary.trim(),
      tagsText: serviceForm.tagsText,
      status: serviceForm.status,
      sourceUrl: serviceForm.sourceUrl.trim(),
      mapUrl: serviceForm.mapUrl.trim(),
      emergency: serviceForm.emergency,
      enabled: serviceForm.enabled,
      sortOrder: Number.isFinite(serviceForm.sortOrder) ? serviceForm.sortOrder : 0,
    };
    const r = editingServiceId.value
      ? await api.admin.convenience.updateService(editingServiceId.value, payload)
      : await api.admin.convenience.createService({ ...payload, id: serviceForm.id.trim() });
    if (!r.ok) {
      void message.error(apiMessage(r.message));
      return;
    }
    void message.success("已保存");
    serviceModalOpen.value = false;
    await refresh();
  } finally {
    savingService.value = false;
  }
}

async function removeCategory(slug: string) {
  const r = await api.admin.convenience.removeCategory(slug);
  if (!r.ok) {
    void message.error(apiMessage(r.message));
    return;
  }
  void message.success("已删除");
  await refresh();
}

async function removeService(id: string) {
  const r = await api.admin.convenience.removeService(id);
  if (!r.ok) {
    void message.error(apiMessage(r.message));
    return;
  }
  void message.success("已删除");
  await refresh();
}

const categoryColumns = [
  { title: "分类", dataIndex: "title", key: "title", ellipsis: true },
  { title: "标识", dataIndex: "slug", key: "slug", width: 150 },
  { title: "短名", dataIndex: "shortTitle", key: "shortTitle", width: 100 },
  { title: "服务数", key: "serviceCount", width: 88 },
  { title: "启用", key: "enabled", width: 80 },
  { title: "排序", dataIndex: "sortOrder", key: "sortOrder", width: 80 },
  { title: "操作", key: "actions", width: 150 },
];

const serviceColumns = [
  { title: "服务", dataIndex: "title", key: "title", ellipsis: true },
  { title: "分类", key: "category", width: 110 },
  { title: "状态", key: "status", width: 96 },
  { title: "电话/入口", dataIndex: "contact", key: "contact", ellipsis: true, width: 150 },
  { title: "应急", key: "emergency", width: 72 },
  { title: "启用", key: "enabled", width: 72 },
  { title: "排序", dataIndex: "sortOrder", key: "sortOrder", width: 72 },
  { title: "操作", key: "actions", width: 150 },
];

onMounted(() => void refresh());
</script>

<template>
  <a-card :bordered="true" title="便民管理">
    <template #extra>
      <a-space>
        <a-button @click="refresh">
          <template #icon><ReloadOutlined /></template>
          刷新
        </a-button>
        <a-button v-if="activeTab === 'categories'" type="primary" @click="openCreateCategory">
          <template #icon><PlusOutlined /></template>
          新建分类
        </a-button>
        <a-button v-else type="primary" @click="openCreateService">
          <template #icon><PlusOutlined /></template>
          新建服务
        </a-button>
      </a-space>
    </template>

    <a-tabs v-model:activeKey="activeTab" type="line" class="mb-4">
      <a-tab-pane key="services" tab="服务条目" />
      <a-tab-pane key="categories" tab="分类配置" />
    </a-tabs>

    <template v-if="activeTab === 'categories'">
      <a-table
        :columns="categoryColumns"
        :data-source="categories"
        :loading="loading"
        row-key="slug"
        :pagination="{ pageSize: 20, showTotal: (t: number) => `共 ${t} 个分类` }"
        size="middle"
        :scroll="{ x: 900 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'serviceCount'">
            {{ categoryServiceCounts.get(record.slug) ?? 0 }}
          </template>
          <template v-if="column.key === 'enabled'">
            <a-tag :color="record.enabled ? 'success' : 'default'">
              {{ record.enabled ? "启用" : "停用" }}
            </a-tag>
          </template>
          <template v-if="column.key === 'actions'">
            <a-space>
              <a-button type="link" size="small" @click="openEditCategory(record)">编辑</a-button>
              <a-popconfirm title="确定删除此分类？" @confirm="removeCategory(record.slug)">
                <a-button type="link" danger size="small">删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </template>

    <template v-else>
      <div class="mb-4 flex justify-end">
        <a-select v-model:value="selectedCategory" style="width: 220px">
          <a-select-option value="all">全部分类</a-select-option>
          <a-select-option v-for="item in categories" :key="item.slug" :value="item.slug">
            {{ item.title }}
          </a-select-option>
        </a-select>
      </div>

      <a-table
        :columns="serviceColumns"
        :data-source="serviceRows"
        :loading="loading"
        row-key="id"
        :pagination="{ pageSize: 20, showTotal: (t: number) => `共 ${t} 条服务` }"
        size="middle"
        :scroll="{ x: 1100 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'category'">
            {{ categoryLabel(record.category) }}
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="statusOption(record.status).color">
              {{ statusOption(record.status).label }}
            </a-tag>
          </template>
          <template v-if="column.key === 'emergency'">
            <a-tag v-if="record.emergency" color="error">是</a-tag>
            <span v-else>—</span>
          </template>
          <template v-if="column.key === 'enabled'">
            <a-tag :color="record.enabled ? 'success' : 'default'">
              {{ record.enabled ? "是" : "否" }}
            </a-tag>
          </template>
          <template v-if="column.key === 'actions'">
            <a-space>
              <a-button type="link" size="small" @click="openEditService(record)">编辑</a-button>
              <a-popconfirm title="确定删除此服务？" @confirm="removeService(record.id)">
                <a-button type="link" danger size="small">删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </template>
  </a-card>

  <a-modal
    v-model:open="categoryModalOpen"
    :title="editingCategorySlug ? '编辑分类' : '新建分类'"
    width="640px"
    :confirm-loading="savingCategory"
    @ok="saveCategory"
    @cancel="categoryModalOpen = false"
  >
    <a-form layout="vertical">
      <a-form-item v-if="!editingCategorySlug" label="分类标识（URL 路径，创建后不可改）" required>
        <a-input v-model:value="categoryForm.slug" placeholder="例如 government" />
      </a-form-item>
      <a-form-item label="分类名称" required>
        <a-input v-model:value="categoryForm.title" placeholder="例如 政务便民" />
      </a-form-item>
      <a-form-item label="短名称">
        <a-input v-model:value="categoryForm.shortTitle" placeholder="侧栏和卡片中的短标题" />
      </a-form-item>
      <a-form-item label="图标">
        <a-select v-model:value="categoryForm.icon" :options="iconOptions" />
      </a-form-item>
      <a-form-item label="描述">
        <a-textarea v-model:value="categoryForm.description" :rows="3" />
      </a-form-item>
      <a-form-item label="搜索关键词（每行一个）">
        <a-textarea v-model:value="categoryForm.keywordsText" :rows="4" />
      </a-form-item>
      <a-form-item label="启用">
        <a-switch v-model:checked="categoryForm.enabled" />
      </a-form-item>
      <a-form-item label="排序（越小越靠前）">
        <a-input-number v-model:value="categoryForm.sortOrder" :min="0" :step="1" style="width: 100%" />
      </a-form-item>
    </a-form>
  </a-modal>

  <a-modal
    v-model:open="serviceModalOpen"
    :title="editingServiceId ? '编辑服务' : '新建服务'"
    width="760px"
    :confirm-loading="savingService"
    @ok="saveService"
    @cancel="serviceModalOpen = false"
  >
    <a-form layout="vertical">
      <a-form-item v-if="!editingServiceId" label="服务标识（创建后不可改）" required>
        <a-input v-model:value="serviceForm.id" placeholder="例如 public-hotline-12345" />
      </a-form-item>
      <a-form-item label="分类" required>
        <a-select v-model:value="serviceForm.category" :options="categoryOptions" />
      </a-form-item>
      <a-form-item label="服务名称" required>
        <a-input v-model:value="serviceForm.title" placeholder="例如 政务服务便民热线" />
      </a-form-item>
      <a-form-item label="状态">
        <a-select v-model:value="serviceForm.status" :options="statusOptions" />
      </a-form-item>
      <a-form-item label="区域">
        <a-input v-model:value="serviceForm.area" placeholder="例如 全州 / 伊宁市及周边" />
      </a-form-item>
      <a-form-item label="地址或入口">
        <a-input v-model:value="serviceForm.address" />
      </a-form-item>
      <a-form-item label="电话或联系入口">
        <a-input v-model:value="serviceForm.contact" />
      </a-form-item>
      <a-form-item label="服务时间">
        <a-input v-model:value="serviceForm.hours" />
      </a-form-item>
      <a-form-item label="简介">
        <a-textarea v-model:value="serviceForm.summary" :rows="3" />
      </a-form-item>
      <a-form-item label="标签（每行一个）">
        <a-textarea v-model:value="serviceForm.tagsText" :rows="4" />
      </a-form-item>
      <a-form-item label="来源链接">
        <a-input v-model:value="serviceForm.sourceUrl" placeholder="https://..." />
      </a-form-item>
      <a-form-item label="地图链接">
        <a-input v-model:value="serviceForm.mapUrl" placeholder="https://..." />
      </a-form-item>
      <a-form-item label="应急专区展示">
        <a-switch v-model:checked="serviceForm.emergency" />
      </a-form-item>
      <a-form-item label="启用">
        <a-switch v-model:checked="serviceForm.enabled" />
      </a-form-item>
      <a-form-item label="排序（越小越靠前）">
        <a-input-number v-model:value="serviceForm.sortOrder" :min="0" :step="1" style="width: 100%" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
