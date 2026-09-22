"use client";

import { useState, useEffect, useRef } from "react";

interface Banner {
  id: string;
  url: string;
  label?: string | null;
}

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const count = banners.length;

  // For infinite loop: [lastClone, ...banners, firstClone]
  // Index 0 = clone of last, index count+1 = clone of first
  // Real slides are at indices 1..count
  const [pos, setPos] = useState(1); // start at real first
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const startX = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);

  // After a transition to a clone ends, silently jump to the real slide
  useEffect(() => {
    if (animate) return; // only act when we just disabled animation
    // Re-enable animation on next frame
    const raf = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(raf);
  }, [animate]);

  const handleTransitionEnd = () => {
    if (pos === 0) {
      // Landed on lastClone → jump to real last (index = count)
      setAnimate(false);
      setPos(count);
    } else if (pos === count + 1) {
      // Landed on firstClone → jump to real first (index = 1)
      setAnimate(false);
      setPos(1);
    }
  };

  // Auto-scroll forward every 4s — pauses when tab is hidden
  useEffect(() => {
    if (count <= 1 || paused) return;
    let timer: ReturnType<typeof setInterval> | null = null;

    const startTimer = () => {
      if (timer) clearInterval(timer);
      timer = setInterval(() => {
        setPos((prev) => prev + 1);
      }, 4000);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        if (timer) { clearInterval(timer); timer = null; }
      } else {
        setAnimate(true);
        startTimer();
      }
    };

    startTimer();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      if (timer) clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [count, paused]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setPaused(true);
    startX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = startX.current - e.changedTouches[0].clientX;
    if (diff > 40) setPos((p) => p + 1);       // swipe left → next
    else if (diff < -40) setPos((p) => p - 1);  // swipe right → prev
    setPaused(false);
  };

  // Which real banner index is active (for dots)
  const realIndex = pos <= 0 ? count - 1 : pos > count ? 0 : pos - 1;

  if (count === 0) return null;

  // Single banner — no carousel needed
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

  // Build slides: [lastClone, ...real, firstClone]
  const slides = [
    banners[count - 1], // clone of last
    ...banners,         // real slides
    banners[0],         // clone of first
  ];

  return (
    <div
      className="relative rounded-2xl overflow-hidden shadow-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="aspect-[4/3] relative overflow-hidden">
        <div
          ref={trackRef}
          className={"flex h-full" + (animate ? " transition-transform duration-500 ease-in-out" : "")}
          style={{ transform: `translateX(-${pos * 100}%)` }}
          onTransitionEnd={handleTransitionEnd}
        >
          {slides.map((b, i) => (
            <div key={`slide-${i}`} className="w-full h-full flex-shrink-0 relative">
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

      {/* Dot indicators — mapped to real index */}
      <div className="absolute bottom-3 right-3 flex gap-1.5">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => { setAnimate(true); setPos(i + 1); }}
            className={"w-2 h-2 rounded-full transition-all duration-300 " +
              (i === realIndex
                ? "bg-white w-5 shadow-md"
                : "bg-white/50 hover:bg-white/70")}
            aria-label={`Banner ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
