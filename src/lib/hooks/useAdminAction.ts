"use client";

import { useTransition, useEffect, useCallback, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * Universal Admin Action hook — provides:
 * 1. Optimistic state management (instant UI updates)
 * 2. Background server sync via useTransition
 * 3. YouTube-style top loading bar via window events
 * 4. Auto-revert on server failure
 * 5. Auto-sync with server truth via router.refresh()
 * 6. Click debounce — prevents rapid-fire accidental clicks (300ms)
 */
export function useAdminAction<T extends { id: string }>(initialData: T[]) {
  const router = useRouter();
  const [data, setData] = useState<T[]>(initialData);
  const [isPending, startTransition] = useTransition();
  const lastClickRef = useRef<number>(0);

  // Sync local state when the server re-renders with fresh data
  // (adjusting state during render, as React recommends, instead of in an effect)
  const [serverData, setServerData] = useState<T[]>(initialData);
  if (serverData !== initialData) {
    setServerData(initialData);
    setData(initialData);
  }

  // Fire YouTube-style top loading bar
  useEffect(() => {
    if (isPending) {
      window.dispatchEvent(new Event("admin-loading-start"));
    } else {
      window.dispatchEvent(new Event("admin-loading-end"));
    }
  }, [isPending]);

  /**
   * Execute a server action with optimistic UI update.
   * Includes a 300ms debounce to prevent accidental rapid clicks.
   */
  const execute = useCallback(
    (opts: {
      optimisticUpdate?: (prev: T[]) => T[];
      serverAction: () => Promise<{ success: boolean; error?: string } | undefined>;
      successMsg?: string;
      onSuccess?: () => void;
      revertOnFail?: boolean;
    }) => {
      // Debounce: ignore clicks within 300ms of last click
      const now = Date.now();
      if (now - lastClickRef.current < 300) return;
      lastClickRef.current = now;

      // Also skip if already processing
      if (isPending) return;

      // 1. Apply optimistic update INSTANTLY (0ms)
      if (opts.optimisticUpdate) {
        setData(opts.optimisticUpdate);
      }

      // 2. Run server action in background (non-blocking)
      startTransition(async () => {
        try {
          const result = await opts.serverAction();
          if (result?.success) {
            if (opts.successMsg) toast.success(opts.successMsg);
            if (opts.onSuccess) opts.onSuccess();
            // 3. Sync with server truth
            router.refresh();
          } else {
            // 4. Revert optimistic state on failure
            toast.error(result?.error || "Operation failed");
            if (opts.revertOnFail !== false) {
              router.refresh();
            }
          }
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Network error");
          router.refresh();
        }
      });
    },
    [router, startTransition, isPending]
  );

  return {
    data,
    setData,
    isPending,
    startTransition,
    execute,
    router,
  };
}
