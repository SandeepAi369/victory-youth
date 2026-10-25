import type { AssociationSettingsRow } from "@/db/schema";
import type { AssociationSettings } from "@/types";

/**
 * Maps the association_settings row (Turso) to the AssociationSettings shape
 * used by pages and PDF generators. Missing values stay empty — never fill
 * payment, tax or contact details with placeholders.
 */
export function toAssociationSettings(row: AssociationSettingsRow | null): AssociationSettings {
  return {
    associationName: row?.associationName || "Victory Youth Association",
    shortName: row?.shortName || "Victory Youth",
    registrationNo: row?.registrationNo ?? "",
    establishedYear: row?.establishedYear ?? undefined,
    address: row?.address ?? "",
    presidentName: row?.presidentName ?? "",
    secretaryName: row?.secretaryName ?? "",
    treasurerName: row?.treasurerName ?? "",
    contactPhone: row?.contactPhone ?? "",
    contactEmail: row?.contactEmail ?? "",
    upiVpa: row?.upiVpa ?? "",
    upiName: row?.upiName ?? "",
    bankName: row?.bankName ?? "",
    bankAccountNo: row?.bankAccountNo ?? "",
    bankIfsc: row?.bankIfsc ?? "",
    bankBranch: row?.bankBranch ?? "",
    tax80GNo: row?.tax80GNo ?? "",
    goldenJubileeTarget: row?.goldenJubileeTarget ?? 0,
    donationTarget: row?.donationTarget ?? undefined,
    chaturthiDate: row?.chaturthiDate ?? undefined,
  };
}
