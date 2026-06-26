export type EventCategory = "market" | "exhibition" | "show" | "family" | "sports";
export type EventStatus = "all" | "ongoing" | "upcoming" | "ended";

export type EventItem = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  location: string;
  category: EventCategory;
  summary: string;
  coverUrl: string;
  organizer: string;
  registerUrl?: string;
  highlights: string[];
};

export const eventCategoryLabel: Record<EventCategory, string> = {
  market: "市集",
  exhibition: "展览",
  show: "演出",
  family: "亲子",
  sports: "运动",
};

export const eventStatusLabel: Record<EventStatus, string> = {
  all: "全部",
  ongoing: "进行中",
  upcoming: "即将开始",
  ended: "已结束",
};

export function getEventStatus(
  nowMs: number,
  startsAt: string,
  endsAt: string
): Exclude<EventStatus, "all"> {
  const startMs = new Date(startsAt).getTime();
  const endMs = new Date(endsAt).getTime();
  if (nowMs < startMs) return "upcoming";
  if (nowMs > endMs) return "ended";
  return "ongoing";
}

export function formatEventTimeRange(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const dateFmt = new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit" });
  const timeFmt = new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${dateFmt.format(start)} ${timeFmt.format(start)} - ${dateFmt.format(end)} ${timeFmt.format(end)}`;
}

export function isValidStatus(value?: string): value is EventStatus {
  return !!value && value in eventStatusLabel;
}

export function isValidCategory(value?: string): value is EventCategory {
  return !!value && value in eventCategoryLabel;
}

export function getLatestEvent(events: EventItem[]): EventItem | null {
  if (events.length === 0) return null;
  return [...events].sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime())[0] ?? null;
}
