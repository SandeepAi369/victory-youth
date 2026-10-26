"use client";

import { deleteChanda, toggleChandaPublish, setAllChandaVisibility } from "./actions";
import { ContributionsAdmin, type ContributionEntry } from "@/components/admin/ContributionsAdmin";
import type { ContributorOption } from "@/components/admin/ContributionForm";

export default function ChandaClient({ initialData, contributors }: { initialData: ContributionEntry[]; contributors: ContributorOption[] }) {
  return (
    <ContributionsAdmin
      title="Chanda (Donations)" subtitle="Chanda Collections" noun="Chanda"
      category="CHANDA"
      initialData={initialData} contributors={contributors}
      actions={{ remove: deleteChanda, togglePublish: toggleChandaPublish, setAllVisibility: setAllChandaVisibility }}
    />
  );
}
