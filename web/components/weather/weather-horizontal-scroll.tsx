"use client";

import { useRef, type ReactNode } from "react";

type WeatherHorizontalScrollProps = {
  children: ReactNode;
  className?: string;
};

export function WeatherHorizontalScroll({ children, className }: WeatherHorizontalScrollProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByStep = (direction: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.max(el.clientWidth * 0.7, 180), behavior: "smooth" });
  };

  return (
    <div className={`relative ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => scrollByStep(-1)}
        className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-border bg-card/95 p-1.5 text-muted shadow-sm transition hover:text-foreground"
        aria-label="向左滚动"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 6l-6 6 6 6" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => scrollByStep(1)}
        className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-border bg-card/95 p-1.5 text-muted shadow-sm transition hover:text-foreground"
        aria-label="向右滚动"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>
      <div
        ref={scrollerRef}
        className="overflow-x-auto px-8 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </div>
  );
}
