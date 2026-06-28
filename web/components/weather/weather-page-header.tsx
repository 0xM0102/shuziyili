import type { ReactNode } from "react";
import Link from "next/link";
import { WeatherHeroHeader } from "@/components/weather/weather-hero-header";
import { standaloneHeaderClassName } from "@/lib/page-layout";
import { formatTodayForecastRange } from "@/lib/weather/format";
import type { WeatherPayload } from "@/lib/weather/types";

type WeatherPlaceholderHeaderProps = {
  message: string;
  action?: ReactNode;
};

function WeatherPlaceholderHeader({ message, action }: WeatherPlaceholderHeaderProps) {
  return (
    <header className={`${standaloneHeaderClassName} border-b border-border pb-8 md:pb-10`}>
      <p className="text-sm text-muted">{message}</p>
      {action}
    </header>
  );
}

type WeatherPageHeaderProps = {
  error: string | null;
  weather: WeatherPayload | null;
  onOpenPicker: () => void;
};

/** 天气专页顶部：错误 / 实况 hero / 无数据。 */
export function WeatherPageHeader({
  error,
  weather,
  onOpenPicker,
}: WeatherPageHeaderProps) {
  if (error) {
    return (
      <WeatherPlaceholderHeader
        message={error}
        action={
          <Link
            href="/"
            className="mt-4 inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            返回首页
          </Link>
        }
      />
    );
  }

  if (weather) {
    return (
      <WeatherHeroHeader
        weather={weather}
        todayRange={formatTodayForecastRange(weather.forecast)}
        onOpenPicker={onOpenPicker}
      />
    );
  }

  return <WeatherPlaceholderHeader message="暂无天气数据" />;
}
