"use client";

import { useState } from "react";

export function ShareRow({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-muted">{new Date().toISOString().slice(0, 10)}</span>
      <div className="flex items-center gap-2 text-xs text-muted">
        <span className="hidden sm:inline">分享至</span>
        <button
          type="button"
          className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-background px-2.5 hover:text-primary"
          onClick={() => {
            void (async () => {
              try {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1200);
              } catch {
                // ignore
              }
            })();
          }}
          aria-label="复制链接"
        >
          {copied ? "已复制" : "复制链接"}
        </button>
      </div>
    </div>
  );
}

