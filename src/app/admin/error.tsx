"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("🔴 ADMIN ERROR:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-stone-950 p-4">
      <div className="max-w-md bg-white dark:bg-stone-900 p-8 rounded-2xl shadow-xl border border-red-200 dark:border-red-800 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Something went wrong!</h2>
        <p className="text-stone-600 dark:text-stone-400 mb-4 text-sm">
          {error.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
