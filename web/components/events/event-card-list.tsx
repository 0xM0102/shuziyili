import Link from "next/link";
import { ContentEmptyState } from "@/components/feedback";
import {
  eventCategoryLabel,
  eventStatusLabel,
  formatEventTimeRange,
  getEventStatus,
  type EventItem,
} from "@/lib/events-data";
import { eventStatusBadgeClass } from "@/lib/events-filters";

type Props = {
  items: EventItem[];
  nowMs: number;
};

export function EventCardList({ items, nowMs }: Props) {
  if (items.length === 0) {
    return <ContentEmptyState />;
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
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
                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium shadow-sm backdrop-blur-sm ${eventStatusBadgeClass(status)}`}
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
  );
}
