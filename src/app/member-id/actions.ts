"use server";

import { getDb, schema } from "@/db";
import { and, eq, or, sql } from "drizzle-orm";
import { getAssociationSettings } from "@/lib/queries/public";
import { toAssociationSettings } from "@/lib/settings-view";
import type { AssociationSettings, Member } from "@/types";

function lastTenDigits(value: string) {
  return value.replace(/\D/g, "").slice(-10);
}

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 4 ? `******${digits.slice(-4)}` : "";
}

/**
 * Public member-ID lookup. Matches an ACTIVE member exactly by member ID
 * (case-insensitive) or by phone number (last 10 digits). The phone is only
 * shown in full when the visitor searched by that phone number.
 */
export async function findMemberCard(
  query: string
): Promise<{ member: Member; settings: AssociationSettings } | null> {
  const q = query.trim();
  if (!q) return null;

  const digits = lastTenDigits(q);
  const phoneMatch = digits.length === 10
    ? [
        sql`substr(replace(replace(replace(${schema.members.phone}, ' ', ''), '-', ''), '+', ''), -10) = ${digits}`,
        sql`substr(replace(replace(replace(coalesce(${schema.members.mobile}, ''), ' ', ''), '-', ''), '+', ''), -10) = ${digits}`,
      ]
    : [];

  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(schema.members)
      .where(
        and(
          eq(schema.members.isActive, true),
          or(sql`lower(${schema.members.memberId}) = ${q.toLowerCase()}`, ...phoneMatch)
        )
      )
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    const searchedByPhone = digits.length === 10 && lastTenDigits(row.mobile || row.phone) === digits;
    const phone = searchedByPhone ? row.mobile || row.phone : maskPhone(row.mobile || row.phone);

    const member: Member = {
      id: row.id,
      memberId: row.memberId,
      name: row.name,
      fullName: row.fullName ?? undefined,
      fatherName: row.fatherName ?? undefined,
      phone,
      mobile: phone,
      gotram: row.gotram ?? undefined,
      role: row.committeeRole || row.role || "MEMBER",
      photoUrl: row.photoUrl ?? undefined,
    };

    return { member, settings: toAssociationSettings(await getAssociationSettings()) };
  } catch (error) {
    console.error("findMemberCard error:", error);
    return null;
  }
}
