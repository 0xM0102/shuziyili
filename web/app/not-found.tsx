import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-foreground">页面未找到</h1>
      <p className="mt-2 text-sm text-muted">链接可能已失效或内容尚未上线。</p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
      >
        返回首页
      </Link>
    </div>
  );
}
