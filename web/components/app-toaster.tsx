"use client";

import { Toaster } from "sonner";
import { useTheme } from "@/components/theme-provider";

/** 全局 Toast：`offset` 与 `--app-header-offset` 对齐，避免压住固定顶栏。 */
export function AppToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      theme={resolvedTheme}
      position="top-center"
      offset={{
        top: "var(--app-header-offset, calc(4rem + env(safe-area-inset-top, 0px) + 1px))",
      }}
      richColors
      closeButton
      duration={3200}
      toastOptions={{
        classNames: {
          toast: "font-sans",
        },
      }}
    />
  );
}
