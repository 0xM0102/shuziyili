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
  detailReady?: boolean;
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

export const eventsSeed: EventItem[] = [
  {
    id: "yili-marathon-2026",
    title: "2026 伊犁河谷马拉松",
    startsAt: "2026-05-01T07:30:00+08:00",
    endsAt: "2026-05-01T13:30:00+08:00",
    location: "伊宁市滨河大道（市民广场起终点）",
    category: "sports",
    summary: "设全程、半程与欢乐跑三个组别，串联城市与河谷景观，是本季重点赛事活动。",
    coverUrl:
      "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1400&q=80",
    detailReady: true,
    organizer: "伊犁州文旅局 / 伊宁市体育局",
    registerUrl: "https://example.com/yili-marathon-2026",
    highlights: ["全程/半程/欢乐跑分组", "官方补给站与医疗点全程覆盖", "赛事包与完赛纪念奖牌"],
  },
  {
    id: "yili-reading-fair",
    title: "伊宁城市阅读周",
    startsAt: "2026-04-28T10:00:00+08:00",
    endsAt: "2026-05-02T18:00:00+08:00",
    location: "伊宁市图书馆 主会场",
    category: "exhibition",
    summary: "围绕阅读推广与地方文化设置主题展区，含作者分享与亲子阅读活动。",
    coverUrl:
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80",
    detailReady: true,
    organizer: "伊宁市图书馆",
    highlights: ["城市阅读论坛", "亲子共读活动", "地方文化主题展区"],
  },
  {
    id: "liuxing-street-weekend-market",
    title: "六星街周末创意市集",
    startsAt: "2026-05-16T11:00:00+08:00",
    endsAt: "2026-05-17T21:00:00+08:00",
    location: "伊宁市 六星街步行区",
    category: "market",
    summary: "聚焦本地文创、手作与特色轻食，面向游客与本地居民开放。",
    coverUrl:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
    detailReady: true,
    organizer: "六星街街区运营中心",
    highlights: ["文创摊位集合", "街头演出联动", "夜间延时营业"],
  },
];

export function parseQueryValue(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

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

export function filterEvents(
  events: EventItem[],
  status: EventStatus,
  category: EventCategory | "all",
  nowMs: number
): EventItem[] {
  return events.filter((item) => {
    const matchedStatus = status === "all" || getEventStatus(nowMs, item.startsAt, item.endsAt) === status;
    const matchedCategory = category === "all" || item.category === category;
    return matchedStatus && matchedCategory;
  });
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
