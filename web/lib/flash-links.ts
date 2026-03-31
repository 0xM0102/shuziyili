import { fetchPublicApiData } from "@/lib/api-base";

export type FlashLinkKind = "EXTERNAL" | "INTERNAL";

export type FlashLinkItem = {
  id: number;
  title: string;
  url: string;
  linkKind: FlashLinkKind;
  sourceLabel: string;
  tagId: number | null;
  tagLabel: string;
  publishedAt: number;
};

function normalizeKind(raw: unknown): FlashLinkKind {
  return raw === "INTERNAL" ? "INTERNAL" : "EXTERNAL";
}

/** 将公开接口返回的单条记录规范为 FlashLinkItem（列表项与详情结构相同） */
function parseFlashRecord(raw: Record<string, unknown>): FlashLinkItem {
  return {
    id: Number(raw.id),
    title: String(raw.title ?? ""),
    url: String(raw.url ?? ""),
    linkKind: normalizeKind(raw.linkKind),
    sourceLabel: String(raw.sourceLabel ?? ""),
    tagId: raw.tagId == null ? null : Number(raw.tagId),
    tagLabel: String(raw.tagLabel ?? ""),
    publishedAt: Number(raw.publishedAt ?? 0),
  };
}

/** 门户各处的「7×24 快讯」列表（最多 30 条，与 API 一致） */
export async function getFlashLinks(): Promise<FlashLinkItem[]> {
  const data = await fetchPublicApiData<{ items?: unknown[] }>("/home/flash-links", { items: [] });
  const raw = data.items ?? [];
  const out: FlashLinkItem[] = [];
  for (const row of raw) {
    if (row && typeof row === "object") {
      out.push(parseFlashRecord(row as Record<string, unknown>));
    }
  }
  return out;
}

/** 单条快讯（仅启用），用于 /flash/[id] */
export async function getFlashLinkById(id: number): Promise<FlashLinkItem | null> {
  if (!Number.isFinite(id) || id <= 0) return null;
  const data = await fetchPublicApiData<Record<string, unknown> | null>(
    `/home/flash-links/${id}`,
    null,
  );
  if (!data) return null;
  return parseFlashRecord(data);
}

/** 时间戳：M/D HH:mm（始终带日期，符合时间线样式） */
export function formatFlashStamp(ms: number): string {
  const d = new Date(ms);
  const hm = d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${d.getMonth() + 1}/${d.getDate()} ${hm}`;
}

/** 兼容旧用法：保留函数名，但现在也始终带日期 */
export function formatFlashTime(ms: number): string {
  return formatFlashStamp(ms);
}
