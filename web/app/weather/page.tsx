import type { Metadata } from "next";
import { WeatherPageContent } from "@/components/weather/weather-page-content";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "天气",
  description: `${siteConfig.name} · 伊犁及周边实时天气、逐小时与七日预报，支持全国城市搜索与定位。`,
  alternates: { canonical: "/weather" },
  openGraph: {
    title: `天气 · ${siteConfig.name}`,
    description: "伊犁及周边实时天气与出行参考。",
    url: "/weather",
  },
};

export default function WeatherPage() {
  return <WeatherPageContent />;
}
