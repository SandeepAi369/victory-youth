"use server";
import { getDb, schema } from "@/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { after } from "next/server";

function revalidate() {
  after(() => { revalidatePath("/"); revalidatePath("/admin/sponsors"); revalidatePath("/sponsorship"); });
}

export async function getSponsors() {
  try {
    const db = getDb();
    return await db.select().from(schema.sponsors).orderBy(schema.sponsors.displayOrder);
  } catch (error: any) { console.error("getSponsors error:", error); return []; }
}

export async function addSponsor(data: any) {
  try {
    const db = getDb();
    await db.insert(schema.sponsors).values({ id: `spon_${Date.now()}`, ...data });
    revalidate();
    return { success: true };
  } catch (error: any) { console.error("addSponsor error:", error); return { success: false, error: error.message }; }
}

export async function updateSponsor(id: string, data: any) {
  try {
    const db = getDb();
    await db.update(schema.sponsors).set(data).where(eq(schema.sponsors.id, id));
    revalidate();
    return { success: true };
  } catch (error: any) { console.error("updateSponsor error:", error); return { success: false, error: error.message }; }
}

export async function deleteSponsor(id: string) {
  try {
    const db = getDb();
    await db.delete(schema.sponsors).where(eq(schema.sponsors.id, id));
    revalidate();
    return { success: true };
  } catch (error: any) { console.error("deleteSponsor error:", error); return { success: false, error: error.message }; }
}

export async function toggleSponsorPublish(id: string, publish: boolean) {
  try {
    const db = getDb();
    await db.update(schema.sponsors).set({ isPublished: publish }).where(eq(schema.sponsors.id, id));
    revalidate();
    return { success: true };
  } catch (error: any) { console.error("toggleSponsorPublish error:", error); return { success: false, error: error.message }; }
}
