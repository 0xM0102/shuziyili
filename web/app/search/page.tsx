import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "搜索",
  description: "搜索数字伊犁的资讯、活动、便民与旅游内容。",
  robots: { index: false, follow: true },
};

type Props = {
  searchParams: { q?: string };
};

export default function SearchPage({ searchParams }: Props) {
  const q = searchParams.q ?? "";

  return (
    <div className="space-y-4 py-4 md:py-6">
      <h1 className="text-2xl font-bold text-foreground">搜索</h1>
      <p className="text-sm text-muted">
        关键词：<span className="text-foreground">{q || "未输入"}</span>
      </p>
      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-sm text-muted">
          可以从顶部搜索框重新输入关键词，优先查找资讯、活动、旅游和便民内容。
        </p>
      </div>
    </div>
  );
}
