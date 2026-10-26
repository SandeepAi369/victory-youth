/**
 * Association settings — admin server actions.
 * Every action requires a valid admin session (requireAdmin).
 */

"use server";
import { requireAdmin } from "@/lib/admin-session";

import { getDb, schema } from "@/db";
import type { NewAssociationSettingsRow } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { errorMessage } from "@/lib/utils";
import { currentYearIST } from "@/lib/contributions";

function handleError(operation: string, error: unknown): { success: false; error: string } {
  console.error(`Error ${operation}:`, error);
  return { success: false, error: errorMessage(error) };
}

// ============================================
// ASSOCIATION SETTINGS
// ============================================

export async function getAssociationSettings() {
  await requireAdmin();
  const db = getDb();
  try {
    const settings = await db
      .select()
      .from(schema.associationSettings)
      .limit(1);
    return settings[0] || null;
  } catch (error) {
    console.error("Error fetching settings:", error);
    return null;
  }
}

export async function updateAssociationSettings(data: Partial<NewAssociationSettingsRow>) {
  await requireAdmin();
  const db = getDb();
  try {
    const existing = await getAssociationSettings();
    
    if (existing) {
      await db
        .update(schema.associationSettings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(schema.associationSettings.id, "settings"));
    } else {
      await db.insert(schema.associationSettings).values({
        id: "settings",
        ...data,
      });
    }
    
    revalidatePath("/admin/settings");
    revalidatePath("/");        // Bug #7: public homepage must update when settings change
    revalidatePath("/donations"); // UPI/bank details shown on donations page
    return { success: true };
  } catch (error) {
    return handleError("updating settings", error);
  }
}

// ============================================
// YEAR-WISE PUBLIC VISIBILITY
// ============================================

/** Years that have contributions or events, plus the current year, newest first. */
export async function getYearsWithData(): Promise<number[]> {
  await requireAdmin();
  const years = new Set([currentYearIST()]);
  try {
    const rows = await getDb().all<{ year: number | null }>(sql`
      SELECT DISTINCT cast(substr(coalesce(date, date(created_at, 'unixepoch')), 1, 4) as integer) AS year FROM donations
      UNION SELECT DISTINCT cast(substr(date, 1, 4) as integer) FROM events`);
    for (const { year } of rows) if (year && year >= 1900 && year <= 9999) years.add(Number(year));
  } catch (error) {
    console.error("Error reading years:", error);
  }
  return [...years].sort((a, b) => b - a);
}

/** Years shown on the public site: a non-empty list of years, or "ALL". */
export async function setPublicYears(years: number[] | "ALL") {
  await requireAdmin();
  const clean = years === "ALL" ? "ALL" : [...new Set(years.map(Number))].filter((y) => Number.isInteger(y) && y >= 1900 && y <= 9999).sort();
  if (clean !== "ALL" && clean.length === 0) return { success: false as const, error: "Select at least one year, or All Years" };
  const result = await updateAssociationSettings({ publicYears: clean });
  if (result.success) for (const path of ["/chanda", "/donations", "/events"]) revalidatePath(path);
  return result;
}
