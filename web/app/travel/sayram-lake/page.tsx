import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TravelSpotCheckpointList } from "@/components/travel/travel-spot-checkpoint-list";
import { TravelSpotMap } from "@/components/travel/travel-spot-map";
import {
  standaloneContentCardClassName,
  standaloneSectionTitleClassName,
  standaloneWideMainStackClassName,
  standaloneWidePageClassName,
} from "@/lib/page-layout";
import { siteConfig } from "@/lib/site";
import { getTravelSpot } from "@/lib/travel-spots";

const SPOT_SLUG = "sayram-lake";

export function generateMetadata(): Metadata {
  const spot = getTravelSpot(SPOT_SLUG);
  if (!spot) {
    return { title: "景区" };
  }
  return {
    title: spot.title,
    description: spot.summary,
    alternates: { canonical: `/travel/${spot.slug}` },
    openGraph: {
      title: `${spot.title} · 旅游`,
      description: spot.summary,
      url: `/travel/${spot.slug}`,
    },
  };
}

export default function SayramLakePage() {
  const spot = getTravelSpot(SPOT_SLUG);
  if (!spot) notFound();

  return (
    <div className={standaloneWidePageClassName}>
      <header className="max-w-4xl border-b border-border pb-8 md:pb-10">
        <Link href="/travel" className="text-sm text-muted hover:text-primary">
          ← 返回旅游
        </Link>
        <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-primary">
          {spot.subtitle}
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          {spot.title}
        </h1>
        <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-muted">{spot.summary}</p>
      </header>

      <div className={`mt-10 ${standaloneWideMainStackClassName}`}>
        <section className={standaloneContentCardClassName}>
          <h2 className={standaloneSectionTitleClassName}>
            <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
            环湖地图
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            数字标记为常见打卡停靠顺序（东门起逆时针）。坐标来自 OpenStreetMap，供行前参考，请以现场路标与景区公告为准。
          </p>
          <div className="mt-5">
            <TravelSpotMap config={spot.map} />
          </div>
          <p className="mt-3 text-[11px] text-muted">
            地图数据来自{siteConfig.name}整理 · 底图 © OpenStreetMap contributors
          </p>
        </section>

        <section className="space-y-4">
          <h2 className={standaloneSectionTitleClassName}>
            <span className="h-2 w-2 shrink-0 rounded-full bg-sky-500" aria-hidden />
            打卡点
          </h2>
          <TravelSpotCheckpointList checkpoints={spot.map.checkpoints} />
        </section>

        {spot.tips.length > 0 ? (
          <section className={standaloneContentCardClassName}>
            <h2 className={standaloneSectionTitleClassName}>
              <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" aria-hidden />
              出行提示
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
              {spot.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
