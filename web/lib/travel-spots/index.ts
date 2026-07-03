import { sayramLakeSpot } from "@/lib/travel-spots/sayram-lake";
import type { TravelSpotPage } from "@/lib/travel-spots/types";

export type { LatLng, TravelCheckpoint, TravelSpotMapConfig, TravelSpotPage } from "@/lib/travel-spots/types";
export { sortCheckpointsByOrder } from "@/lib/travel-spots/checkpoint-utils";

const spots: TravelSpotPage[] = [sayramLakeSpot];

export function getTravelSpot(slug: string): TravelSpotPage | undefined {
  return spots.find((spot) => spot.slug === slug);
}
