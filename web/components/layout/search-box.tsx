"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "@/components/icons/search-icon";

export function SearchBox({
  placeholder,
}: {
  placeholder: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <form
      className="relative hidden md:block"
      onSubmit={(e) => {
        e.preventDefault();
        const v = q.trim();
        if (!v) return;
        router.push(`/search?q=${encodeURIComponent(v)}`);
      }}
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-72 rounded-lg border border-transparent bg-sidebar-hover/70 pl-3 pr-9 text-[15px] text-foreground placeholder:text-muted outline-none transition-colors focus:border-primary/40 focus:bg-sidebar-hover"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted transition-colors hover:bg-background/70 hover:text-primary"
        aria-label="搜索"
      >
        <SearchIcon className="h-4.5 w-4.5" title="搜索" />
      </button>
    </form>
  );
}

