"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShellInner } from "./app-shell-inner";

function AppShellWithSearch({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  return <AppShellInner searchKey={searchKey}>{children}</AppShellInner>;
}

/**
 * 门户壳层：侧栏 + 主列滚动。`Suspense` 包裹 `useSearchParams`，避免仅 query 变化时主列仍停在旧滚动位置。
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<AppShellInner searchKey="">{children}</AppShellInner>}>
      <AppShellWithSearch>{children}</AppShellWithSearch>
    </Suspense>
  );
}
