export const dynamic = "force-dynamic";

import { getContributors } from "@/lib/actions/contributors";
import type { ContributionCategory } from "@/lib/contributions";
import ContributorsClient from "./client";

/** Chanda and Donations profiles are separate books, shown on separate tabs. */
export default async function AdminContributorsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const category: ContributionCategory = (await searchParams).tab === "donations" ? "DONATION" : "CHANDA";
  const contributors = await getContributors(category);
  return (
    <div className="w-full">
      <ContributorsClient key={category} category={category} initialData={contributors} />
    </div>
  );
}
