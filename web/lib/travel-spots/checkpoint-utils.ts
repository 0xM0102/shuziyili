import { escapeHtml } from "@/lib/escape-html";
import type { TravelCheckpoint } from "@/lib/travel-spots/types";

/** 按环湖顺序排列打卡点（不修改原数组）。 */
export function sortCheckpointsByOrder(checkpoints: TravelCheckpoint[]): TravelCheckpoint[] {
  return [...checkpoints].sort((a, b) => a.order - b.order);
}

/** Leaflet Tooltip 内容（已转义，防 XSS）。 */
export function buildCheckpointTooltipHtml(checkpoint: TravelCheckpoint): string {
  const name = escapeHtml(checkpoint.name);
  const hint = checkpoint.hint ? `<p>${escapeHtml(checkpoint.hint)}</p>` : "";
  return `<div class="travel-spot-tooltip"><strong>${name}</strong>${hint}</div>`;
}
