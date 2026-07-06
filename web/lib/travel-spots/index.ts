export type { LatLng, TravelCheckpoint, TravelSpotMapConfig, TravelSpotPage } from "@/lib/travel-spots/types";
export { sortCheckpointsByOrder, buildCheckpointTooltipHtml } from "@/lib/travel-spots/checkpoint-utils";
export {
  buildTravelSpotHref,
  getTravelSpot,
  listTravelSpotSlugs,
} from "@/lib/travel-spots/registry";
