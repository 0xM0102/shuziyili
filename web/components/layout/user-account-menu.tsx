"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { logout, navDisplayName, type AuthSession } from "@/lib/auth-client";
import { SettingsIcon } from "@/components/icons/settings-icon";
import { uiText, type LangCode } from "@/lib/i18n";
import { UserAvatarLink } from "./user-avatar-link";

function shortenId(id: string) {
  const t = id.trim();
  if (t.length <= 28) return t;
  return `${t.slice(0, 14)}…${t.slice(-8)}`;
}

export function UserAccountMenu({
  session,
  lang,
  onNavigate,
  onOpenSettings,
}: {
  session: AuthSession;
  lang: LangCode;
  /** 移动端展开菜单关闭后回调 */
  onNavigate?: () => void;
  /** 打开顶栏同款设置弹窗 */
  onOpenSettings?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const t = uiText[lang];
  const name = navDisplayName(session);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const closeAll = () => {
    setOpen(false);
    onNavigate?.();
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className="flex items-center gap-0.5 rounded-full text-left outline-none transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/50"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
      >
        <UserAvatarLink session={session} ariaLabel={t.personalCenter} asDiv />
        <span
          className={`flex h-8 w-6 shrink-0 items-center justify-center text-muted transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 top-[calc(100%+8px)] z-[70] min-w-[240px] rounded-xl border border-border bg-card py-1"
        >
          <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{name}</p>
              <p className="mt-0.5 truncate font-mono text-xs text-muted" title={session.identifier}>
                {shortenId(session.identifier)}
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:bg-sidebar-hover hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/45"
              aria-label={lang === "zh" ? "设置" : "Settings"}
              onClick={() => {
                setOpen(false);
                onNavigate?.();
                onOpenSettings?.();
              }}
            >
              <SettingsIcon className="h-5 w-5" />
            </button>
          </div>
          <Link
            href="/account"
            role="menuitem"
            className="block px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-sidebar-hover"
            onClick={() => closeAll()}
          >
            {t.personalCenter}
          </Link>
          <button
            type="button"
            role="menuitem"
            className="w-full px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-sidebar-hover"
            onClick={() => {
              void (async () => {
                await logout();
                window.dispatchEvent(new Event("shuziyili:auth-changed"));
                closeAll();
              })();
            }}
          >
            {t.logout}
          </button>
        </div>
      ) : null}
    </div>
  );
}
