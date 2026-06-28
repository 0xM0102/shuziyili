"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { primaryNav } from "@/lib/nav";
import { siteConfig } from "@/lib/site";
import { SiteWordmark } from "@/components/brand/site-wordmark";
import { NavWeatherLink } from "./nav-weather-link";
import { SearchBox } from "./search-box";
import { SettingsModal } from "./settings-modal";
import { SettingsIcon } from "@/components/icons/settings-icon";
import { UserAccountMenu } from "./user-account-menu";
import { AuthModal } from "../auth/auth-modal";
import { getBrowserLang, navLabels, uiText, type LangCode } from "@/lib/i18n";
import { fetchMe, getSession, type AuthSession } from "@/lib/auth-client";
import { navItemIsActive } from "@/lib/nav-active";
import { APP_HEADER_OFFSET_VAR } from "@/lib/layout-tokens";
import { appFrameClassName } from "@/lib/page-layout";

type AuthMode = "login" | "register";
type PrimaryNavPlacement = "desktop" | "mobile";

const desktopSecondaryButtonClassName =
  "hidden h-10 items-center rounded-lg bg-transparent px-3.5 text-[15px] font-semibold text-foreground/90 transition-colors hover:bg-sidebar-hover hover:text-primary md:inline-flex";
const desktopPrimaryButtonClassName =
  "hidden h-10 items-center rounded-lg bg-primary px-3.5 text-[15px] font-semibold text-primary-foreground transition-colors hover:opacity-95 md:inline-flex";
const iconButtonClassName =
  "inline-flex h-10 w-10 items-center justify-center rounded-lg bg-transparent text-foreground/80 transition-colors hover:bg-sidebar-hover hover:text-primary";

function useBrowserLangState() {
  const [lang, setLang] = useState<LangCode>("zh");

  useEffect(() => {
    const timer = window.setTimeout(() => setLang(getBrowserLang()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return [lang, setLang] as const;
}

function useSyncedHeaderOffset(headerRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const el = headerRef.current;
    const root = document.documentElement;
    if (!el) return;

    let frame = 0;

    const sync = () => {
      frame = 0;
      const height = Math.ceil(el.getBoundingClientRect().height);
      root.style.setProperty(APP_HEADER_OFFSET_VAR, `${height}px`);
    };

    const scheduleSync = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(sync);
    };

    sync();

    const observer = new ResizeObserver(scheduleSync);
    observer.observe(el);
    window.addEventListener("resize", scheduleSync);
    window.visualViewport?.addEventListener("resize", scheduleSync);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", scheduleSync);
      window.visualViewport?.removeEventListener("resize", scheduleSync);
    };
  }, [headerRef]);
}

function useAuthSession() {
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      const s = getSession();
      if (!s) {
        if (!cancelled) setSession(null);
        return;
      }

      try {
        const me = await fetchMe();
        if (!cancelled) setSession(me);
      } catch {
        if (!cancelled) setSession(null);
      }
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

  return session;
}

function primaryNavLinkClassName(placement: PrimaryNavPlacement, active: boolean) {
  if (placement === "desktop") {
    return `shrink-0 rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors ${
      active
        ? "bg-primary/10 text-primary"
        : "text-foreground/85 hover:bg-sidebar-hover hover:text-foreground"
    }`;
  }

  return `block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
    active ? "bg-primary/10 text-primary" : "text-foreground/90 hover:bg-sidebar-hover"
  }`;
}

function PrimaryNavLink({
  item,
  labelMap,
  pathname,
  placement,
  onNavigate,
}: {
  item: (typeof primaryNav)[number];
  labelMap: Record<string, string>;
  pathname: string;
  placement: PrimaryNavPlacement;
  onNavigate?: () => void;
}) {
  const active = navItemIsActive(pathname, item.href, "primary");

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={primaryNavLinkClassName(placement, active)}
      onClick={onNavigate}
    >
      {labelMap[item.href] ?? item.label}
    </Link>
  );
}

/** 全站顶栏：`fixed` + CSS 变量占位，避免与 `main` 内滚动层叠导致内容被挡。 */
export function TopNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  useSyncedHeaderOffset(headerRef);

  const [lang, setLang] = useBrowserLangState();
  const session = useAuthSession();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const openAuth = useCallback((mode: AuthMode) => {
    setAuthMode(mode);
    setAuthOpen(true);
  }, []);

  useEffect(() => {
    const onOpenAuth = (e: Event) => {
      const ce = e as CustomEvent<{ mode?: AuthMode }>;
      openAuth(ce.detail?.mode === "register" ? "register" : "login");
    };
    window.addEventListener("shuziyili:open-auth", onOpenAuth);
    return () => window.removeEventListener("shuziyili:open-auth", onOpenAuth);
  }, [openAuth]);

  const t = uiText[lang];
  const labelMap = navLabels[lang];

  return (
    <header
      ref={headerRef}
      className={`${appFrameClassName} fixed inset-x-0 top-0 z-50 border-b border-border bg-background pt-[env(safe-area-inset-top,0px)] text-foreground`}
    >
      <div className="flex h-16 w-full items-center gap-3 px-4 md:gap-4 md:px-5">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-foreground"
          onClick={() => setOpen(false)}
        >
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
            <PrimaryNavLink
              key={item.href}
              item={item}
              labelMap={labelMap}
              pathname={pathname}
              placement="desktop"
            />
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <NavWeatherLink />
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
                className={desktopPrimaryButtonClassName}
                onClick={() => openAuth("login")}
              >
                {t.login}
              </button>
              <button
                type="button"
                className={desktopSecondaryButtonClassName}
                onClick={() => openAuth("register")}
              >
                {t.register}
              </button>
            </>
          )}
          {/* 已登录时设置入口在头像菜单内；未登录保留此处 */}
          {!session ? (
            <button
              type="button"
              className={iconButtonClassName}
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
                <PrimaryNavLink
                  item={item}
                  labelMap={labelMap}
                  pathname={pathname}
                  placement="mobile"
                  onNavigate={() => setOpen(false)}
                />
              </li>
            ))}
          </ul>

          {!session ? (
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground"
                onClick={() => {
                  openAuth("login");
                  setOpen(false);
                }}
              >
                {t.login}
              </button>
              <button
                type="button"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-semibold text-foreground/90"
                onClick={() => {
                  openAuth("register");
                  setOpen(false);
                }}
              >
                {t.register}
              </button>
            </div>
          ) : null}
        </nav>
      ) : null}

      <SettingsModal
        open={settingsOpen}
        lang={lang}
        onLangChange={setLang}
        onClose={() => setSettingsOpen(false)}
      />

      <AuthModal
        open={authOpen}
        mode={authMode}
        lang={lang}
        onClose={() => setAuthOpen(false)}
      />
    </header>
  );
}
