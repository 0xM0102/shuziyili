import { escapeHtml } from "@/lib/escape-html";
import type { TravelCheckpoint, TravelSpotMapConfig } from "@/lib/travel-spots/types";

export function buildTravelSpotMapConfigKey(config: TravelSpotMapConfig): string {
  const checkpointSig = config.checkpoints
    .map((c) => `${c.id}:${c.order}:${c.position.join(",")}`)
    .join("|");
  return `${config.center.join(",")}@${config.zoom}|${checkpointSig}`;
}

export function sortCheckpointsByOrder(checkpoints: TravelCheckpoint[]): TravelCheckpoint[] {
  return [...checkpoints].sort((a, b) => a.order - b.order);
}

/** Leaflet Tooltip 内容（已转义，防 XSS）。 */
export function buildCheckpointTooltipHtml(checkpoint: TravelCheckpoint): string {
  const name = escapeHtml(checkpoint.name);
  const hint = checkpoint.hint ? `<p>${escapeHtml(checkpoint.hint)}</p>` : "";
  return `<div class="travel-spot-tooltip"><strong>${name}</strong>${hint}</div>`;
}
