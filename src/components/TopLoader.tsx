"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

export function TopLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (pathname !== prevPath.current) {
      // Route changed — we were loading, now done
      setProgress(100);
      const t = setTimeout(() => { setLoading(false); setProgress(0); }, 300);
      prevPath.current = pathname;
      return () => clearTimeout(t);
    }
  }, [pathname]);

  useEffect(() => {
    // Intercept clicks on links to start the loader
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:")) return;
      if (href === pathname) return;
      setLoading(true);
      setProgress(20);
      // Simulate progress
      let p = 20;
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        p += Math.random() * 15;
        if (p > 90) p = 90;
        setProgress(p);
      }, 300);
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pathname]);

  if (!loading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px]">
      <div
        className="h-full bg-primary transition-all duration-300 ease-out shadow-[0_0_10px_var(--primary),0_0_5px_var(--primary)]"
        style={{ width: `${progress}%`, opacity: progress >= 100 ? 0 : 1 }}
      />
    </div>
  );
}
