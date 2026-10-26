export const dynamic = "force-dynamic";

import { getContributors } from "@/lib/actions/contributors";
import ContributorsClient from "./client";

export default async function AdminContributorsPage() {
  const contributors = await getContributors();
  return (
    <div className="w-full">
      <ContributorsClient initialData={contributors} />
    </div>
  );
}
