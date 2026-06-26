import type { Metadata } from "next";
import { EventCardList } from "@/components/events/event-card-list";
import { EventFilterSidebar } from "@/components/events/event-filter-sidebar";
import { EventHeroBanner } from "@/components/events/event-hero-banner";
import { formatEpochMsZhCN } from "@/lib/datetime-format";
import { getLatestEvent } from "@/lib/events-data";
import { fetchPortalEventsForListPage } from "@/lib/events-api";
import { hasActiveEventFilters, parseEventListFilters } from "@/lib/events-filters";

export const metadata: Metadata = {
  title: "活动",
  description: "伊犁本地活动列表，含时间、地点与活动类型筛选。",
  alternates: { canonical: "/events" },
};

type PageProps = {
  searchParams?: Promise<{ status?: string | string[]; category?: string | string[] }>;
};

function getRenderTimestampMs() {
  return Date.now();
}

export default async function HuodongPage({ searchParams }: PageProps) {
  const nowMs = getRenderTimestampMs();
  const filters = parseEventListFilters((await searchParams) ?? {});
  const { all: allEvents, filtered } = await fetchPortalEventsForListPage(
    filters.status,
    filters.category
  );
  const latestEvent = getLatestEvent(allEvents);
  const hasFilters = hasActiveEventFilters(filters);

  return (
    <div className="space-y-0">
      {latestEvent ? <EventHeroBanner event={latestEvent} /> : null}

      <section className="grid lg:grid-cols-[220px_1fr]">
        <EventFilterSidebar
          selectedStatus={filters.status}
          selectedCategory={filters.category}
        />

        <div className="space-y-4 bg-background p-4 md:p-5">
          <p className="text-sm text-muted/90">
            共 {filtered.length} 条活动
            {hasFilters ? "（已应用筛选）" : ""}
          </p>
          <p className="text-xs text-muted">更新时间：{formatEpochMsZhCN(nowMs)}</p>
          <EventCardList items={filtered} nowMs={nowMs} />
        </div>
      </section>
    </div>
  );
}
