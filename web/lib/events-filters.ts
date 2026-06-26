import { parseFirstQueryValue } from "@/lib/search-params";
import {
  eventCategoryLabel,
  eventStatusLabel,
  isValidCategory,
  isValidStatus,
  type EventCategory,
  type EventStatus,
} from "@/lib/events-data";

export type EventListFilters = {
  status: EventStatus;
  category: EventCategory | "all";
};

export const EVENT_STATUS_OPTIONS = Object.keys(eventStatusLabel) as EventStatus[];

export const EVENT_CATEGORY_OPTIONS = [
  "all",
  ...(Object.keys(eventCategoryLabel) as EventCategory[]),
] as const;

export function parseEventListFilters(query: {
  status?: string | string[];
  category?: string | string[];
}): EventListFilters {
  const statusRaw = parseFirstQueryValue(query.status);
  const categoryRaw = parseFirstQueryValue(query.category);
  return {
    status: isValidStatus(statusRaw) ? statusRaw : "all",
    category: isValidCategory(categoryRaw) ? categoryRaw : "all",
  };
}

export function hasActiveEventFilters(filters: EventListFilters): boolean {
  return filters.status !== "all" || filters.category !== "all";
}

/** 门户活动列表页路径（含 query）。 */
export function buildEventsPageHref(status: EventStatus, category: EventCategory | "all"): string {
  return `/events${buildEventsQueryString(status, category)}`;
}

/** 公开 API `/events` 路径（含 query）。 */
export function buildEventsApiPath(status: EventStatus, category: EventCategory | "all"): string {
  const q = buildEventsQueryString(status, category);
  return q ? `/events${q}` : "/events";
}

function buildEventsQueryString(status: EventStatus, category: EventCategory | "all"): string {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (category !== "all") params.set("category", category);
  const q = params.toString();
  return q ? `?${q}` : "";
}

export function eventStatusBadgeClass(status: Exclude<EventStatus, "all">): string {
  if (status === "ongoing") return "bg-emerald-100 text-emerald-700";
  if (status === "upcoming") return "bg-blue-100 text-blue-700";
  return "bg-slate-100 text-slate-600";
}
