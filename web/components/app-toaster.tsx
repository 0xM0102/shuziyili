"use client";

import { Toaster } from "sonner";
import { useTheme } from "@/components/theme-provider";

/** 全局 Toast：随明暗主题切换，置于顶栏之上（z-index 由 sonner 默认保证）。 */
export function AppToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      theme={resolvedTheme}
      position="top-center"
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
