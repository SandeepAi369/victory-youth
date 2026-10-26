export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getContributorProfile, getContributors } from "@/lib/actions/contributors";
import ProfileClient from "./client";

/** Full-page admin profile of ONE contributor: only their own entries, in their own category. */
export default async function AdminContributorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getContributorProfile(id);
  if (!data) notFound();
  // Same-category profiles, for moving an entry to another person in the Edit form
  const contributors = await getContributors(data.profile.category);
  const back = data.profile.category === "CHANDA" ? { href: "/admin/chanda", label: "Chanda" } : { href: "/admin/donations", label: "Donations" };
  return <ProfileClient key={id} profile={data.profile} initialEntries={data.entries} contributors={contributors} back={back} />;
}
