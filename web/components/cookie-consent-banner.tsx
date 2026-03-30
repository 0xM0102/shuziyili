"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { COOKIE_CONSENT_STORAGE_KEY, recordCookieConsent } from "@/lib/cookie-consent";

function readShouldShowBanner(): boolean {
  try {
    return localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) !== "1";
  } catch {
    return true;
  }
}

/** 首次访问底栏提示（仅客户端挂载，见 layout 中 dynamic ssr:false） */
export function CookieConsentBanner() {
  const [open, setOpen] = useState(readShouldShowBanner);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === COOKIE_CONSENT_STORAGE_KEY || e.key === null) setOpen(readShouldShowBanner());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (!open) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-100 flex justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      role="dialog"
      aria-label="Cookie 与本地存储说明"
      aria-live="polite"
    >
      <div className="pointer-events-auto flex w-full max-w-3xl flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3 md:flex-row md:items-center md:justify-between md:gap-4 md:px-5 md:py-4">
        <p className="text-sm leading-relaxed text-foreground/90">
          我们使用 Cookie 与本地存储，用于保持登录状态、记住主题与语言等偏好。
          <Link href="/cookies" className="ml-1 font-medium text-primary underline-offset-2 hover:underline">
            查看说明
          </Link>
        </p>
        <div className="flex shrink-0 flex-wrap items-center gap-2 md:justify-end">
          <button
            type="button"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-95"
            onClick={() => {
              recordCookieConsent();
              setOpen(false);
            }}
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  );
}
