/** 记录用户已阅读 Cookie 说明（仅存于浏览器本地，非 HttpOnly Cookie） */
export const COOKIE_CONSENT_STORAGE_KEY = "shuziyili_cookie_consent";

export function hasCookieConsentRecorded(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function recordCookieConsent(): void {
  try {
    localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, "1");
  } catch {
    // ignore
  }
}
