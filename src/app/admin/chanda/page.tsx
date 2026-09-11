export const dynamic = "force-dynamic";

import { getChandaEntries } from "./actions";
import ChandaClient from "./client";

export default async function AdminChandaPage() {
  const entries = await getChandaEntries();
  return (
    <div className="w-full">
      <ChandaClient initialData={entries} />
    </div>
  );
}
