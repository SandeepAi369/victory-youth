import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { getPublishedContributors } from "@/lib/queries/public";

type Person = Awaited<ReturnType<typeof getPublishedContributors>>[number];

const inr = (n: number) => "₹" + Math.round(Number(n) || 0).toLocaleString("en-IN");

/**
 * One person on a public money list: name (with an arrow → their profile),
 * how many times they contributed, and their total. The itemized history is
 * only shown on the profile page.
 */
export function PersonRow({ person, noun, tone }: { person: Person; noun: string; tone: "amber" | "orange" }) {
  const count = Number(person.count);
  const avatar = tone === "amber" ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" : "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400";
  const border = tone === "amber" ? "border-amber-100" : "border-orange-100";
  const body = (
    <>
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${avatar}`}>{person.name?.[0] || "?"}</div>
        <div className="min-w-0">
          <p className="font-bold text-stone-900 dark:text-white flex items-center gap-0.5">
            <span className="truncate">{person.name}</span>
            {person.contributorId && <ChevronRight className="w-4 h-4 shrink-0 text-orange-500 transition-transform group-hover:translate-x-0.5" aria-hidden />}
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {count} {noun}{count === 1 ? "" : "s"}{person.lastDate ? ` · last ${person.lastDate}` : ""}
          </p>
        </div>
      </div>
      <span className="font-black text-emerald-600 dark:text-emerald-400 shrink-0">{inr(person.total)}</span>
    </>
  );
  const card = `group flex items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-stone-800 border ${border} dark:border-stone-700 shadow-sm`;
  return person.contributorId ? (
    <Link href={`/contributor/${person.contributorId}`} aria-label={`${person.name} — view contribution history`}
      className={`${card} hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-md transition-all`}>
      {body}
    </Link>
  ) : (
    <div className={card}>{body}</div>
  );
}
