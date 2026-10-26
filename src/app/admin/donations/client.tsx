"use client";

import { deleteDonation, toggleDonationPublish, setAllDonationsVisibility } from "./actions";
import { ContributionsAdmin, type ContributionEntry } from "@/components/admin/ContributionsAdmin";
import type { ContributorOption } from "@/components/admin/ContributionForm";

export default function DonationsClient({ initialData, contributors }: { initialData: ContributionEntry[]; contributors: ContributorOption[] }) {
  return (
    <ContributionsAdmin
      title="Donations" subtitle="Donation Collections" noun="Donation"
      category="DONATION"
      initialData={initialData} contributors={contributors}
      actions={{ remove: deleteDonation, togglePublish: toggleDonationPublish, setAllVisibility: setAllDonationsVisibility }}
    />
  );
}
