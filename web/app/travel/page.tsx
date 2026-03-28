import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "旅游",
  description: "伊犁旅游概览。",
  alternates: { canonical: "/travel" },
};

export default function TravelPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground md:text-3xl">旅游</h1>
      <p className="mt-2 text-sm text-muted">请用左侧导航进入各二级栏目（移动端为上方横向入口）。</p>
    </div>
  );
}
