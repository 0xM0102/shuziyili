/**
 * 浏览器/服务端请求后端时的 API 根路径，须指向 **`/api/v1`**。
 * 若环境变量只写了主机（如 `http://localhost:8080`），自动补全 `/api/v1`，避免请求落到 `/home/banners` 等错误路径导致「无数据」。
 */
export function getPublicApiV1Base(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, "") ?? "";
  if (!raw) {
    // Browser 端默认走同源反代，避免生产环境误落到 localhost。
    if (typeof window !== "undefined") return "/api/v1";
    return "http://localhost:8080/api/v1";
  }
  if (raw.endsWith("/api/v1")) return raw;
  return `${raw}/api/v1`;
}

/** 门户首页等 ISR 页面与快讯列表共用的 revalidate 秒数（与路由表中的 30s 一致）。 */
export const PUBLIC_API_REVALIDATE_SEC = 30;

/**
 * 服务端拉取 `ApiResponse<T>` 包装的公开 JSON（`data` 为业务体）。
 * 非 2xx、`ok !== true` 或缺少 `data` 时返回 `fallback`，避免页面因单次接口失败整体崩溃。
 */
export async function fetchPublicApiData<T>(path: string, fallback: T): Promise<T> {
  const base = getPublicApiV1Base();
  try {
    const res = await fetch(`${base}${path}`, { next: { revalidate: PUBLIC_API_REVALIDATE_SEC } });
    if (!res.ok) return fallback;
    const json = (await res.json()) as { ok?: boolean; data?: T };
    if (!json.ok || json.data === undefined) return fallback;
    return json.data;
  } catch {
    return fallback;
  }
}
