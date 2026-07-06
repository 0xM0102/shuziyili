"use client";

import { useEffect, useRef, useState } from "react";
import { joinClassNames } from "@/lib/class-names";
import { mountTravelSpotMap } from "@/lib/travel-spots/leaflet-map";
import type { TravelSpotMapConfig } from "@/lib/travel-spots/types";
import "./travel-spot-map.css";

type TravelSpotMapProps = {
  config: TravelSpotMapConfig;
  /** 地图实例缓存键，通常为景区 slug。 */
  mapKey: string;
  className?: string;
};

type MapStatus = "loading" | "ready" | "error";

const DEFAULT_FRAME_CLASS =
  "h-[min(70vh,520px)] min-h-[320px] w-full overflow-hidden rounded-2xl border border-border bg-muted";

const LOAD_ERROR_MESSAGE = "地图加载失败，请检查网络后刷新页面。";

/** 景区地图：Leaflet + OpenStreetMap，悬停显示打卡点说明。 */
export function TravelSpotMap({ config, mapKey, className }: TravelSpotMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<{ remove: () => void } | null>(null);
  const [status, setStatus] = useState<MapStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const frameClass = className ?? DEFAULT_FRAME_CLASS;

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const container = containerRef.current;
      if (!container) return;

      try {
        const L = (await import("leaflet")).default;
        if (cancelled) return;

        mapRef.current?.remove();
        mapRef.current = mountTravelSpotMap(L, container, config);
        setStatus("ready");
      } catch {
        if (!cancelled) {
          setStatus("error");
          setErrorMessage(LOAD_ERROR_MESSAGE);
        }
      }
    }

    setStatus("loading");
    setErrorMessage("");
    void init();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [config, mapKey]);

  return (
    <div className="travel-spot-map relative">
      <div ref={containerRef} className={frameClass} role="region" aria-label="景区地图" />
      {status === "loading" ? (
        <div
          className={joinClassNames(
            frameClass,
            "absolute inset-0 z-10 flex items-center justify-center bg-muted/90 text-sm text-muted",
          )}
          aria-live="polite"
        >
          地图加载中…
        </div>
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
