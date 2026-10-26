import Link from "next/link";

/**
 * A contributor's public name, linking to their contribution history.
 * Entries without a contributor profile (very old data) are plain text.
 */
export function DonorName({ name, contributorId }: { name: string; contributorId: string | null }) {
  if (!contributorId) return <p className="font-bold text-stone-900 dark:text-white">{name}</p>;
  return (
    <Link href={`/contributor/${contributorId}`} className="font-bold text-stone-900 dark:text-white underline decoration-dotted decoration-orange-400 underline-offset-4 hover:text-orange-600 dark:hover:text-orange-400">
      {name}
    </Link>
  );
}
