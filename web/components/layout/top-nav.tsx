"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { primaryNav } from "@/lib/nav";
import { siteConfig } from "@/lib/site";
import { SiteWordmark } from "@/components/brand/site-wordmark";
import { SearchBox } from "./search-box";
import { SettingsModal } from "./settings-modal";
import { SettingsIcon } from "@/components/icons/settings-icon";
import { UserAccountMenu } from "./user-account-menu";
import { AuthModal } from "../auth/auth-modal";
import { getBrowserLang, navLabels, uiText, type LangCode } from "@/lib/i18n";
import { fetchMe, getSession, type AuthSession } from "@/lib/auth-client";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** 全屏门户顶栏：一级菜单通栏（伊犁蓝实底，对齐 Bee 式结构） */
export function TopNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const [lang, setLang] = useState<LangCode>("zh");
  const [session, setSession] = useState<AuthSession | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setLang(getBrowserLang()), 0);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const onOpenAuth = (e: Event) => {
      const ce = e as CustomEvent<{ mode?: "login" | "register" }>;
      setAuthMode(ce.detail?.mode === "register" ? "register" : "login");
      setAuthOpen(true);
    };
    window.addEventListener("shuziyili:open-auth", onOpenAuth);
    return () => window.removeEventListener("shuziyili:open-auth", onOpenAuth);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      const s = getSession();
      if (!s) {
        if (!cancelled) setSession(null);
        return;
      }

      const me = await fetchMe();
      if (!cancelled) setSession(me);
    };

    void refresh();

    const handler = () => {
      void refresh();
    };

    window.addEventListener("shuziyili:auth-changed", handler);
    return () => {
      cancelled = true;
      window.removeEventListener("shuziyili:auth-changed", handler);
    };
  }, []);

  const t = uiText[lang];
  const labelMap = navLabels[lang];

  const btnGhost =
    "hidden h-10 items-center rounded-lg bg-transparent px-3.5 text-[15px] font-semibold text-foreground/90 transition-colors hover:bg-sidebar-hover hover:text-primary md:inline-flex";
  const btnPrimary =
    "hidden h-10 items-center rounded-lg bg-primary px-3.5 text-[15px] font-semibold text-primary-foreground transition-colors hover:opacity-95 md:inline-flex";
  const btnIcon =
    "inline-flex h-10 w-10 items-center justify-center rounded-lg bg-transparent text-foreground/80 transition-colors hover:bg-sidebar-hover hover:text-primary";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background text-foreground">
      <div className="flex h-16 w-full items-center gap-3 px-4 md:gap-4 md:px-5">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-foreground"
          onClick={() => setOpen(false)}
        >
          {/* 将 yl_logo.svg 置于 web/public/ */}
          {/* eslint-disable-next-line @next/next/no-img-element -- 品牌 SVG 来自 public */}
          <img
            src={siteConfig.logoPath}
            alt=""
            width={36}
            height={36}
            className="h-9 w-auto shrink-0 object-contain"
          />
          <SiteWordmark className="h-6 w-auto shrink-0 text-foreground md:h-7" />
          <span className="sr-only">{siteConfig.name}</span>
        </Link>

        <nav
          className="hidden min-w-0 flex-1 items-center gap-0.5 overflow-x-auto md:ml-6 md:flex lg:ml-10"
          aria-label="一级菜单"
        >
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors ${
                isActive(pathname, item.href)
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/85 hover:bg-sidebar-hover hover:text-foreground"
              }`}
            >
              {labelMap[item.href] ?? item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <SearchBox placeholder={t.searchPlaceholder} />
          {session ? (
            <UserAccountMenu
              session={session}
              lang={lang}
              onOpenSettings={() => setSettingsOpen(true)}
            />
          ) : (
            <>
              <button
                type="button"
                className={btnPrimary}
                onClick={() => {
                  setAuthMode("login");
                  setAuthOpen(true);
                }}
              >
                {t.login}
              </button>
              <button
                type="button"
                className={btnGhost}
                onClick={() => {
                  setAuthMode("register");
                  setAuthOpen(true);
                }}
              >
                {t.register}
              </button>
            </>
          )}
          {/* 已登录时设置入口在头像菜单内；未登录保留此处 */}
          {!session ? (
            <button
              type="button"
              className={btnIcon}
              aria-label="设置"
              onClick={() => setSettingsOpen(true)}
            >
              <SettingsIcon className="h-5 w-5" />
            </button>
          ) : null}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-sidebar-hover md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "关闭菜单" : "打开菜单"}
            onClick={() => setOpen((o) => !o)}
          >
            <span className="sr-only">菜单</span>
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          className="border-t border-border bg-card px-4 py-3 md:hidden"
          aria-label="一级菜单"
        >
          {session ? (
            <div className="mb-3 flex justify-start">
              <UserAccountMenu
                session={session}
                lang={lang}
                onNavigate={() => setOpen(false)}
                onOpenSettings={() => setSettingsOpen(true)}
              />
            </div>
          ) : null}
          <ul className="flex flex-col gap-0.5">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive(pathname, item.href)
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/90"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {labelMap[item.href] ?? item.label}
                </Link>
              </li>
            ))}
          </ul>

          {!session ? (
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground"
                onClick={() => {
                  setAuthMode("login");
                  setAuthOpen(true);
                  setOpen(false);
                }}
              >
                {t.login}
              </button>
              <button
                type="button"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-semibold text-foreground/90"
                onClick={() => {
                  setAuthMode("register");
                  setAuthOpen(true);
                  setOpen(false);
                }}
              >
                {t.register}
              </button>
            </div>
          ) : null}
        </nav>
      ) : null}

      <SettingsModal open={settingsOpen} lang={lang} onLangChange={setLang} onClose={() => setSettingsOpen(false)} />

      <AuthModal
        open={authOpen}
        mode={authMode}
        lang={lang}
        onClose={() => setAuthOpen(false)}
      />
    </header>
  );
}
