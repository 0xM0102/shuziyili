export type ApiResponse<T> = {
  ok: boolean;
  message?: string | null;
  data?: T;
};

export type StaffRole = "admin" | "editor" | "operator" | "viewer";

/** GET /api/v1/staff/auth/me 当前登录后台用户 */
export type StaffMeDto = {
  id: string;
  identifier: string;
  role: StaffRole;
  nickname: string;
  avatarUrl: string;
  bio: string;
  createdAt: string;
  updatedAt: string;
};

/** 门户注册用户（无角色） */
export type PortalUserDto = {
  id: number;
  identifier: string;
  createdAt: number;
  updatedAt: number;
  nickname: string;
  avatarUrl: string;
  bio: string;
};

export type EventCategoryCode = "market" | "exhibition" | "show" | "family" | "sports";

export type ConvenienceServiceStatus = "common" | "external" | "pending" | "verified";

export type ConvenienceCategoryAdminDto = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
  keywords: string[];
  enabled: boolean;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
};

export type ConvenienceServiceAdminDto = {
  id: string;
  category: string;
  title: string;
  area: string;
  address: string;
  contact: string;
  hours: string;
  summary: string;
  tags: string[];
  status: ConvenienceServiceStatus;
  sourceUrl: string | null;
  mapUrl: string | null;
  emergency: boolean;
  enabled: boolean;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
};

export type ConvenienceCategoryUpsertPayload = {
  title: string;
  shortTitle?: string;
  description?: string;
  icon?: string;
  keywordsText?: string;
  enabled?: boolean;
  sortOrder?: number;
};

export type ConvenienceServiceUpsertPayload = {
  category: string;
  title: string;
  area?: string;
  address?: string;
  contact?: string;
  hours?: string;
  summary?: string;
  tagsText?: string;
  status: ConvenienceServiceStatus;
  sourceUrl?: string;
  mapUrl?: string;
  emergency?: boolean;
  enabled?: boolean;
  sortOrder?: number;
};

export type EventAdminDto = {
  id: string;
  title: string;
  summary: string;
  coverUrl: string;
  location: string;
  category: EventCategoryCode;
  startsAt: number;
  endsAt: number;
  organizer: string;
  registerUrl: string | null;
  highlights: string[];
  published: boolean;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
};

export type EventUpsertPayload = {
  title: string;
  summary?: string;
  coverUrl?: string;
  location?: string;
  category: EventCategoryCode;
  startsAt: number;
  endsAt: number;
  organizer?: string;
  registerUrl?: string;
  highlightsText?: string;
  published?: boolean;
  sortOrder?: number;
};

/** 后台操作员 */
export type StaffUserDto = {
  id: number;
  identifier: string;
  role: StaffRole;
  createdAt: number;
  updatedAt: number;
  nickname: string;
  avatarUrl: string;
  bio: string;
};

export type StaffRoleDto = {
  roleName: StaffRole;
  displayName: string;
  enabled: boolean;
  sortOrder: number;
};

export type PortalUpstreamStatus = {
  enabled: boolean;
  configured: boolean;
};

export type PortalDataSource = {
  id: string;
  label: string;
  scope: string;
  group: "news" | "weather" | "home";
  enabled: boolean;
  upstream: PortalUpstreamStatus;
};

export type PortalSettingsAdminDto = {
  newsProvider: string;
  weatherProvider: string;
  homeAreaNewsEnabled: boolean;
  tianapiAreaname: string;
  sources: PortalDataSource[];
  envDefaults: {
    newsProvider: string;
    weatherProvider: string;
    tianapiAreaname: string;
  };
  upstream: {
    juheNews: PortalUpstreamStatus;
    juheWeather: PortalUpstreamStatus;
    tianapiNews: PortalUpstreamStatus;
    tencentNews: PortalUpstreamStatus;
    tencentWeather: PortalUpstreamStatus;
  };
  dbOverrides: Record<string, string>;
};

export type StaffPermissionDto = {
  permissionCode: string;
  displayName: string;
  description: string;
  enabled: boolean;
};

export type StaffRolePermissionsDto = {
  roleName: StaffRole;
  permissionCodes: string[];
};

/**
 * API 根地址（不含末尾 /）。
 * - 生产：设 `VITE_API_BASE_URL`（或与站点同域相对路径则留空）。
 * - 开发：默认留空，请求走当前源下的 `/api/...`，由 `vite.config.ts` 代理到后端，避免浏览器跨域与 CORS。
 *   若需浏览器直连 `http://localhost:8080`（例如未用 Vite），可设 `VITE_API_BASE_URL=http://localhost:8080`。
 */
function resolveApiBase(): string {
  const fromEnv = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim().replace(/\/$/, "") ?? "";
  if (fromEnv) return fromEnv;
  return "";
}

const API_BASE = resolveApiBase();

function apiUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return API_BASE ? `${API_BASE}${path}` : path;
}

/** 管理端列表 `?q=` 搜索（与 Spring `@RequestParam q` 约定一致） */
function adminListPathWithQ(basePath: string, q?: string): string {
  const needle = q?.trim();
  return needle ? `${basePath}?q=${encodeURIComponent(needle)}` : basePath;
}

const TOKEN_KEY = "shuziyili_admin_token";

/** 后台首页精选槽位（对应 API `AdminHomeArticleController`） */
const ADMIN_HOME_ARTICLES_API = "/api/v1/admin/home-articles";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let resp: Response;
  try {
    resp = await fetch(apiUrl(path), { ...init, headers });
  } catch {
    return { ok: false, message: "network_error" };
  }

  const text = await resp.text();
  try {
    return JSON.parse(text) as ApiResponse<T>;
  } catch {
    return { ok: false, message: resp.ok ? "parse_error" : `http_${resp.status}` };
  }
}

export const api = {
  /** 管理后台登录态（与门户 /api/v1/auth 隔离） */
  auth: {
    async login(identifier: string, password: string) {
      return request<{ token: string; identifier: string }>("/api/v1/staff/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier, password }),
      });
    },
    async me() {
      return request<StaffMeDto>("/api/v1/staff/auth/me", { method: "GET" });
    },
    async updateProfile(payload: {
      nickname: string;
      avatarUrl: string;
      bio: string;
    }) {
      // 与门户 PUT /api/v1/auth/profile 对称；用 POST 避免部分环境下对 /me 的 PUT 出现 405
      return request<StaffMeDto>("/api/v1/staff/auth/profile", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    async changePassword(oldPassword: string, newPassword: string) {
      return request<void>("/api/v1/staff/auth/password", {
        method: "PUT",
        body: JSON.stringify({ oldPassword, newPassword }),
      });
    },
    async logout() {
      return request<void>("/api/v1/staff/auth/logout", { method: "POST" });
    },
  },
  admin: {
    dashboard: {
      async summary() {
        return request<{
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
        }>(`/api/v1/admin/dashboard/summary`, { method: "GET" });
      },
    },
    portalUsers: {
      async list(q?: string) {
        return request<{ items: PortalUserDto[] }>(adminListPathWithQ("/api/v1/admin/portal-users", q), {
          method: "GET",
        });
      },
      async updateProfile(
        id: number,
        payload: { nickname: string; avatarUrl: string; bio: string }
      ) {
        return request<PortalUserDto>(`/api/v1/admin/portal-users/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      },
    },
    staff: {
      async list(q?: string) {
        return request<{ items: StaffUserDto[] }>(adminListPathWithQ("/api/v1/admin/staff", q), {
          method: "GET",
        });
      },
      async setRole(id: number, role: StaffRole) {
        return request<StaffUserDto>(`/api/v1/admin/staff/${id}/role`, {
          method: "PUT",
          body: JSON.stringify({ role }),
        });
      },
      async updateProfile(
        id: number,
        payload: { nickname: string; avatarUrl: string; bio: string }
      ) {
        return request<StaffUserDto>(`/api/v1/admin/staff/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      },
      async create(payload: {
        identifier: string;
        password: string;
        role: StaffRole;
        nickname?: string;
        avatarUrl?: string;
        bio?: string;
      }) {
        return request<StaffUserDto>("/api/v1/admin/staff", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      },
    },
    verificationRecords: {
      async list(page = 0, size = 50) {
        return request<{
          items: {
            id: number;
            recipient: string;
            scene: string;
            createdAt: number;
            expiresAt: number;
            used: boolean;
            usedAt: number;
            /** 开启 API 的 store-plain-otp 时才有 */
            plainCode: string | null;
            /** HTTP 来源（Origin / Referer / Host） */
            requestOrigin: string | null;
          }[];
          total: number;
          page: number;
          size: number;
        }>(`/api/v1/admin/verification-records?page=${page}&size=${size}`, { method: "GET" });
      },
    },
    flashLinks: {
      async list() {
        return request<{
          items: {
            id: number;
            title: string;
            url: string;
            linkKind: "EXTERNAL" | "INTERNAL";
            sourceLabel: string;
            tagId: number | null;
            sortOrder: number;
            enabled: boolean;
            publishedAt: number;
            createdAt: number;
            updatedAt: number;
          }[];
        }>("/api/v1/admin/flash-links", { method: "GET" });
      },
      async create(payload: {
        linkKind?: "EXTERNAL" | "INTERNAL";
        title: string;
        url: string;
        sourceLabel?: string;
        tagId?: number | null;
        sortOrder: number;
        enabled: boolean;
        publishedAt: number;
      }) {
        return request<{
          id: number;
          title: string;
          url: string;
          linkKind: "EXTERNAL" | "INTERNAL";
          sourceLabel: string;
          tagId: number | null;
          sortOrder: number;
          enabled: boolean;
          publishedAt: number;
          createdAt: number;
          updatedAt: number;
        }>("/api/v1/admin/flash-links", { method: "POST", body: JSON.stringify(payload) });
      },
      async update(
        id: number,
        payload: {
          linkKind?: "EXTERNAL" | "INTERNAL";
          title: string;
          url: string;
          sourceLabel?: string;
          tagId?: number | null;
          sortOrder: number;
          enabled: boolean;
          publishedAt: number;
        }
      ) {
        return request<{
          id: number;
          title: string;
          url: string;
          linkKind: "EXTERNAL" | "INTERNAL";
          sourceLabel: string;
          tagId: number | null;
          sortOrder: number;
          enabled: boolean;
          publishedAt: number;
          createdAt: number;
          updatedAt: number;
        }>(`/api/v1/admin/flash-links/${id}`, { method: "PUT", body: JSON.stringify(payload) });
      },
      async remove(id: number) {
        return request<void>(`/api/v1/admin/flash-links/${id}`, { method: "DELETE" });
      },
    },
    flashTags: {
      async list(targetKind: "FLASH" | "ARTICLE") {
        return request<{
          items: {
            id: number;
            targetKind: "FLASH" | "ARTICLE";
            label: string;
            sortOrder: number;
            enabled: boolean;
            createdAt: number;
            updatedAt: number;
          }[];
        }>(`/api/v1/admin/flash-tags?targetKind=${targetKind}`, { method: "GET" });
      },
      async create(payload: {
        targetKind: "FLASH" | "ARTICLE";
        label: string;
        enabled: boolean;
        sortOrder: number;
      }) {
        return request<{
          id: number;
          targetKind: "FLASH" | "ARTICLE";
          label: string;
          sortOrder: number;
          enabled: boolean;
          createdAt: number;
          updatedAt: number;
        }>(`/api/v1/admin/flash-tags`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      },
      async update(
        id: number,
        payload: {
          targetKind: "FLASH" | "ARTICLE";
          label: string;
          enabled: boolean;
          sortOrder: number;
        }
      ) {
        return request<{
          id: number;
          targetKind: "FLASH" | "ARTICLE";
          label: string;
          sortOrder: number;
          enabled: boolean;
          createdAt: number;
          updatedAt: number;
        }>(`/api/v1/admin/flash-tags/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      },
      async remove(id: number) {
        return request<void>(`/api/v1/admin/flash-tags/${id}`, { method: "DELETE" });
      },
    },
    events: {
      async list() {
        return request<{
          items: EventAdminDto[];
        }>("/api/v1/admin/events", { method: "GET" });
      },
      async create(payload: EventUpsertPayload & { id: string }) {
        return request<EventAdminDto>("/api/v1/admin/events", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      },
      async update(id: string, payload: EventUpsertPayload) {
        return request<EventAdminDto>(`/api/v1/admin/events/${encodeURIComponent(id)}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      },
      async remove(id: string) {
        return request<void>(`/api/v1/admin/events/${encodeURIComponent(id)}`, { method: "DELETE" });
      },
    },
    convenience: {
      async listCategories() {
        return request<{ items: ConvenienceCategoryAdminDto[] }>("/api/v1/admin/convenience/categories", {
          method: "GET",
        });
      },
      async createCategory(payload: ConvenienceCategoryUpsertPayload & { slug: string }) {
        return request<ConvenienceCategoryAdminDto>("/api/v1/admin/convenience/categories", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      },
      async updateCategory(slug: string, payload: ConvenienceCategoryUpsertPayload) {
        return request<ConvenienceCategoryAdminDto>(
          `/api/v1/admin/convenience/categories/${encodeURIComponent(slug)}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );
      },
      async removeCategory(slug: string) {
        return request<void>(`/api/v1/admin/convenience/categories/${encodeURIComponent(slug)}`, {
          method: "DELETE",
        });
      },
      async listServices() {
        return request<{ items: ConvenienceServiceAdminDto[] }>("/api/v1/admin/convenience/services", {
          method: "GET",
        });
      },
      async createService(payload: ConvenienceServiceUpsertPayload & { id: string }) {
        return request<ConvenienceServiceAdminDto>("/api/v1/admin/convenience/services", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      },
      async updateService(id: string, payload: ConvenienceServiceUpsertPayload) {
        return request<ConvenienceServiceAdminDto>(
          `/api/v1/admin/convenience/services/${encodeURIComponent(id)}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );
      },
      async removeService(id: string) {
        return request<void>(`/api/v1/admin/convenience/services/${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
      },
    },
    async listArticles() {
      return request<{
        items: {
          id: string;
          title: string;
          summary: string;
          content: string;
          coverUrl: string | null;
          status: string;
          createdAt: number;
          updatedAt: number;
        }[];
      }>("/api/v1/admin/articles", { method: "GET" });
    },
    async createArticle(payload: {
      title: string;
      summary: string;
      content: string;
      coverUrl?: string | null;
      status: "draft" | "published";
    }) {
      return request<{
        id: string;
        title: string;
        summary: string;
        content: string;
        coverUrl: string | null;
        status: string;
        createdAt: number;
        updatedAt: number;
      }>("/api/v1/admin/articles", { method: "POST", body: JSON.stringify(payload) });
    },
    async updateArticle(
      id: string,
      payload: {
        title: string;
        summary: string;
        content: string;
        coverUrl?: string | null;
        status: "draft" | "published";
      }
    ) {
      return request<{
        id: string;
        title: string;
        summary: string;
        content: string;
        coverUrl: string | null;
        status: string;
        createdAt: number;
        updatedAt: number;
      }>(`/api/v1/admin/articles/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
    async deleteArticle(id: string) {
      return request<void>(`/api/v1/admin/articles/${encodeURIComponent(id)}`, { method: "DELETE" });
    },
    /** 首页精选（独立槽位，非文章类型字段） */
    async listHomeArticleSlots() {
      return request<{
        items: {
          slotId: number;
          articleId: string;
          title: string;
          status: string;
          sortOrder: number;
        }[];
      }>(ADMIN_HOME_ARTICLES_API, { method: "GET" });
    },
    async replaceHomeArticleSlots(articleIds: string[]) {
      return request<void>(ADMIN_HOME_ARTICLES_API, {
        method: "PUT",
        body: JSON.stringify({ articleIds }),
      });
    },
    async listBanners(scope: "home" | "travel" = "home") {
      const q = `?scope=${encodeURIComponent(scope)}`;
      return request<{
        items: {
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
        }[];
      }>(`/api/v1/admin/banners${q}`, { method: "GET" });
    },
    async createBanner(payload: {
      scope: "home" | "travel";
      title: string;
      imageUrl: string;
      linkUrl?: string | null;
      slot: string;
      enabled: boolean;
      sortOrder: number;
    }) {
      return request<{
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
      }>("/api/v1/admin/banners", { method: "POST", body: JSON.stringify(payload) });
    },
    async updateBanner(
      id: number,
      payload: {
        title: string;
        imageUrl: string;
        linkUrl?: string | null;
        slot: string;
        enabled: boolean;
        sortOrder: number;
      }
    ) {
      return request<{
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
      }>(`/api/v1/admin/banners/${id}`, { method: "PUT", body: JSON.stringify(payload) });
    },
    async deleteBanner(id: number) {
      return request<void>(`/api/v1/admin/banners/${id}`, { method: "DELETE" });
    },
    async mediaConfig() {
      return request<{
        enabled: boolean;
        configured: boolean;
        region: string;
        bucket: string;
        publicBaseUrl: string;
        keyPrefix: string;
      }>("/api/v1/admin/media/config", { method: "GET" });
    },
    async listMedia(prefix?: string) {
      const q = prefix ? `?prefix=${encodeURIComponent(prefix)}` : "";
      return request<{ items: { key: string; size: number; lastModified: number; url: string }[] }>(
        `/api/v1/admin/media${q}`,
        { method: "GET" }
      );
    },
    /** @param scope `cms` 默认（文章/Banner/媒体库）；`staff_avatar` 后台操作员头像目录 */
    async uploadMedia(file: File, opts?: { scope?: "cms" | "staff_avatar" }) {
      const token = getToken();
      const headers = new Headers();
      if (token) headers.set("Authorization", `Bearer ${token}`);
      const body = new FormData();
      body.append("file", file);
      // 与 query 相比，multipart 表单字段更可靠（部分代理/客户端对 multipart+query 的 scope 会丢，导致落默认 cms/）
      const scope = opts?.scope ?? "cms";
      body.append("scope", scope);
      let resp: Response;
      try {
        resp = await fetch(apiUrl("/api/v1/admin/media/upload"), { method: "POST", headers, body });
      } catch {
        return { ok: false, message: "network_error" } as ApiResponse<{ key: string; url: string }>;
      }
      const text = await resp.text();
      try {
        return JSON.parse(text) as ApiResponse<{ key: string; url: string }>;
      } catch {
        return { ok: false, message: "parse_error" } as ApiResponse<{ key: string; url: string }>;
      }
    },
    async deleteMedia(key: string) {
      return request<void>(`/api/v1/admin/media?key=${encodeURIComponent(key)}`, { method: "DELETE" });
    },
    async getPortalSettings() {
      return request<PortalSettingsAdminDto>("/api/v1/admin/portal-settings", { method: "GET" });
    },
    async updatePortalSettingItem(settingKey: string, value: string) {
      return request<void>("/api/v1/admin/portal-settings/item", {
        method: "PUT",
        body: JSON.stringify({ settingKey, value }),
      });
    },
    rbac: {
      async listRoles() {
        return request<StaffRoleDto[]>(`/api/v1/admin/staff-roles`, { method: "GET" });
      },
      async listPermissions() {
        return request<StaffPermissionDto[]>(`/api/v1/admin/staff-permissions`, { method: "GET" });
      },
      async listRolePermissions(roleName: string) {
        return request<StaffRolePermissionsDto>(
          `/api/v1/admin/staff-roles/${encodeURIComponent(roleName)}/permissions`,
          { method: "GET" }
        );
      },
      async setRolePermissions(roleName: string, permissionCodes: string[]) {
        return request<StaffRolePermissionsDto>(
          `/api/v1/admin/staff-roles/${encodeURIComponent(roleName)}/permissions`,
          { method: "PUT", body: JSON.stringify({ permissionCodes }) }
        );
      },
    },
  },
};
