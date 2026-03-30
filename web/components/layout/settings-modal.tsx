"use client";

import { useEffect } from "react";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";
import { SeniorToggle } from "./senior-toggle";
import type { LangCode } from "@/lib/i18n";

/** 全局偏好：语言 / 主题 / 银发模式。资料编辑在「个人中心」页，避免与设置弹窗重复。 */
export function SettingsModal({
  open,
  lang,
  onLangChange,
  onClose,
}: {
  open: boolean;
  lang: LangCode;
  onLangChange: (lang: LangCode) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center px-4 py-10">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-border bg-background"
        role="dialog"
        aria-modal="true"
        aria-label="设置"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-[15px] font-semibold text-foreground">设置</p>
          <button
            type="button"
            className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] font-semibold text-foreground/80 hover:border-primary/30 hover:text-primary"
            onClick={onClose}
          >
            关闭
          </button>
        </div>

        <div className="space-y-4 px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[15px] font-semibold text-foreground">银发模式</p>
              <p className="mt-1 text-xs text-muted">字体与控件更大、更清晰</p>
            </div>
            <SeniorToggle />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[15px] font-semibold text-foreground">语言</p>
              <p className="mt-1 text-xs text-muted">切换界面显示语言</p>
            </div>
            <LanguageSwitcher value={lang} onChange={onLangChange} />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[15px] font-semibold text-foreground">外观</p>
              <p className="mt-1 text-xs text-muted">白天 / 黑夜模式</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
