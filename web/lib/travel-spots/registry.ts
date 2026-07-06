import { sayramLakeSpot } from "@/lib/travel-spots/sayram-lake";
import type { TravelSpotPage } from "@/lib/travel-spots/types";

/** 已上线的景区落地页（新增景区时在此注册）。 */
const travelSpots: TravelSpotPage[] = [sayramLakeSpot];

const spotBySlug = new Map(travelSpots.map((spot) => [spot.slug, spot]));

export function buildTravelSpotHref(slug: string): `/travel/${string}` {
  return `/travel/${slug}`;
}

export function listTravelSpotSlugs(): string[] {
  return travelSpots.map((spot) => spot.slug);
}

export function getTravelSpot(slug: string): TravelSpotPage | undefined {
  return spotBySlug.get(slug);
}
