import Link from "next/link";
import type { Metadata } from "next";
import { buildTravelSpotHref, listTravelSpots } from "@/lib/travel-spots";
import {
  travelChannelPageClassName,
  travelChannelProseClassName,
} from "@/lib/travel-layout";

export const metadata: Metadata = {
  title: "景点",
  description: "伊犁草原、湖泊、街区与摄影打卡点，含赛里木湖环湖地图与出行参考。",
  alternates: { canonical: "/travel/attractions" },
};

export default function TravelAttractionsPage() {
  const spots = listTravelSpots();

  return (
    <div className={travelChannelPageClassName}>
      <header className={`${travelChannelProseClassName} space-y-3`}>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">景点</h1>
        <p className="text-sm leading-relaxed text-muted">
          草原、湖泊、街区和摄影点集中在这里。先从当季重点景区入手，再按攻略安排路线与停留时间。
        </p>
      </header>

      <section className="mt-8 space-y-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
          <h2 className="text-base font-semibold text-foreground">精选景区</h2>
        </div>

        {spots.length === 0 ? (
          <p className="text-sm text-muted">精选景区整理中，请稍后再看。</p>
        ) : (
          <ul className="space-y-4">
            {spots.map((spot) => (
              <li key={spot.slug}>
                <Link
                  href={buildTravelSpotHref(spot.slug)}
                  className="block rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40 hover:bg-sidebar-hover"
                >
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                    {spot.subtitle}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">{spot.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
                    {spot.summary}
                  </p>
                  <span className="mt-3 inline-flex text-sm font-medium text-primary">
                    查看地图与打卡点 →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8 rounded-2xl border border-dashed border-border bg-sidebar/40 p-5">
        <h2 className="text-sm font-semibold text-foreground">更多景点</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          杏花沟、那拉提、喀拉峻等条目将陆续上线。可先浏览
          <Link href="/travel/guide" className="mx-1 text-primary hover:underline">
            攻略
          </Link>
          或
          <Link href="/travel" className="mx-1 text-primary hover:underline">
            旅游总览
          </Link>
          了解当季推荐。
        </p>
      </section>
    </div>
  );
}
