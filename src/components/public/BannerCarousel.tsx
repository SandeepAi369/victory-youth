"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Banner {
  id: string;
  url: string;
  label?: string | null;
}

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const touchRef = useRef<{ startX: number; startTime: number } | null>(null);
  const count = banners.length;

  // Always go forward (wraps around)
  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % count);
  }, [count]);

  const goTo = useCallback((index: number) => {
    setCurrent(((index % count) + count) % count);
  }, [count]);

  // Auto-scroll every 4s — forward only, infinite loop
  useEffect(() => {
    if (count <= 1 || isHovered) return;
    const id = setInterval(next, 4000);
    return () => clearInterval(id);
  }, [count, isHovered, next]);

  // ── Touch / Swipe handlers (ultra-responsive) ──
  const onTouchStart = (e: React.TouchEvent) => {
    touchRef.current = {
      startX: e.touches[0].clientX,
      startTime: Date.now(),
    };
    setIsDragging(true);
    setDragOffset(0);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchRef.current) return;
    const dx = e.touches[0].clientX - touchRef.current.startX;
    setDragOffset(dx);
  };

  const onTouchEnd = () => {
    if (!touchRef.current) return;
    const dx = dragOffset;
    const elapsed = Date.now() - touchRef.current.startTime;

    // Velocity-based: fast flick with small distance still triggers
    const velocity = Math.abs(dx) / Math.max(elapsed, 1);
    const triggered = Math.abs(dx) > 30 || velocity > 0.3;

    if (triggered) {
      if (dx < 0) goTo(current + 1);  // swipe left → next
      else goTo(current - 1);          // swipe right → prev
    }

    touchRef.current = null;
    setIsDragging(false);
    setDragOffset(0);
  };

  if (count === 0) return null;

  // Single banner — static
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

  // Compute translateX — includes live drag offset for instant feedback
  const baseTranslate = -(current * 100);
  const dragPercent = isDragging ? (dragOffset / (typeof window !== "undefined" ? window.innerWidth : 400)) * 100 : 0;

  return (
    <div
      className="relative rounded-2xl overflow-hidden shadow-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="aspect-[4/3] relative overflow-hidden">
        <div
          className={isDragging ? "flex h-full" : "flex h-full transition-transform duration-400 ease-out"}
          style={{ transform: `translateX(${baseTranslate + dragPercent}%)` }}
        >
          {banners.map((b) => (
            <div key={b.id} className="w-full h-full flex-shrink-0 relative">
              <img src={b.url} alt={b.label || "Banner"} className="w-full h-full object-contain bg-stone-50 dark:bg-stone-900" draggable={false} />
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
