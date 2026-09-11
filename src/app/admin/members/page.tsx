export const dynamic = "force-dynamic";

import { getMembers } from "./actions";
import MembersClient from "./client";

export default async function AdminMembersPage() {
  const members = await getMembers();
  return (
    <div className="w-full">
      <MembersClient initialData={members} />
    </div>
  );
}
