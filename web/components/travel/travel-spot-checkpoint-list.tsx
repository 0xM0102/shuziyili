import { sortCheckpointsByOrder } from "@/lib/travel-spots/checkpoint-utils";
import type { TravelCheckpoint } from "@/lib/travel-spots/types";

type Props = {
  checkpoints: TravelCheckpoint[];
};

/** 环湖打卡点列表（与地图点位一一对应）。 */
export function TravelSpotCheckpointList({ checkpoints }: Props) {
  const sorted = sortCheckpointsByOrder(checkpoints);

  return (
    <ol className="space-y-3">
      {sorted.map((point) => (
        <li
          key={point.id}
          className="flex gap-3 rounded-xl border border-border bg-card p-4 md:p-5"
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary"
            aria-hidden
          >
            {point.order}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-semibold text-foreground">{point.name}</h3>
            {point.hint ? (
              <p className="mt-1 break-words text-sm leading-relaxed text-muted">{point.hint}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
