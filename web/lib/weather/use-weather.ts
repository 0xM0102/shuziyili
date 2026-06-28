"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchWeatherByAdcode,
  fetchWeatherByLocation,
  fetchWeatherNearby,
  fetchWeatherMeta,
  fetchWeatherRegions,
} from "@/lib/weather/api";
import { DEFAULT_WEATHER_ADCODE } from "@/lib/weather/constants";
import {
  isGeolocationSupported,
  requestCurrentPosition,
} from "@/lib/weather/geolocation";
import {
  resolveInitialWeatherAdcode,
  storeWeatherAdcode,
} from "@/lib/weather/storage";
import { isWeatherPayloadEmpty } from "@/lib/weather/snapshot";
import type { WeatherPayload, WeatherRegion } from "@/lib/weather/types";

type RunLoadOptions = {
  locating?: boolean;
  persist?: boolean;
  errorMessage?: string;
};

/**
 * 天气数据加载与选城/定位。
 * 初始 adcode 固定为默认值，避免 SSR 与 localStorage 不一致导致 hydration 报错。
 */
export function useWeather() {
  const [regions, setRegions] = useState<WeatherRegion[]>([]);
  const [adcode, setAdcode] = useState(DEFAULT_WEATHER_ADCODE);
  const [weather, setWeather] = useState<WeatherPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attribution, setAttribution] = useState("");

  const applyPayload = useCallback((data: WeatherPayload | null): boolean => {
    if (!data || !data.upstreamConfigured) {
      setError("天气服务未配置或暂时不可用");
      setWeather(null);
      return false;
    }
    if (isWeatherPayloadEmpty(data)) {
      setError("暂无天气数据");
      setWeather(data);
      setAdcode(data.adcode);
      return true;
    }
    setWeather(data);
    setAdcode(data.adcode);
    setError(null);
    return true;
  }, []);

  const runLoad = useCallback(
    async (
      fetcher: () => Promise<WeatherPayload | null>,
      options?: RunLoadOptions
    ): Promise<boolean> => {
      if (options?.locating) setLocating(true);
      setLoading(true);
      setError(null);
      try {
        const data = await fetcher();
        const ok = applyPayload(data);
        if (ok && options?.persist && data) {
          storeWeatherAdcode(data.adcode);
        }
        return ok;
      } catch {
        setError(options?.errorMessage ?? "加载失败，请稍后重试");
        return false;
      } finally {
        setLoading(false);
        setLocating(false);
      }
    },
    [applyPayload]
  );

  const loadByAdcode = useCallback(
    (code: string) => runLoad(() => fetchWeatherByAdcode(code)),
    [runLoad]
  );

  useEffect(() => {
    const initial = resolveInitialWeatherAdcode();
    setAdcode(initial);
    fetchWeatherRegions().then(setRegions).catch(() => setRegions([]));
    fetchWeatherMeta()
      .then((meta) => {
        if (meta.attribution) setAttribution(meta.attribution);
      })
      .catch(() => setAttribution(""));
    loadByAdcode(initial);
  }, [loadByAdcode]);

  const selectAdcode = useCallback(
    (nextAdcode: string) => {
      setAdcode(nextAdcode);
      storeWeatherAdcode(nextAdcode);
      loadByAdcode(nextAdcode);
    },
    [loadByAdcode]
  );

  const locateByIp = useCallback(
    () =>
      runLoad(() => fetchWeatherByLocation(), {
        locating: true,
        persist: true,
        errorMessage: "定位失败，请稍后重试",
      }),
    [runLoad]
  );

  const locateCurrentCity = useCallback(async () => {
    if (!isGeolocationSupported()) {
      setError("无法获取位置，已改为按网络 IP 定位");
      await locateByIp();
      return;
    }

    try {
      const position = await requestCurrentPosition();
      await runLoad(
        () => fetchWeatherNearby(position.coords.latitude, position.coords.longitude),
        {
          locating: true,
          persist: true,
          errorMessage: "定位失败，请稍后重试",
        }
      );
    } catch {
      setError("无法获取位置，已改为按网络 IP 定位");
      await locateByIp();
    }
  }, [locateByIp, runLoad]);

  return {
    regions,
    adcode,
    weather,
    attribution,
    loading,
    locating,
    error,
    selectAdcode,
    locateCurrentCity,
  };
}
