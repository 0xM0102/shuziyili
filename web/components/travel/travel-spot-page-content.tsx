import Link from "next/link";
import { TravelSpotCheckpointList } from "@/components/travel/travel-spot-checkpoint-list";
import { TravelSpotMapLazy } from "@/components/travel/travel-spot-map-lazy";
import { TravelSpotSectionTitle } from "@/components/travel/travel-spot-section-title";
import {
  travelChannelPageClassName,
  travelChannelProseClassName,
} from "@/lib/travel-layout";
import { standaloneContentCardClassName } from "@/lib/page-layout";
import { siteConfig } from "@/lib/site";
import type { TravelSpotPage } from "@/lib/travel-spots/types";

type TravelSpotPageContentProps = {
  spot: TravelSpotPage;
};

/** 景区落地页：占满旅游频道主栏；引言限宽，地图与列表全宽。 */
export function TravelSpotPageContent({ spot }: TravelSpotPageContentProps) {
  const { map, tips } = spot;

  return (
    <div className={travelChannelPageClassName}>
      <header className={`${travelChannelProseClassName} space-y-4 border-b border-border pb-8`}>
        <Link href="/travel/attractions" className="text-sm text-muted hover:text-primary">
          ← 返回景点
        </Link>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          {spot.subtitle}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          {spot.title}
        </h1>
        <p className="text-[15px] leading-relaxed text-muted">{spot.summary}</p>
      </header>

      <section className={`mt-8 ${standaloneContentCardClassName}`}>
        <TravelSpotSectionTitle title="环湖地图" />
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
          数字标记为常见打卡停靠顺序（东门起逆时针）。坐标来自 OpenStreetMap，供行前参考，请以现场路标与景区公告为准。
        </p>
        <div className="mt-5">
          <TravelSpotMapLazy mapKey={spot.slug} config={map} />
        </div>
        <p className="mt-3 text-[11px] text-muted">
          地图数据来自{siteConfig.name}整理 · 底图 © OpenStreetMap contributors
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <TravelSpotSectionTitle title="打卡点" accentClassName="bg-sky-500" />
        <TravelSpotCheckpointList checkpoints={map.checkpoints} />
      </section>

      {tips.length > 0 ? (
        <section className={`mt-8 ${standaloneContentCardClassName}`}>
          <TravelSpotSectionTitle title="出行提示" accentClassName="bg-amber-500" />
          <ul className="mt-4 max-w-3xl list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
            {tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
