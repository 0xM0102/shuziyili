import type { Metadata } from "next";
import { uiText } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Search",
  description: "Search results placeholder.",
  robots: { index: false, follow: true },
};

type Props = {
  searchParams: { q?: string };
};

export default function SearchPage({ searchParams }: Props) {
  const q = searchParams.q ?? "";
  const t = uiText.zh;

  return (
    <div className="space-y-4 py-4 md:py-6">
      <h1 className="text-2xl font-bold text-foreground">搜索（占位）</h1>
      <p className="text-sm text-muted">
        关键词：<span className="text-foreground">{q}</span>
      </p>
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="text-sm text-muted">
          后续这里将接入后端搜索（资讯/黄页/活动等）。当前为结构占位。
        </p>
      </div>
      <p className="text-xs text-muted">
        {t.searchEmpty}
      </p>
    </div>
  );
}

