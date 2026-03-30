"use client";

import { useState } from "react";

const actionBtnClass =
  "inline-flex h-8 items-center justify-center rounded-md border border-border bg-background px-2.5 hover:text-primary";

type ShareRowProps = {
  url: string;
  /** 左侧日期/时间；不传则用当天 UTC 日期（仅作占位，文章/快讯页应传入真实时间） */
  dateLabel?: string;
  /** Web Share API 的 title */
  shareTitle?: string;
};

export function ShareRow({ url, dateLabel, shareTitle }: ShareRowProps) {
  const [copied, setCopied] = useState(false);
  const [shareErr, setShareErr] = useState(false);
  const left = dateLabel ?? new Date().toISOString().slice(0, 10);

  const canNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard 不可用则静默 */
    }
  }

  async function nativeShare() {
    try {
      setShareErr(false);
      await navigator.share({
        title: shareTitle ?? document.title,
        url,
      });
    } catch (e) {
      if ((e as Error).name !== "AbortError") setShareErr(true);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span className="text-xs text-muted">{left}</span>
      <div className="flex items-center gap-2 text-xs text-muted">
        <span className="hidden sm:inline">分享</span>
        {canNativeShare ? (
          <button type="button" className={actionBtnClass} onClick={() => void nativeShare()} aria-label="系统分享">
            {shareErr ? "分享失败" : "转发"}
          </button>
        ) : null}
        <button type="button" className={actionBtnClass} onClick={() => void copyLink()} aria-label="复制链接">
          {copied ? "已复制" : "复制链接"}
        </button>
      </div>
    </div>
  );
}
