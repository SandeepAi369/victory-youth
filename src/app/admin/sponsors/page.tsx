export const dynamic = "force-dynamic";

import { getSponsors } from "./actions";
import SponsorsClient from "./client";

export default async function AdminSponsorsPage() {
  const sponsors = await getSponsors();
  return (
    <div className="w-full">
      <SponsorsClient initialData={sponsors} />
    </div>
  );
}
