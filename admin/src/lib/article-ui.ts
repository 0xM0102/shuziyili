/** 文章 status 存库/API 为英文码；列表与弹窗用中文展示。 */
export function formatArticleStatus(status: string | null | undefined): string {
  const s = (status ?? "").trim().toLowerCase();
  if (s === "published") return "已发布";
  if (s === "draft") return "草稿";
  const raw = status?.trim();
  return raw || "—";
}
