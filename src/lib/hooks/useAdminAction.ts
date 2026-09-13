"use client";

import { useTransition, useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * Universal Admin Action hook — provides:
 * 1. Optimistic state management (instant UI updates)
 * 2. Background server sync via useTransition
 * 3. YouTube-style top loading bar via window events
 * 4. Auto-revert on server failure
 * 5. Auto-sync with server truth via router.refresh()
 *
 * @param initialData - Data passed from Server Component (source of truth)
 * @returns [data, helpers] where helpers has all the action methods
 */
export function useAdminAction<T extends { id: string }>(initialData: T[]) {
  const router = useRouter();
  const [data, setData] = useState<T[]>(initialData);
  const [isPending, startTransition] = useTransition();

  // Sync local state when server re-renders with fresh data
  // (after router.refresh() completes, the Server Component re-fetches from DB
  //  and passes new initialData — this effect picks it up)
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

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
   *
   * @param optimisticUpdate - Function to apply to data IMMEDIATELY (before server responds)
   * @param serverAction - Async function that calls the actual server action
   * @param successMsg - Toast message on success
   * @param revertOnFail - If true, calls router.refresh() to revert to server state on failure
   */
  const execute = useCallback(
    (opts: {
      optimisticUpdate?: (prev: T[]) => T[];
      serverAction: () => Promise<{ success: boolean; error?: string } | undefined>;
      successMsg?: string;
      onSuccess?: () => void;
      revertOnFail?: boolean;
    }) => {
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
        } catch (err: any) {
          toast.error(err?.message || "Network error");
          router.refresh();
        }
      });
    },
    [router, startTransition]
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
