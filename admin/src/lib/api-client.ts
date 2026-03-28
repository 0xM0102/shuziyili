export type ApiResponse<T> = {
  ok: boolean;
  message?: string | null;
  data?: T;
};

/** 门户注册用户（无角色） */
export type PortalUserDto = {
  id: number;
  identifier: string;
  createdAt: number;
  updatedAt: number;
  displayName: string;
  nickname: string;
  avatarUrl: string;
  bio: string;
};

/** 后台操作员 */
export type StaffUserDto = {
  id: number;
  identifier: string;
  role: "admin" | "editor";
  createdAt: number;
  updatedAt: number;
  displayName: string;
  nickname: string;
  avatarUrl: string;
  bio: string;
};

/**
 * API 根地址（不含末尾 /）。
 * - 生产：设 `VITE_API_BASE_URL`（或与站点同域相对路径则留空）。
 * - 开发：`import.meta.env.DEV` 时默认直连 `http://localhost:8080`，避免仅依赖 Vite 代理时出现 5174 上 /api 404。
 */
function resolveApiBase(): string {
  const fromEnv = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim().replace(/\/$/, "") ?? "";
  if (fromEnv) return fromEnv;
  if (import.meta.env.DEV) return "http://localhost:8080";
  return "";
}

const API_BASE = resolveApiBase();

function apiUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return API_BASE ? `${API_BASE}${path}` : path;
}

const TOKEN_KEY = "shuziyili_admin_token";

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
      return request<{
        identifier: string;
        role: "admin" | "editor";
        displayName: string;
        nickname: string;
        avatarUrl: string;
        bio: string;
        createdAt: string;
        updatedAt: string;
      }>("/api/v1/staff/auth/me", { method: "GET" });
    },
    async logout() {
      return request<void>("/api/v1/staff/auth/logout", { method: "POST" });
    },
  },
  admin: {
    portalUsers: {
      async list() {
        return request<{ items: PortalUserDto[] }>("/api/v1/admin/portal-users", { method: "GET" });
      },
      async updateProfile(
        id: number,
        payload: { displayName: string; nickname: string; avatarUrl: string; bio: string }
      ) {
        return request<PortalUserDto>(`/api/v1/admin/portal-users/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      },
    },
    staff: {
      async list() {
        return request<{ items: StaffUserDto[] }>("/api/v1/admin/staff", { method: "GET" });
      },
      async setRole(id: number, role: "admin" | "editor") {
        return request<StaffUserDto>(`/api/v1/admin/staff/${id}/role`, {
          method: "PUT",
          body: JSON.stringify({ role }),
        });
      },
      async updateProfile(
        id: number,
        payload: { displayName: string; nickname: string; avatarUrl: string; bio: string }
      ) {
        return request<StaffUserDto>(`/api/v1/admin/staff/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      },
      async create(payload: {
        identifier: string;
        password: string;
        role: "admin" | "editor";
        displayName?: string;
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
          }[];
          total: number;
          page: number;
          size: number;
        }>(`/api/v1/admin/verification-records?page=${page}&size=${size}`, { method: "GET" });
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
    async listBanners() {
      return request<{
        items: {
          id: number;
          title: string;
          imageUrl: string;
          linkUrl: string | null;
          slot: "home_main" | "home_side_top" | "home_side_bottom";
          enabled: boolean;
          sortOrder: number;
          createdAt: number;
          updatedAt: number;
        }[];
      }>("/api/v1/admin/banners", { method: "GET" });
    },
    async createBanner(payload: {
      title: string;
      imageUrl: string;
      linkUrl?: string | null;
      slot: "home_main" | "home_side_top" | "home_side_bottom";
      enabled: boolean;
      sortOrder: number;
    }) {
      return request<{
        id: number;
        title: string;
        imageUrl: string;
        linkUrl: string | null;
        slot: "home_main" | "home_side_top" | "home_side_bottom";
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
        slot: "home_main" | "home_side_top" | "home_side_bottom";
        enabled: boolean;
        sortOrder: number;
      }
    ) {
      return request<{
        id: number;
        title: string;
        imageUrl: string;
        linkUrl: string | null;
        slot: "home_main" | "home_side_top" | "home_side_bottom";
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
    async uploadMedia(file: File) {
      const token = getToken();
      const headers = new Headers();
      if (token) headers.set("Authorization", `Bearer ${token}`);
      const body = new FormData();
      body.append("file", file);
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
  },
};

