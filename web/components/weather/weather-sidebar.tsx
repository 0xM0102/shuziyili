import Link from "next/link";
import { WeatherSectionTitle } from "@/components/weather/weather-section-title";
import {
  standaloneSideDashedCardClassName,
  standaloneSideCardClassName,
} from "@/lib/page-layout";
import { weatherSideLinkClassName } from "@/lib/weather/ui";

type WeatherAttributionProps = {
  text: string;
};

/** 数据来源说明（与 /weather/meta 一致，全页仅展示一处）。 */
export function WeatherAttribution({ text }: WeatherAttributionProps) {
  return (
    <section className={standaloneSideCardClassName}>
      <WeatherSectionTitle>数据来源</WeatherSectionTitle>
      <p className="mt-4 text-sm leading-relaxed text-muted">{text}</p>
    </section>
  );
}

export function WeatherMoreLinks() {
  return (
    <section className={standaloneSideDashedCardClassName}>
      <h2 className="text-lg font-semibold text-foreground">更多入口</h2>
      <div className="mt-4 flex flex-col gap-2">
        <Link href="/travel" className={weatherSideLinkClassName}>
          旅游频道
        </Link>
        <a
          href="https://tianqi.qq.com/"
          target="_blank"
          rel="noreferrer"
          className={weatherSideLinkClassName}
        >
          腾讯天气
        </a>
      </div>
    </section>
  );
}
