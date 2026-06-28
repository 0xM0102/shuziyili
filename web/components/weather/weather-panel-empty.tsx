import { ContentEmptyState } from "@/components/feedback";

type WeatherPanelEmptyProps = {
  size?: "default" | "compact";
  className?: string;
};

/** 天气卡片内嵌空状态（无虚线外框，与资讯空态同款插画）。 */
export function WeatherPanelEmpty({ size = "default", className = "mt-2" }: WeatherPanelEmptyProps) {
  return <ContentEmptyState size={size} bordered={false} className={className} />;
}
