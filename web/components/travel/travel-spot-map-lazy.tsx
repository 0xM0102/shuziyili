"use client";

import dynamic from "next/dynamic";
import { TravelSpotMapLoadingPlaceholder } from "@/components/travel/travel-spot-map-frame";
import type { TravelSpotMapConfig } from "@/lib/travel-spots/types";

const TravelSpotMap = dynamic(
  () => import("@/components/travel/travel-spot-map").then((mod) => mod.TravelSpotMap),
  {
    ssr: false,
    loading: () => <TravelSpotMapLoadingPlaceholder />,
  },
);

type TravelSpotMapLazyProps = {
  mapKey: string;
  config: TravelSpotMapConfig;
};

/** Leaflet 仅客户端挂载，避免 SSR 与瓦片请求被取消。 */
export function TravelSpotMapLazy({ mapKey, config }: TravelSpotMapLazyProps) {
  return <TravelSpotMap mapKey={mapKey} config={config} />;
}
