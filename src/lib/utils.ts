import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in Indian format (lakhs, crores)
 */
export function formatCurrency(amount: number, showSymbol: boolean = true): string {
  const formatter = new Intl.NumberFormat("en-IN", {
    style: showSymbol ? "currency" : "decimal",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(amount);
}

/**
 * Format date in Indian format
 */
export function formatDate(date: string | Date, format: "short" | "long" = "short"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const options: Intl.DateTimeFormatOptions = 
    format === "long" 
      ? { weekday: "long", year: "numeric", month: "long", day: "numeric" }
      : { year: "numeric", month: "short", day: "numeric" };
  return d.toLocaleDateString("en-IN", options);
}

/**
 * Format time in 12-hour format
 */
export function formatTime(time: string): string {
  // Convert 24-hour to 12-hour format if needed
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

/**
 * Generate a unique ID with prefix
 */
export function generateId(prefix: string = "id"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Truncate text with ellipsis
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

/**
 * Delay helper for async operations
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

/**
 * Get initials from name
 */
export function getInitials(name: string, maxLength: number = 2): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, maxLength);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Safe parse JSON
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

export function numberToIndianWords(num: number): string {
  if (num === 0) return 'Zero';
  
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (num < 20) return a[num];
  if (num < 100) return b[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + a[num % 10] : '');
  if (num < 1000) return a[Math.floor(num / 100)] + 'Hundred' + (num % 100 !== 0 ? ' and ' + numberToIndianWords(num % 100) : '');
  if (num < 100000) return numberToIndianWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + numberToIndianWords(num % 1000) : '');
  if (num < 10000000) return numberToIndianWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 !== 0 ? ' ' + numberToIndianWords(num % 100000) : '');
  
  return numberToIndianWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 !== 0 ? ' ' + numberToIndianWords(num % 10000000) : '');
}

/** Readable message from anything thrown (catch clauses receive `unknown`). */
export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return typeof error === "string" ? error : "An unexpected error occurred";
}
