"use client";

import { useEffect, useState } from "react";

const KEY = "shuziyili_senior_mode_v1";

function setHtmlSenior(enabled: boolean) {
  try {
    document.documentElement.classList.toggle("senior", enabled);
  } catch {
    // ignore
  }
}

export function SeniorToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const on = raw === "1";
      const t = window.setTimeout(() => {
        setEnabled(on);
        setHtmlSenior(on);
      }, 0);
      return () => window.clearTimeout(t);
    } catch {
      // ignore
    }
  }, []);

  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-sidebar-hover"
      role="switch"
      aria-checked={enabled}
      aria-label={enabled ? "关闭银发模式" : "开启银发模式"}
      onClick={() => {
        const next = !enabled;
        setEnabled(next);
        setHtmlSenior(next);
        try {
          localStorage.setItem(KEY, next ? "1" : "0");
        } catch {
          // ignore
        }
      }}
    >
      <span className="text-[15px] font-semibold text-foreground/90">银发模式</span>
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-colors ${
          enabled ? "border-primary bg-primary/20" : "border-border bg-background"
        }`}
        aria-hidden
      >
        <span
          className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-primary transition-transform ${
            enabled ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

