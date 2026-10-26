export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getMemberProfile } from "../actions";
import MemberPageClient from "./client";

/** Full-page admin view of ONE member and their payments. */
export default async function AdminMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getMemberProfile(id);
  if (!data) notFound();
  return <MemberPageClient key={id} member={data.member} initialPayments={data.payments} />;
}
