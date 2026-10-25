/**
 * Association settings — admin server actions.
 * Every action requires a valid admin session (requireAdmin).
 */

"use server";
import { requireAdmin } from "@/lib/admin-session";

import { getDb, schema } from "@/db";
import type { NewAssociationSettingsRow } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { errorMessage } from "@/lib/utils";

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
