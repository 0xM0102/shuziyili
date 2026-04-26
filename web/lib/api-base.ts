const API_V1_SUFFIX = "/api/v1";
const LOCAL_API_V1_BASE = "http://localhost:8080/api/v1";

function normalizeApiBase(raw: string): string {
  const trimmed = raw.trim().replace(/\/$/, "");
  if (!trimmed) return "";
  return trimmed.endsWith(API_V1_SUFFIX) ? trimmed : `${trimmed}${API_V1_SUFFIX}`;
}

function browserDefaultApiBase(): string {
  if (typeof window === "undefined") return LOCAL_API_V1_BASE;
  // 本地开发没有 Nginx 同源反代时，优先直连本地 API，避免“页面无数据”假故障。
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return LOCAL_API_V1_BASE;
  }
  // 生产浏览器默认走同源反代，避免错误回退到 localhost。
  return API_V1_SUFFIX;
}

/**
 * 浏览器/服务端请求后端时的 API 根路径，须指向 **`/api/v1`**。
 * 若环境变量只写主机（如 `http://localhost:8080`），自动补全 `/api/v1`，避免请求落到错误路径。
 */
export function getPublicApiV1Base(): string {
  const configured = normalizeApiBase(process.env.NEXT_PUBLIC_API_BASE_URL ?? "");
  if (configured) return configured;
  return browserDefaultApiBase();
}

/** 门户首页等 ISR 页面与快讯列表共用的 revalidate 秒数（与路由表中的 30s 一致）。 */
export const PUBLIC_API_REVALIDATE_SEC = 30;

/** 资讯走服务端聚合缓存，与后端 `JUHE_NEWS_REFRESH_SECONDS` 对齐，避免 CDN/ISR 高频打自家 API。 */
export const NEWS_API_REVALIDATE_SEC = 3600;

async function fetchApiResponseData<T>(
  path: string,
  fallback: T,
  revalidateSeconds: number
): Promise<T> {
  const base = getPublicApiV1Base();
  try {
    const res = await fetch(`${base}${path}`, {
      next: { revalidate: revalidateSeconds },
    });
    if (!res.ok) return fallback;
    const json = (await res.json()) as { ok?: boolean; data?: T };
    if (!json.ok || json.data === undefined) return fallback;
    return json.data;
  } catch {
    return fallback;
  }
}

/**
 * 服务端拉取 `ApiResponse<T>` 包装的公开 JSON（`data` 为业务体）。
 * 非 2xx、`ok !== true` 或缺少 `data` 时返回 `fallback`，避免页面因单次接口失败整体崩溃。
 */
export async function fetchPublicApiData<T>(path: string, fallback: T): Promise<T> {
  return fetchApiResponseData(path, fallback, PUBLIC_API_REVALIDATE_SEC);
}

/** 资讯接口：较长 revalidate，与后端聚合新闻缓存策略一致。 */
export async function fetchNewsApiData<T>(path: string, fallback: T): Promise<T> {
  return fetchApiResponseData(path, fallback, NEWS_API_REVALIDATE_SEC);
}
