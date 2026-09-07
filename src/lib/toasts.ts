import { toast as sonnerToast } from "sonner";

/**
 * Toast helper functions for consistent notifications across the app
 */

type ToastType = "success" | "error" | "warning" | "info" | "default";

interface ToastOptions {
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

/**
 * Show a success toast
 */
export function toastSuccess(title: string, options?: ToastOptions) {
  return sonnerToast.success(title, {
    description: options?.description,
    action: options?.action,
    duration: options?.duration ?? 4000,
  });
}

/**
 * Show an error toast
 */
export function toastError(title: string, options?: ToastOptions) {
  return sonnerToast.error(title, {
    description: options?.description,
    action: options?.action,
    duration: options?.duration ?? 5000,
  });
}

/**
 * Show a warning toast
 */
export function toastWarning(title: string, options?: ToastOptions) {
  return sonnerToast.warning(title, {
    description: options?.description,
    action: options?.action,
    duration: options?.duration ?? 4500,
  });
}

/**
 * Show an info toast
 */
export function toastInfo(title: string, options?: ToastOptions) {
  return sonnerToast.info(title, {
    description: options?.description,
    action: options?.action,
    duration: options?.duration ?? 4000,
  });
}

/**
 * Show a default toast
 */
export function toast(title: string, options?: ToastOptions) {
  return sonnerToast(title, {
    description: options?.description,
    action: options?.action,
    duration: options?.duration ?? 4000,
  });
}

/**
 * Show a loading toast (returns id to update later)
 */
export function toastLoading(title: string, options?: ToastOptions) {
  return sonnerToast.loading(title, {
    description: options?.description,
    duration: Infinity,
  });
}

/**
 * Update a loading toast to success
 */
export function toastSuccessFromLoading(
  id: string | number,
  title: string,
  options?: ToastOptions
) {
  sonnerToast.success(title, {
    id,
    description: options?.description,
    duration: options?.duration ?? 4000,
  });
}

/**
 * Update a loading toast to error
 */
export function toastErrorFromLoading(
  id: string | number,
  title: string,
  options?: ToastOptions
) {
  sonnerToast.error(title, {
    id,
    description: options?.description,
    duration: options?.duration ?? 5000,
  });
}

/**
 * Dismiss a specific toast
 */
export function toastDismiss(id: string | number) {
  sonnerToast.dismiss(id);
}

/**
 * Dismiss all toasts
 */
export function toastDismissAll() {
  sonnerToast.dismiss();
}

/**
 * Promise toast - shows loading, then success/error based on promise
 */
export function toastPromise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  }
) {
  return sonnerToast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
  });
}

// Export the original sonner toast for advanced usage
export { sonnerToast };
