"use client";

import { useState } from "react";
import type { WeatherCityPickerModalProps } from "@/components/weather/weather-city-picker-modal";

type WeatherPickerSource = {
  regions: WeatherCityPickerModalProps["regions"];
  adcode: string;
  loading: boolean;
  locating: boolean;
  selectAdcode: (adcode: string) => void;
  locateCurrentCity: () => void;
};

/** 城市选择弹窗开关与 props，供天气专页与旅游侧栏卡片复用。 */
export function useWeatherCityPicker(source: WeatherPickerSource) {
  const [open, setOpen] = useState(false);

  const modalProps: WeatherCityPickerModalProps = {
    open,
    regions: source.regions,
    adcode: source.adcode,
    loading: source.loading,
    locating: source.locating,
    onClose: () => setOpen(false),
    onSelect: source.selectAdcode,
    onLocate: source.locateCurrentCity,
  };

  return {
    openPicker: () => setOpen(true),
    modalProps,
  };
}
