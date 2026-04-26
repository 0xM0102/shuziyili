import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  eventCategoryLabel,
  eventStatusLabel,
  eventsSeed,
  formatEventTimeRange,
  getEventStatus,
} from "@/lib/events-data";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = eventsSeed.find((item) => item.id === id);
  if (!event) {
    return {
      title: "活动详情",
      robots: { index: false, follow: false },
      alternates: { canonical: `/events/${id}` },
    };
  }
  return {
    title: `${event.title} · 活动`,
    description: event.summary,
    alternates: { canonical: `/events/${id}` },
    openGraph: {
      title: event.title,
      description: event.summary,
      images: [{ url: event.coverUrl }],
      url: `/events/${id}`,
    },
  };
}

export default async function HuodongDetailPage({ params }: Props) {
  const { id } = await params;
  const event = eventsSeed.find((item) => item.id === id);
  if (!event) notFound();
  const nowMs = new Date().getTime();
  const status = getEventStatus(nowMs, event.startsAt, event.endsAt);

  return (
    <div className="space-y-0 bg-background">
      <section
        className="relative h-[260px] bg-cover bg-center md:h-[340px]"
        style={{ backgroundImage: `url(${event.coverUrl})` }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute left-4 top-4 z-10 md:left-6 md:top-6">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 bg-black/35 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-black/50"
          >
            <span aria-hidden>←</span>
            返回活动列表
          </Link>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 via-black/35 to-transparent p-4 md:p-6">
          <nav className="text-xs text-white/85" aria-label="面包屑">
            <Link href="/events" className="hover:text-white">
              活动
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">详情</span>
          </nav>
          <h1 className="mt-3 text-2xl font-bold text-white md:text-3xl">{event.title}</h1>
          <p className="mt-2 text-sm text-white/90">{event.summary}</p>
        </div>
      </section>

      <section className="grid border-t border-border lg:grid-cols-[1fr_320px]">
        <article className="space-y-5 px-4 py-5 md:px-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
              {eventCategoryLabel[event.category]}
            </span>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
              {eventStatusLabel[status]}
            </span>
          </div>

          <div className="space-y-2 text-sm text-foreground/90">
            <p>
              <span className="text-muted">活动时间：</span>
              {formatEventTimeRange(event.startsAt, event.endsAt)}
            </p>
            <p>
              <span className="text-muted">活动地点：</span>
              {event.location}
            </p>
            <p>
              <span className="text-muted">主办方：</span>
              {event.organizer}
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">活动亮点</h2>
            <ul className="space-y-1 text-sm text-foreground/90">
              {event.highlights.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>

        <aside className="border-t border-border px-4 py-5 md:px-5 lg:border-l lg:border-t-0">
          <h2 className="text-sm font-semibold text-foreground">参与方式</h2>
          <p className="mt-2 text-sm text-muted">请通过官方渠道报名并关注组委会公告。</p>
          <div className="mt-4 flex flex-col gap-2">
            {event.registerUrl ? (
              <a
                href={event.registerUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex justify-center rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                前往报名
              </a>
            ) : (
              <span className="inline-flex justify-center rounded border border-border px-4 py-2 text-sm text-muted">
                报名通道即将开放
              </span>
            )}
            <Link
              href="/events"
              className="inline-flex justify-center rounded border border-border px-4 py-2 text-sm text-foreground hover:border-primary hover:text-primary"
            >
              返回活动列表
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}
