import Link from "next/link";
import { TravelSpotCheckpointList } from "@/components/travel/travel-spot-checkpoint-list";
import { TravelSpotMap } from "@/components/travel/travel-spot-map";
import { TravelSpotSectionTitle } from "@/components/travel/travel-spot-section-title";
import {
  standaloneContentCardClassName,
  standaloneWideMainStackClassName,
  standaloneWidePageClassName,
} from "@/lib/page-layout";
import { siteConfig } from "@/lib/site";
import type { TravelSpotPage } from "@/lib/travel-spots/types";

type TravelSpotPageContentProps = {
  spot: TravelSpotPage;
};

/** 景区落地页布局：页头、地图、打卡列表、出行提示。 */
export function TravelSpotPageContent({ spot }: TravelSpotPageContentProps) {
  const { map, tips } = spot;

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
          <TravelSpotSectionTitle title="环湖地图" />
          <p className="mt-3 text-sm leading-relaxed text-muted">
            数字标记为常见打卡停靠顺序（东门起逆时针）。坐标来自 OpenStreetMap，供行前参考，请以现场路标与景区公告为准。
          </p>
          <div className="mt-5">
            <TravelSpotMap mapKey={spot.slug} config={map} />
          </div>
          <p className="mt-3 text-[11px] text-muted">
            地图数据来自{siteConfig.name}整理 · 底图 © OpenStreetMap contributors
          </p>
        </section>

        <section className="space-y-4">
          <TravelSpotSectionTitle title="打卡点" accentClassName="bg-sky-500" />
          <TravelSpotCheckpointList checkpoints={map.checkpoints} />
        </section>

        {tips.length > 0 ? (
          <section className={standaloneContentCardClassName}>
            <TravelSpotSectionTitle title="出行提示" accentClassName="bg-amber-500" />
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
              {tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
