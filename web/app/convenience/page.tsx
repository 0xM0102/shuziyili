import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "便民",
  description: "伊犁便民黄页。",
  alternates: { canonical: "/convenience" },
};

export default function BianminPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground md:text-3xl">便民黄页</h1>
      <p className="mt-2 text-sm text-muted">分类请使用左侧导航（移动端为上方横向入口）。</p>
    </div>
  );
}
