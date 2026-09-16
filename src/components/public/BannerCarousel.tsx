"use client";

import { useState, useEffect, useRef } from "react";

interface Banner {
  id: string;
  url: string;
  label?: string | null;
}

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const startX = useRef(0);
  const count = banners.length;

  // Auto-scroll forward every 4s — pauses when user is touching
  useEffect(() => {
    if (count <= 1 || paused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % count);
    }, 4000);
    return () => clearInterval(timer);
  }, [count, paused]);

  // Touch start — pause auto-scroll, record position
  const handleTouchStart = (e: React.TouchEvent) => {
    setPaused(true);
    startX.current = e.touches[0].clientX;
  };

  // Touch end — detect swipe direction, resume auto-scroll
  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const diff = startX.current - endX;

    if (diff > 40) {
      // Swiped left → next
      setCurrent((prev) => (prev + 1) % count);
    } else if (diff < -40) {
      // Swiped right → prev
      setCurrent((prev) => (prev - 1 + count) % count);
    }

    // Resume auto-scroll after releasing
    setPaused(false);
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

  return (
    <div
      className="relative rounded-2xl overflow-hidden shadow-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="aspect-[4/3] relative overflow-hidden">
        <div
          className="flex h-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
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
            onClick={() => setCurrent(i)}
            className={"w-2 h-2 rounded-full transition-all duration-300 " +
              (i === current
                ? "bg-white w-5 shadow-md"
                : "bg-white/50 hover:bg-white/70")}
            aria-label={`Banner ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
