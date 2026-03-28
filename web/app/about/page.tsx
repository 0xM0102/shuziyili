import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "关于",
  description: `关于${siteConfig.name}。`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-foreground md:text-3xl">关于</h1>
      <p className="mt-4 text-sm text-muted">民间便民门户，条款与说明后续完善。</p>
    </div>
  );
}
