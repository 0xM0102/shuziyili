"use client";

import { WeatherPanel } from "@/components/weather/weather-panel";
import { WeatherPanelEmpty } from "@/components/weather/weather-panel-empty";
import { lifeIndexEmoji, sortLifeIndices } from "@/lib/weather-api";
import type { WeatherLifeIndex } from "@/lib/weather/types";

type WeatherLifeIndexPanelProps = {
  indices: WeatherLifeIndex[];
};

const FEATURED_LIFE_INDEX_KEYS = new Set([
  "clothes",
  "umbrella",
  "sports",
  "sunscreen",
  "heatstroke",
  "comfort",
  "traffic",
  "tourism",
]);

const FEATURED_LIFE_INDEX_COUNT = 8;

function splitLifeIndices(indices: WeatherLifeIndex[]) {
  const featured = indices.filter((item) => FEATURED_LIFE_INDEX_KEYS.has(item.key));
  const remaining = indices.filter((item) => !FEATURED_LIFE_INDEX_KEYS.has(item.key));

  for (const item of remaining) {
    if (featured.length >= FEATURED_LIFE_INDEX_COUNT) break;
    featured.push(item);
  }

  const featuredKeys = new Set(featured.map((item) => item.key));
  return {
    featured,
    secondary: indices.filter((item) => !featuredKeys.has(item.key)),
  };
}

function LifeIndexCard({
  compact = false,
  item,
}: {
  compact?: boolean;
  item: WeatherLifeIndex;
}) {
  return (
    <li
      className="flex min-w-0 items-start gap-3 rounded-xl border border-border/80 bg-background px-3 py-3 transition hover:border-primary/30"
      title={item.detail}
    >
      <span
        className={`${compact ? "h-9 w-9" : "h-10 w-10"} flex shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg`}
        aria-hidden
      >
        {lifeIndexEmoji(item.key)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted">{item.name}</p>
        <p className="mt-0.5 text-sm font-semibold leading-snug text-foreground">
          {item.info}
        </p>
        {item.detail ? (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
            {item.detail}
          </p>
        ) : null}
      </div>
    </li>
  );
}

export function WeatherLifeIndexPanel({ indices }: WeatherLifeIndexPanelProps) {
  const sorted = sortLifeIndices(indices);
  const isEmpty = sorted.length === 0;
  const { featured, secondary } = splitLifeIndices(sorted);

  return (
    <WeatherPanel
      title="生活指数"
      titleId="life-index"
      subtitle={isEmpty ? undefined : "穿衣、出行、运动等参考"}
    >
      {isEmpty ? (
        <WeatherPanelEmpty size="compact" className="mt-3" />
      ) : (
        <>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {featured.map((item) => (
              <LifeIndexCard key={item.key} item={item} />
            ))}
          </ul>
          {secondary.length > 0 ? (
            <details className="mt-4 rounded-xl border border-dashed border-border bg-sidebar/40 px-3 py-3">
              <summary className="cursor-pointer text-sm font-medium text-foreground">
                更多生活指数（{secondary.length} 项）
              </summary>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {secondary.map((item) => (
                  <LifeIndexCard key={item.key} item={item} compact />
                ))}
              </ul>
            </details>
          ) : null}
        </>
      )}
    </WeatherPanel>
  );
}
