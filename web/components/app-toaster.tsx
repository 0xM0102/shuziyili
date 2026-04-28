"use client";

import { Toaster } from "sonner";
import { useTheme } from "@/components/theme-provider";

/** 全局 Toast：顶栏为 flex 首行固定，`offset` 避免与顶栏/刘海区重叠。 */
export function AppToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      theme={resolvedTheme}
      position="top-center"
      offset={{
        top: "calc(4.25rem + env(safe-area-inset-top, 0px))",
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
