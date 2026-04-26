import type { Metadata } from "next";
import Link from "next/link";
import { SectionHead } from "@/components/layout/section-head";
import { formatEpochMsZhCN } from "@/lib/datetime-format";
import {
  eventCategoryLabel,
  eventStatusLabel,
  eventsSeed,
  filterEvents,
  formatEventTimeRange,
  getEventStatus,
  getLatestEvent,
  isValidCategory,
  isValidStatus,
  parseQueryValue,
  type EventCategory,
  type EventStatus,
} from "@/lib/events-data";
import { sidebarFilterLinkClass } from "@/lib/sidebar-nav";

export const metadata: Metadata = {
  title: "活动",
  description: "伊犁本地活动列表，含时间、地点与活动类型筛选。",
  alternates: { canonical: "/events" },
};

function buildFilterHref(status: EventStatus, category: EventCategory | "all"): string {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (category !== "all") params.set("category", category);
  const query = params.toString();
  return query ? `/events?${query}` : "/events";
}

function getStatusBadgeClass(status: Exclude<EventStatus, "all">): string {
  if (status === "ongoing") return "bg-emerald-100 text-emerald-700";
  if (status === "upcoming") return "bg-blue-100 text-blue-700";
  return "bg-slate-100 text-slate-600";
}

function renderCheckmark(active: boolean) {
  return active ? <span className="text-xs">✓</span> : null;
}

type PageProps = {
  searchParams?: Promise<{ status?: string | string[]; category?: string | string[] }>;
};

export default async function HuodongPage({ searchParams }: PageProps) {
  const nowMs = new Date().getTime();
  const query = (await searchParams) ?? {};
  const selectedStatusRaw = parseQueryValue(query.status);
  const selectedCategoryRaw = parseQueryValue(query.category);
  const selectedStatus: EventStatus = isValidStatus(selectedStatusRaw) ? selectedStatusRaw : "all";
  const selectedCategory: EventCategory | "all" = isValidCategory(selectedCategoryRaw) ? selectedCategoryRaw : "all";
  const filtered = filterEvents(eventsSeed, selectedStatus, selectedCategory, nowMs);
  const statusOptions = Object.keys(eventStatusLabel) as EventStatus[];
  const categoryOptions = ["all", ...(Object.keys(eventCategoryLabel) as EventCategory[])] as const;
  const hasFilters = selectedStatus !== "all" || selectedCategory !== "all";
  const latestEvent = getLatestEvent(eventsSeed);

  return (
    <div className="space-y-0">
      {latestEvent ? (
        <section className="border-b border-border bg-background">
          <div
            className="relative h-[230px] bg-cover bg-center md:h-[300px]"
            style={{ backgroundImage: `url(${latestEvent.coverUrl})` }}
          >
            <div className="absolute inset-0 bg-black/35" />
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 via-black/30 to-transparent p-4 md:p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/85">最新活动</p>
              <h2 className="mt-2 line-clamp-1 text-xl font-semibold text-white md:text-2xl">{latestEvent.title}</h2>
              <p className="mt-1 line-clamp-1 text-sm text-white/90">{latestEvent.location}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/90">
                <span>{formatEventTimeRange(latestEvent.startsAt, latestEvent.endsAt)}</span>
                <span>主办方：{latestEvent.organizer}</span>
              </div>
              <div className="mt-4">
                <Link
                  href={`/events/${latestEvent.id}`}
                  className="inline-flex rounded bg-white px-4 py-2 text-sm font-medium text-slate-900 transition-opacity hover:opacity-90"
                >
                  查看赛事详情
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid lg:grid-cols-[220px_1fr]">
        <aside className="border-b border-border bg-background lg:min-h-[calc(100vh-220px)] lg:border-b-0 lg:border-r">
          <div className="bg-background p-4 md:p-5">
            <SectionHead title="状态筛选" />
            <nav className="mt-4 space-y-1" aria-label="按活动状态筛选">
              {statusOptions.map((status) => {
                const active = selectedStatus === status;
                return (
                  <Link
                    key={status}
                    href={buildFilterHref(status, selectedCategory)}
                    className={sidebarFilterLinkClass(active)}
                  >
                    <span>{eventStatusLabel[status]}</span>
                    {renderCheckmark(active)}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-6 border-t border-border pt-6">
              <SectionHead title="类型筛选" />
              <nav className="mt-4 space-y-1" aria-label="按活动类型筛选">
                {categoryOptions.map((category) => {
                  const active = selectedCategory === category;
                  const label = category === "all" ? "全部类型" : eventCategoryLabel[category];
                  return (
                    <Link
                      key={category}
                      href={buildFilterHref(selectedStatus, category)}
                      className={sidebarFilterLinkClass(active)}
                    >
                      <span>{label}</span>
                      {renderCheckmark(active)}
                    </Link>
                  );
                })}
              </nav>
              <Link
                href="/events"
                className="mt-4 inline-flex text-xs text-muted hover:text-primary"
              >
                重置筛选
              </Link>
            </div>
          </div>
        </aside>

        <div className="space-y-4 bg-background p-4 md:p-5">
          <p className="text-sm text-muted/90">
            共 {filtered.length} 条活动
            {hasFilters ? "（已应用筛选）" : ""}
          </p>
          <p className="text-xs text-muted">更新时间：{formatEpochMsZhCN(nowMs)}</p>

          {filtered.length === 0 ? (
            <section className="border border-dashed border-border py-10 text-center">
              <p className="text-base font-medium text-foreground">暂无符合条件的活动</p>
              <p className="mt-2 text-sm text-muted">请调整左侧筛选条件，或点击重置查看全部活动。</p>
            </section>
          ) : (
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((item) => {
                const status = getEventStatus(nowMs, item.startsAt, item.endsAt);
                return (
                  <Link
                    key={item.id}
                    href={`/events/${item.id}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/40 hover:bg-sidebar-hover"
                  >
                    <div className="relative aspect-4/3 shrink-0 bg-muted">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-[1.02]"
                        style={{ backgroundImage: `url(${item.coverUrl})` }}
                        aria-hidden
                      />
                      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-transparent" />
                      <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
                        <span className="rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-primary shadow-sm backdrop-blur-sm">
                          {eventCategoryLabel[item.category]}
                        </span>
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium shadow-sm backdrop-blur-sm ${getStatusBadgeClass(status)}`}
                        >
                          {eventStatusLabel[status]}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-1.5 p-3 md:p-4">
                      <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary md:text-base">
                        {item.title}
                      </h2>
                      <p className="text-xs text-muted">{formatEventTimeRange(item.startsAt, item.endsAt)}</p>
                      <p className="line-clamp-1 text-xs text-muted">{item.location}</p>
                      <p className="line-clamp-2 text-xs leading-relaxed text-muted">{item.summary}</p>
                    </div>
                  </Link>
                );
              })}
            </section>
          )}
        </div>
      </section>
    </div>
  );
}
