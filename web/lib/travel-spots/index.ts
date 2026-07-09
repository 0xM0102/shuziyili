export type { LatLng, TravelCheckpoint, TravelSpotMapConfig, TravelSpotPage } from "@/lib/travel-spots/types";
export {
  sortCheckpointsByOrder,
  buildCheckpointTooltipHtml,
  buildTravelSpotMapConfigKey,
} from "@/lib/travel-spots/checkpoint-utils";
export {
  buildTravelSpotHref,
  getTravelSpot,
  listTravelSpotSlugs,
  listTravelSpots,
} from "@/lib/travel-spots/registry";
