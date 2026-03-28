import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "攻略",
  alternates: { canonical: "/travel/guide" },
};

export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-bold md:text-3xl">攻略</h1>
      <p className="mt-2 text-sm text-muted">接 API 后展示列表。</p>
    </div>
  );
}
