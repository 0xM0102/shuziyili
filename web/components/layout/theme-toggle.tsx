"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";

type Props = {
  /** 顶栏实色背景上使用浅色描边与文字 */
  onPrimary?: boolean;
};

export function ThemeToggle({ onPrimary }: Props) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 避免在 effect 同步 setState（React 19/ESLint 会认为可能触发级联渲染）
    const t = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(t);
  }, []);

  const baseBtn =
    "inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-sm transition-colors";

  if (!mounted) {
    return (
      <span
        className={`${baseBtn} ${onPrimary ? "border border-border text-muted" : "text-muted"}`}
        aria-hidden
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  const btnClass = onPrimary
    ? `${baseBtn} text-foreground/80 hover:text-primary`
    : `${baseBtn} text-foreground/80 hover:text-primary`;

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={btnClass}
      aria-label={isDark ? "切换为浅色模式" : "切换为深色模式"}
    >
      {isDark ? (
        <span className="text-lg leading-none" aria-hidden>
          ☀
        </span>
      ) : (
        <span className="text-lg leading-none" aria-hidden>
          ☽
        </span>
      )}
    </button>
  );
}
