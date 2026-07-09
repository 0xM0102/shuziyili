import { joinClassNames } from "@/lib/class-names";

/** 景区地图外框尺寸（懒加载占位、加载遮罩、地图容器共用）。 */
export const TRAVEL_SPOT_MAP_FRAME_CLASS =
  "h-[min(70vh,520px)] min-h-[320px] w-full overflow-hidden rounded-2xl border border-border bg-muted";

type TravelSpotMapFrameProps = {
  className?: string;
  children?: React.ReactNode;
  /** 绝对定位遮罩（加载中/错误态）。 */
  overlay?: boolean;
  role?: string;
  "aria-live"?: "polite" | "off" | "assertive";
};

/** 地图区域统一外框，避免懒加载与地图组件样式分叉。 */
export function TravelSpotMapFrame({
  className,
  children,
  overlay = false,
  role,
  "aria-live": ariaLive,
}: TravelSpotMapFrameProps) {
  return (
    <div
      className={joinClassNames(
        className ?? TRAVEL_SPOT_MAP_FRAME_CLASS,
        overlay && "absolute inset-0 z-10 flex items-center justify-center",
        overlay && "bg-muted/90 text-sm text-muted",
      )}
      role={role}
      aria-live={ariaLive}
    >
      {children}
    </div>
  );
}

export function TravelSpotMapLoadingPlaceholder({ className }: { className?: string }) {
  return (
    <TravelSpotMapFrame className={className}>
      <span className="text-sm text-muted">地图加载中…</span>
    </TravelSpotMapFrame>
  );
}
