"use client";

import type { Map as LeafletMap } from "leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import { joinClassNames } from "@/lib/class-names";
import {
  TravelSpotMapFrame,
  TRAVEL_SPOT_MAP_FRAME_CLASS,
} from "@/components/travel/travel-spot-map-frame";
import { buildTravelSpotMapConfigKey } from "@/lib/travel-spots/checkpoint-utils";
import { mountTravelSpotMap } from "@/lib/travel-spots/leaflet-map";
import type { TravelSpotMapConfig } from "@/lib/travel-spots/types";
import "./travel-spot-map.css";

type TravelSpotMapProps = {
  config: TravelSpotMapConfig;
  /** 景区 slug，与 configKey 共同决定何时重挂地图。 */
  mapKey: string;
  className?: string;
};

type MapStatus = "loading" | "ready" | "error";

const LOAD_ERROR_MESSAGE = "地图加载失败，请检查网络后刷新页面。";

/** 景区地图：Leaflet + OpenStreetMap，悬停显示打卡点说明。 */
export function TravelSpotMap({ config, mapKey, className }: TravelSpotMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const configKey = useMemo(() => buildTravelSpotMapConfigKey(config), [config]);

  const [status, setStatus] = useState<MapStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const frameClass = className ?? TRAVEL_SPOT_MAP_FRAME_CLASS;

  useEffect(() => {
    let disposed = false;

    async function init() {
      const container = containerRef.current;
      if (!container) return;

      try {
        const L = (await import("leaflet")).default;
        if (disposed) return;

        mapRef.current?.remove();
        mapRef.current = mountTravelSpotMap(L, container, config);
        if (!disposed) setStatus("ready");
      } catch {
        if (!disposed) {
          setStatus("error");
          setErrorMessage(LOAD_ERROR_MESSAGE);
        }
      }
    }

    setStatus("loading");
    setErrorMessage("");
    void init();

    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [mapKey, configKey, config]);

  return (
    <div className="travel-spot-map relative">
      <div ref={containerRef} className={frameClass} role="region" aria-label="景区地图" />
      {status === "loading" ? (
        <TravelSpotMapFrame
          className={joinClassNames(frameClass, "pointer-events-none")}
          overlay
          aria-live="polite"
        >
          地图加载中…
        </TravelSpotMapFrame>
      ) : null}
      {status === "error" ? (
        <div
          className={joinClassNames(
            frameClass,
            "absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-muted/95 p-6 text-center",
          )}
          role="alert"
        >
          <p className="text-sm font-medium text-foreground">地图暂时无法显示</p>
          <p className="max-w-md text-xs leading-relaxed text-muted">{errorMessage}</p>
        </div>
      ) : null}
    </div>
  );
}
