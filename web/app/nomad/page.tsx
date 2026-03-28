import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "数字游民",
  description: "伊犁数字游民实用信息。",
  alternates: { canonical: "/nomad" },
};

export default function YouminPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground md:text-3xl">数字游民</h1>
      <p className="mt-2 text-sm text-muted">内容稍后补充。</p>
    </div>
  );
}
