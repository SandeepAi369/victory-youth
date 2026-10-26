export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getMember } from "../actions";
import MemberPageClient from "./client";

/** Full-page admin view of ONE member. */
export default async function AdminMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await getMember(id);
  if (!member) notFound();
  return <MemberPageClient key={id} member={member} />;
}
