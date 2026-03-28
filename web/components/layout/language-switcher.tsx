"use client";

import { useEffect, useState } from "react";
import { languages, type LangCode } from "@/lib/i18n";

export function LanguageSwitcher({
  value,
  onChange,
}: {
  value: LangCode;
  onChange: (lang: LangCode) => void;
}) {
  const [open, setOpen] = useState(false);

  // 关闭下拉：更友好（点击空白处/路由跳转）
  useEffect(() => {
    const onDoc = () => setOpen(false);
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <div className="relative">
      <button
        type="button"
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 text-foreground/90 transition-colors hover:border-primary/30 hover:text-primary"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <span className="text-[15px]">{languages.find((l) => l.code === value)?.label}</span>
        <span className="text-lg leading-none" aria-hidden>
          ▾
        </span>
      </button>

      {open ? (
        <div
          className="absolute right-0 top-11 z-50 w-40 overflow-hidden rounded-lg border border-border bg-card"
          role="menu"
          aria-label="语言选择"
        >
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              className={`block w-full px-3 py-2.5 text-left text-sm transition-colors ${
                l.code === value
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/90 hover:bg-sidebar-hover hover:text-foreground"
              }`}
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                onChange(l.code);
                setOpen(false);
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

