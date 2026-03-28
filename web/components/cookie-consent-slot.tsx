"use client";

import dynamic from "next/dynamic";

const CookieConsentBanner = dynamic(
  () => import("@/components/cookie-consent-banner").then((m) => ({ default: m.CookieConsentBanner })),
  { ssr: false },
);

/** 在 Server Layout 中挂载；内部 dynamic ssr:false 避免 Cookie 条 hydration 不一致 */
export function CookieConsentSlot() {
  return <CookieConsentBanner />;
}
