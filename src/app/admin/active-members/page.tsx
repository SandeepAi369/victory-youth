import { getActiveMemberNames } from "../members/actions";
import ActiveMembersClient from "./client";

// Admin data is per-request (session cookie) — never pre-render this page at build time
export const dynamic = "force-dynamic";

export default async function ActiveMembersPage() {
  const members = await getActiveMemberNames();
  return <ActiveMembersClient initialData={members} />;
}
