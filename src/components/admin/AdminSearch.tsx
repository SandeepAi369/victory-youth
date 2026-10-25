"use client";

import { Search, X } from "lucide-react";

/** Instant search box for an admin list (filters the rows already on the page). */
export function AdminSearch({
  value,
  onChange,
  placeholder,
  shown,
  total,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  shown: number;
  total: number;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" aria-hidden />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="w-full bg-background border rounded-xl pl-10 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 [&::-webkit-search-cancel-button]:appearance-none"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:bg-muted"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {value && (
        <p className="text-xs text-muted-foreground">
          Showing {shown} of {total}
        </p>
      )}
    </div>
  );
}

/** Rows whose given fields contain the query (case-insensitive). */
export function filterRows<T>(rows: T[], query: string, fields: (row: T) => unknown[]): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter((row) => fields(row).some((v) => v != null && String(v).toLowerCase().includes(q)));
}
