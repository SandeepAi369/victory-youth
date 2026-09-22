"use client";

import { useState, useEffect, useRef } from "react";

interface HeroImage {
  id: string;
  url: string;
}

export function HeroCarousel({
  images,
  fallbackUrl,
  fallbackAlt,
}: {
  images: HeroImage[];
  fallbackUrl: string | null;
  fallbackAlt: string;
}) {
  const count = images.length;

  // If no carousel images, show fallback
  if (count === 0) {
    return (
      <section>
        <div className="w-full bg-stone-950">
          <img
            src={fallbackUrl || "/hero-banner.jpg"}
            alt={fallbackAlt}
            className="w-full h-auto"
            fetchPriority="high"
            loading="eager"
            decoding="async"
          />
        </div>
      </section>
    );
  }

  // Single image — no carousel needed
  if (count === 1) {
    return (
      <section>
        <div className="w-full bg-stone-950">
          <img
            src={images[0].url}
            alt={fallbackAlt}
            className="w-full h-auto"
            fetchPriority="high"
            loading="eager"
            decoding="async"
          />
        </div>
      </section>
    );
  }

  // Multiple images — carousel with infinite loop
  return <HeroCarouselInner images={images} alt={fallbackAlt} />;
}

function HeroCarouselInner({ images, alt }: { images: HeroImage[]; alt: string }) {
  const count = images.length;
  const [pos, setPos] = useState(1);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const startX = useRef(0);

  // After disabling animation for clone jump, re-enable on next frame
  useEffect(() => {
    if (animate) return;
    const raf = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(raf);
  }, [animate]);

  const handleTransitionEnd = () => {
    if (pos === 0) {
      setAnimate(false);
      setPos(count);
    } else if (pos === count + 1) {
      setAnimate(false);
      setPos(1);
    }
  };

  // Auto-scroll every 3 seconds — pauses when tab is hidden
  useEffect(() => {
    if (paused) return;
    let timer: ReturnType<typeof setInterval> | null = null;

    const startTimer = () => {
      if (timer) clearInterval(timer);
      timer = setInterval(() => {
        setPos((prev) => prev + 1);
      }, 3000);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        if (timer) { clearInterval(timer); timer = null; }
      } else {
        // Reset position cleanly on return
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
  }, [paused, count]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setPaused(true);
    startX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = startX.current - e.changedTouches[0].clientX;
    if (diff > 40) setPos((p) => p + 1);
    else if (diff < -40) setPos((p) => p - 1);
    setPaused(false);
  };

  const goLeft = () => { setPaused(true); setPos((p) => p - 1); setTimeout(() => setPaused(false), 5000); };
  const goRight = () => { setPaused(true); setPos((p) => p + 1); setTimeout(() => setPaused(false), 5000); };

  const realIndex = pos <= 0 ? count - 1 : pos > count ? 0 : pos - 1;

  // Build slides: [lastClone, ...real, firstClone]
  const slides = [
    images[count - 1],
    ...images,
    images[0],
  ];

  return (
    <section>
      <div
        className="relative w-full bg-stone-950 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Track */}
        <div
          className={"flex" + (animate ? " transition-transform duration-700 ease-in-out" : "")}
          style={{ transform: `translateX(-${pos * 100}%)` }}
          onTransitionEnd={handleTransitionEnd}
        >
          {slides.map((img, i) => (
            <div key={`hero-${i}`} className="w-full flex-shrink-0">
              <img
                src={img.url}
                alt={alt}
                className="w-full h-auto"
                draggable={false}
                {...(i === 1 ? { fetchPriority: "high", loading: "eager", decoding: "async" } : { loading: "lazy" })}
              />
            </div>
          ))}
        </div>

        {/* Left Arrow */}
        <button
          onClick={goLeft}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white flex items-center justify-center transition-colors z-10"
          aria-label="Previous image"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Right Arrow */}
        <button
          onClick={goRight}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white flex items-center justify-center transition-colors z-10"
          aria-label="Next image"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => { setAnimate(true); setPos(i + 1); }}
              className={"w-2 h-2 rounded-full transition-all duration-300 " +
                (i === realIndex
                  ? "bg-white w-5 shadow-md"
                  : "bg-white/50 hover:bg-white/70")}
              aria-label={`Image ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
