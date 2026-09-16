"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Banner {
  id: string;
  url: string;
  label?: string | null;
}

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const count = banners.length;

  const goTo = useCallback((index: number) => {
    setCurrent((index + count) % count);
  }, [count]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);

  // Auto-scroll every 3s (only if 2+ banners and not hovered)
  useEffect(() => {
    if (count <= 1 || isHovered) return;
    intervalRef.current = setInterval(next, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [count, current, isHovered, next]);

  // Touch handlers for swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipe = 50;
    if (Math.abs(distance) >= minSwipe) {
      if (distance > 0) goTo(current + 1); // swipe left → next
      else goTo(current - 1); // swipe right → prev
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  if (count === 0) return null;

  // Single banner — static, no carousel
  if (count === 1) {
    return (
      <div className="rounded-2xl overflow-hidden shadow-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800">
        <div className="aspect-[4/3] relative">
          <img src={banners[0].url} alt={banners[0].label || "Banner"} className="w-full h-full object-contain bg-stone-50 dark:bg-stone-900" />
          {banners[0].label && (
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-sm font-bold px-3 py-1.5 rounded-xl">
              {banners[0].label}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Multi-banner carousel
  return (
    <div
      className="relative rounded-2xl overflow-hidden shadow-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="aspect-[4/3] relative overflow-hidden">
        <div
          className="flex h-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {banners.map((b) => (
            <div key={b.id} className="w-full h-full flex-shrink-0 relative">
              <img src={b.url} alt={b.label || "Banner"} className="w-full h-full object-contain bg-stone-50 dark:bg-stone-900" />
              {b.label && (
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-sm font-bold px-3 py-1.5 rounded-xl">
                  {b.label}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-3 right-3 flex gap-1.5">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={"w-2 h-2 rounded-full transition-all duration-300 " +
              (i === current
                ? "bg-white w-5 shadow-md"
                : "bg-white/50 hover:bg-white/70")}
            aria-label={`Go to banner ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
