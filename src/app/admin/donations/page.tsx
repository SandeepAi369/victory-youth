export const dynamic = "force-dynamic";

import { getDonationEntries } from "./actions";
import { getContributors } from "@/lib/actions/contributors";
import DonationsClient from "./client";

export default async function AdminDonationsPage() {
  const [entries, contributors] = await Promise.all([getDonationEntries(), getContributors()]);
  return (
    <div className="w-full">
      <DonationsClient initialData={entries} contributors={contributors} />
    </div>
  );
}
