"use client";

import { useCallback, useEffect } from "react";
import { WeatherCitySearchRow } from "@/components/weather/weather-city-search-row";
import { YiliWeatherShortcuts } from "@/components/weather/yili-weather-shortcuts";
import type { WeatherRegion } from "@/lib/weather/types";

export type WeatherCityPickerModalProps = {
  open: boolean;
  regions: WeatherRegion[];
  adcode: string;
  loading: boolean;
  locating: boolean;
  onClose: () => void;
  onSelect: (adcode: string) => void;
  onLocate: () => void;
};

export function WeatherCityPickerModal({
  open,
  regions,
  adcode,
  loading,
  locating,
  onClose,
  onSelect,
  onLocate,
}: WeatherCityPickerModalProps) {
  const handleSelect = useCallback(
    (code: string) => {
      onSelect(code);
      onClose();
    },
    [onClose, onSelect]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center px-4 py-10">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden />
      <div
        className="relative w-full max-w-md rounded-xl border border-border bg-background shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-label="选择城市"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-[15px] font-semibold text-foreground">选择城市</p>
          <button
            type="button"
            className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] font-semibold text-foreground/80 hover:border-primary/30 hover:text-primary"
            onClick={onClose}
          >
            关闭
          </button>
        </div>

        <div className="space-y-4 px-4 py-4">
          <WeatherCitySearchRow
            regions={regions}
            adcode={adcode}
            loading={loading}
            locating={locating}
            onSelect={handleSelect}
            onLocate={onLocate}
          />
          <YiliWeatherShortcuts regions={regions} adcode={adcode} onSelect={handleSelect} />
        </div>
      </div>
    </div>
  );
}
