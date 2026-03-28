import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "资讯",
  description: "伊犁本地资讯。",
  alternates: { canonical: "/news" },
};

export default function ZixunPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground md:text-3xl">资讯</h1>
      <p className="mt-2 text-sm text-muted">列表接 API 后再做。</p>
    </div>
  );
}
