import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "交通",
  alternates: { canonical: "/travel/transport" },
};

export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-bold md:text-3xl">交通</h1>
      <p className="mt-2 text-sm text-muted">接 API 后展示内容。</p>
    </div>
  );
}
