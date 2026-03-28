import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "个人中心",
  description: `在${siteConfig.name}查看与编辑个人资料、管理账号。`,
  alternates: { canonical: "/account" },
};

export default function AccountLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
