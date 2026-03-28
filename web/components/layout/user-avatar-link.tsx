"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { navDisplayName, type AuthSession } from "@/lib/auth-client";

function isHttpAvatar(url: string | undefined) {
  if (!url) return false;
  const u = url.trim();
  return u.startsWith("http://") || u.startsWith("https://");
}

export function UserAvatarLink({
  session,
  ariaLabel,
  size = "md",
  asDiv = false,
  onNavigate,
}: {
  session: AuthSession;
  ariaLabel: string;
  size?: "sm" | "md" | "lg";
  /** 在个人中心页内展示大图时不需要再套一层链接 */
  asDiv?: boolean;
  /** 移动端抽屉内点击后关闭菜单等 */
  onNavigate?: () => void;
}) {
  const name = navDisplayName(session);
  const initial = (name.trim().slice(0, 1) || "?").toUpperCase();
  const rawUrl = session.avatarUrl?.trim() ?? "";
  const canTryImg = isHttpAvatar(rawUrl);

  const [imgOk, setImgOk] = useState(true);
  useEffect(() => {
    setImgOk(true);
  }, [rawUrl]);

  const dim =
    size === "sm"
      ? "h-9 w-9 text-[13px]"
      : size === "lg"
        ? "h-20 w-20 text-2xl"
        : "h-10 w-10 text-sm";
  const showPhoto = canTryImg && imgOk;

  const className = `relative flex ${dim} shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-primary/10 text-primary ${
    asDiv
      ? ""
      : "transition hover:border-primary/50 hover:bg-primary/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
  }`;

  const inner = showPhoto ? (
    // eslint-disable-next-line @next/next/no-img-element -- 外链头像，避免配置各图床域名
    <img
      src={rawUrl}
      alt=""
      className="h-full w-full object-cover"
      onError={() => setImgOk(false)}
    />
  ) : (
    <span className="font-bold">{initial}</span>
  );

  if (asDiv) {
    return (
      <div className={className} role="img" aria-label={ariaLabel}>
        {inner}
      </div>
    );
  }

  return (
    <Link
      href="/account"
      className={className}
      title={ariaLabel}
      aria-label={ariaLabel}
      onClick={() => onNavigate?.()}
    >
      {inner}
    </Link>
  );
}
