"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getBrowserLang, uiText, type LangCode } from "@/lib/i18n";
import { UserAvatarLink } from "@/components/layout/user-avatar-link";
import { PageLoading } from "@/components/feedback";
import { fetchMe, getSession, logout, navDisplayName, type AuthSession } from "@/lib/auth-client";
import { UserProfileForm } from "./user-profile-form";

function openAuthModal(mode: "login" | "register" = "login") {
  window.dispatchEvent(
    new CustomEvent("shuziyili:open-auth", { detail: { mode } })
  );
}

export function AccountPageClient() {
  const [lang, setLang] = useState<LangCode>("zh");
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setLang(getBrowserLang()), 0);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const local = getSession();
      if (!local) {
        if (!cancelled) {
          setSession(null);
          setLoading(false);
        }
        return;
      }
      const me = await fetchMe();
      if (!cancelled) {
        setSession(me);
        setLoading(false);
      }
    };

    void load();

    const onAuth = () => void load();
    window.addEventListener("shuziyili:auth-changed", onAuth);
    return () => {
      cancelled = true;
      window.removeEventListener("shuziyili:auth-changed", onAuth);
    };
  }, []);

  const t = uiText[lang];

  if (loading) {
    return (
      <PageLoading
        variant="section"
        label={lang === "zh" ? "账号加载中" : "Loading account"}
        size={56}
      />
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">{t.personalCenter}</h1>
        <p className="mt-4 text-sm text-muted">{t.accountHint}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => openAuthModal("login")}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-95"
          >
            {t.accountGoLogin}
          </button>
          <Link
            href="/"
            className="inline-flex items-center rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground/90 hover:border-primary/30"
          >
            {lang === "zh" ? "返回首页" : "Home"}
          </Link>
        </div>
      </div>
    );
  }

  const updated =
    session.updatedAt > 0
      ? new Date(session.updatedAt).toLocaleString(lang === "zh" ? "zh-CN" : "en-US")
      : "—";

  return (
    <div className="mx-auto max-w-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <UserAvatarLink
          session={session}
          ariaLabel={t.personalCenter}
          size="lg"
          asDiv
        />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">{t.personalCenter}</h1>
          <p className="mt-1 text-base font-medium text-foreground">{navDisplayName(session)}</p>
          <p className="mt-0.5 truncate font-mono text-xs text-muted">{session.identifier}</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-muted">{t.accountPageSubtitle}</p>

      <div className="mt-6 space-y-6">
        <p className="text-sm text-muted">
          {t.profileUpdated}：{updated}
        </p>

        <UserProfileForm
          session={session}
          lang={lang}
          onSaved={() => {
            window.dispatchEvent(new Event("shuziyili:auth-changed"));
            void fetchMe().then((s) => {
              if (s) setSession(s);
            });
          }}
        />

        <div className="flex flex-wrap gap-3 border-t border-border pt-6">
          <button
            type="button"
            onClick={() => {
              void (async () => {
                await logout();
                window.dispatchEvent(new Event("shuziyili:auth-changed"));
                setSession(null);
              })();
            }}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground/90 hover:border-red-300 hover:text-red-700 dark:hover:border-red-800 dark:hover:text-red-400"
          >
            {t.logout}
          </button>
        </div>
      </div>
    </div>
  );
}
