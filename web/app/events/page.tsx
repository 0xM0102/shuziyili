import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "活动",
  description: "伊犁本地活动与报名。",
  alternates: { canonical: "/events" },
};

export default function HuodongPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground md:text-3xl">活动</h1>
      <p className="mt-2 text-sm text-muted">列表与报名接 API 后再做。</p>
    </div>
  );
}
