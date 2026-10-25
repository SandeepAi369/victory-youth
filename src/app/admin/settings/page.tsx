import { getAssociationSettings } from "@/lib/actions/admin";
import SettingsForm, { type SettingsFormValues } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const row = await getAssociationSettings();

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

  return <SettingsForm initial={initial} />;
}
