import { fetchPublicApiData } from "@/lib/api-base";
import { buildEventsApiPath } from "@/lib/events-filters";
import type { EventCategory, EventItem, EventStatus } from "@/lib/events-data";

type EventsListResponse = { items?: EventItem[] };

/** 门户活动列表（已发布；筛选由 API 处理）。 */
export async function fetchPortalEvents(
  status: EventStatus = "all",
  category: EventCategory | "all" = "all"
): Promise<EventItem[]> {
  const data = await fetchPublicApiData<EventsListResponse>(
    buildEventsApiPath(status, category),
    { items: [] }
  );
  return data.items ?? [];
}

/**
 * 列表页：无筛选时只请求一次；有筛选时再请求过滤结果。
 * Hero「最新活动」始终基于全量已发布列表。
 */
export async function fetchPortalEventsForListPage(
  status: EventStatus,
  category: EventCategory | "all"
): Promise<{ all: EventItem[]; filtered: EventItem[] }> {
  const all = await fetchPortalEvents("all", "all");
  if (status === "all" && category === "all") {
    return { all, filtered: all };
  }
  const filtered = await fetchPortalEvents(status, category);
  return { all, filtered };
}

/** 活动详情；不存在或已下架时返回 null。 */
export async function fetchPortalEventById(id: string): Promise<EventItem | null> {
  return fetchPublicApiData<EventItem | null>(`/events/${encodeURIComponent(id)}`, null);
}
