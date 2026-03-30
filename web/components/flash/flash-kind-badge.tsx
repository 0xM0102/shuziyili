import type { FlashLinkKind } from "@/lib/flash-links";

type FlashKindBadgeProps = {
  kind: FlashLinkKind;
  /** compact：列表行；comfortable：详情页 */
  density?: "compact" | "comfortable";
};

export function FlashKindBadge({ kind, density = "compact" }: FlashKindBadgeProps) {
  const internal = kind === "INTERNAL";
  const tone = internal
    ? "rounded bg-primary/10 font-medium text-primary"
    : "rounded bg-muted/80 font-medium text-muted";
  const box = density === "comfortable" ? "px-2 py-0.5 text-xs" : "px-1.5 py-0.5 text-[11px]";
  return <span className={`${tone} ${box}`}>{internal ? "站内" : "外链"}</span>;
}
