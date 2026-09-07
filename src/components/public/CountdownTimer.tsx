"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  targetDate: string;
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const target = new Date(targetDate).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!mounted) return null;

  const boxes = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <div className="flex gap-3 justify-center">
      {boxes.map((box) => (
        <div
          key={box.label}
          className="flex flex-col items-center px-4 py-3 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 min-w-[70px]"
        >
          <span className="text-2xl md:text-4xl font-black text-white tabular-nums">
            {String(box.value).padStart(2, "0")}
          </span>
          <span className="text-[10px] md:text-xs text-white/70 font-medium uppercase tracking-wider mt-1">
            {box.label}
          </span>
        </div>
      ))}
    </div>
  );
}
