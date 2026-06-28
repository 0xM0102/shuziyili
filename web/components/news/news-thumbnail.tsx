"use client";

import { useState } from "react";
import { SiteLogoPlaceholder } from "@/components/brand/site-logo-placeholder";

type NewsThumbnailProps = {
  thumbnailUrl: string | undefined;
  variant: "list" | "article";
  className?: string;
};

/**
 * 外链缩略图（腾讯等）常因 Referer 防盗链返回 403；
 * 使用 img + no-referrer，失败时回退占位。
 */
export function NewsThumbnail({ thumbnailUrl, variant, className }: NewsThumbnailProps) {
  const url = thumbnailUrl?.trim();
  const [failed, setFailed] = useState(false);

  if (!url || failed) {
    return <SiteLogoPlaceholder variant={variant} />;
  }

  const imgClass =
    className ??
    (variant === "article"
      ? "absolute inset-0 h-full w-full object-cover"
      : "absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]");

  return (
    // eslint-disable-next-line @next/next/no-img-element -- 外链缩略图需 referrerPolicy，失败时 onError 回退
    <img
      src={url}
      alt=""
      referrerPolicy="no-referrer"
      className={imgClass}
      onError={() => setFailed(true)}
    />
  );
}
