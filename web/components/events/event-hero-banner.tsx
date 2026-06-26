import Link from "next/link";
import { formatEventTimeRange, type EventItem } from "@/lib/events-data";

type Props = {
  event: EventItem;
};

/** 列表页顶部「最新活动」横幅（取已发布列表中 startsAt 最大的一条）。 */
export function EventHeroBanner({ event }: Props) {
  return (
    <section className="border-b border-border bg-background">
      <div
        className="relative h-[230px] bg-cover bg-center md:h-[300px]"
        style={{ backgroundImage: `url(${event.coverUrl})` }}
      >
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 via-black/30 to-transparent p-4 md:p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/85">最新活动</p>
          <h2 className="mt-2 line-clamp-1 text-xl font-semibold text-white md:text-2xl">{event.title}</h2>
          <p className="mt-1 line-clamp-1 text-sm text-white/90">{event.location}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/90">
            <span>{formatEventTimeRange(event.startsAt, event.endsAt)}</span>
            <span>主办方：{event.organizer}</span>
          </div>
          <div className="mt-4">
            <Link
              href={`/events/${event.id}`}
              className="inline-flex rounded bg-white px-4 py-2 text-sm font-medium text-slate-900 transition-opacity hover:opacity-90"
            >
              查看赛事详情
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
