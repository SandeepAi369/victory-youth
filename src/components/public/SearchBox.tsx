import Link from "next/link";
import { Search, X } from "lucide-react";

/**
 * Category search for public list pages. A plain GET form (`?q=`), so it works
 * without JavaScript and results can be shared as a link. Filtering happens in
 * the page's database query.
 */
export function SearchBox({
  query,
  placeholder,
  resultCount,
  basePath,
}: {
  query: string;
  placeholder: string;
  resultCount: number;
  basePath: string;
}) {
  return (
    <div className="mb-6">
      <form action={basePath} method="get" role="search" className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" aria-hidden />
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder={placeholder}
          aria-label={placeholder}
          maxLength={100}
          className="w-full pl-11 pr-24 py-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-400/60"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold"
        >
          Search
        </button>
      </form>
      {query && (
        <div className="mt-2 flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
          <span>
            {resultCount} result{resultCount === 1 ? "" : "s"} for <strong className="text-stone-700 dark:text-stone-200">&ldquo;{query}&rdquo;</strong>
          </span>
          <Link href={basePath} className="inline-flex items-center gap-1 text-orange-600 hover:underline">
            <X className="w-3 h-3" /> Clear
          </Link>
        </div>
      )}
    </div>
  );
}

/** Reads and normalises the `q` search parameter. */
export function searchQuery(params: { q?: string | string[] }): string {
  const raw = Array.isArray(params.q) ? params.q[0] : params.q;
  return (raw ?? "").trim().slice(0, 100);
}
