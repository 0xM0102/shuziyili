/**
 * 浏览器/服务端请求后端时的 API 根路径，须指向 **`/api/v1`**。
 * 若环境变量只写了主机（如 `http://localhost:8080`），自动补全 `/api/v1`，避免请求落到 `/home/banners` 等错误路径导致「无数据」。
 */
export function getPublicApiV1Base(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, "") ?? "";
  if (!raw) return "http://localhost:8080/api/v1";
  if (raw.endsWith("/api/v1")) return raw;
  return `${raw}/api/v1`;
}
