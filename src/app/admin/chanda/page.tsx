export const dynamic = "force-dynamic";

import { getChandaEntries } from "./actions";
import { getContributors } from "@/lib/actions/contributors";
import ChandaClient from "./client";

export default async function AdminChandaPage() {
  const [entries, contributors] = await Promise.all([getChandaEntries(), getContributors("CHANDA")]);
  return (
    <div className="w-full">
      <ChandaClient initialData={entries} contributors={contributors} />
    </div>
  );
}
