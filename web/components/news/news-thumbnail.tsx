"use client";

import { useState } from "react";
import { SiteLogoPlaceholder } from "@/components/brand/site-logo-placeholder";

type NewsThumbnailProps = {
  thumbnailUrl: string | undefined;
  variant: "list" | "hero";
  className?: string;
};

const coverBaseClass = "absolute inset-0 h-full w-full object-cover";
const coverByVariant = {
  hero: coverBaseClass,
  list: `${coverBaseClass} transition-transform duration-300 group-hover:scale-[1.02]`,
} as const;

/**
 * 外链缩略图：先尝试加载；加载中仅衬底，失败后再回退品牌占位。
 */
export function NewsThumbnail({ thumbnailUrl, variant, className }: NewsThumbnailProps) {
  const url = thumbnailUrl?.trim() || "";
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (!url || failedUrl === url) {
    return <SiteLogoPlaceholder variant={variant} />;
  }

  const isLoaded = loadedUrl === url;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {!isLoaded ? <div className="absolute inset-0 bg-muted" aria-hidden /> : null}
      {/* eslint-disable-next-line @next/next/no-img-element -- 外链缩略图，失败时 onError 回退占位 */}
      <img
        src={url}
        alt=""
        className={`${className ?? coverByVariant[variant]} transition-opacity duration-200 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        referrerPolicy="no-referrer"
        decoding="async"
        onLoad={() => setLoadedUrl(url)}
        onError={() => setFailedUrl(url)}
      />
    </div>
  );
}
