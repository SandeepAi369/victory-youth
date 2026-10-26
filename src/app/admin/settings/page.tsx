import { getAssociationSettings, getYearsWithData } from "@/lib/actions/admin";
import SettingsForm, { type SettingsFormValues } from "./client";
import YearVisibility from "./year-visibility";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [row, years] = await Promise.all([getAssociationSettings(), getYearsWithData()]);

  const initial: SettingsFormValues = {
    associationName: row?.associationName ?? "",
    shortName: row?.shortName ?? "",
    registrationNo: row?.registrationNo ?? "",
    tax80GNo: row?.tax80GNo ?? "",
    upiVpa: row?.upiVpa ?? "",
    upiName: row?.upiName ?? "",
    bankName: row?.bankName ?? "",
    bankAccountNo: row?.bankAccountNo ?? "",
    bankIfsc: row?.bankIfsc ?? "",
    bankBranch: row?.bankBranch ?? "",
    contactPhone: row?.contactPhone ?? "",
    contactEmail: row?.contactEmail ?? "",
  };

  const publicYears = Array.isArray(row?.publicYears) && row.publicYears.length > 0 ? row.publicYears : null;

  return (
    <div className="space-y-6">
      <SettingsForm initial={initial} />
      <YearVisibility years={years} initial={publicYears} />
    </div>
  );
}
