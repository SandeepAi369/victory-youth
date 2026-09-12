export const dynamic = "force-dynamic";

import { getDonationEntries } from "./actions";
import DonationsClient from "./client";

export default async function AdminDonationsPage() {
  const entries = await getDonationEntries();
  return (
    <div className="w-full">
      <DonationsClient initialData={entries} />
    </div>
  );
}
