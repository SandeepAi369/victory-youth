"use server";

import { db } from "@/db";
import { events } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getEvents() {
  if (!db) return [];
  try {
    return await db.select().from(events).orderBy(events.day);
  } catch (error: any) { console.error("getEvents error:", error); return []; }
}

export async function addEvent(data: any) {
  if (!db) return { success: false, error: "DB not connected" };
  try {
    await db.insert(events).values({ id: `evt_${Date.now()}`, ...data });
    revalidatePath("/admin/events"); revalidatePath("/");
    return { success: true };
  } catch (error: any) { console.error("addEvent error:", error); return { success: false, error: error.message }; }
}

export async function updateEvent(id: string, data: any) {
  if (!db) return { success: false, error: "DB not connected" };
  try {
    await db.update(events).set(data).where(eq(events.id, id));
    revalidatePath("/admin/events"); revalidatePath("/");
    return { success: true };
  } catch (error: any) { console.error("updateEvent error:", error); return { success: false, error: error.message }; }
}

export async function togglePublishEvent(id: string, isPublished: boolean) {
  if (!db) return { success: false, error: "DB not connected" };
  try {
    await db.update(events).set({ isPublished }).where(eq(events.id, id));
    revalidatePath("/admin/events"); revalidatePath("/");
    return { success: true };
  } catch (error: any) { console.error("togglePublishEvent error:", error); return { success: false, error: error.message }; }
}

export async function bulkPublishEvents(ids: string[], isPublished: boolean) {
  if (!db || ids.length === 0) return { success: false, error: "No items" };
  try {
    await db.update(events).set({ isPublished }).where(inArray(events.id, ids));
    revalidatePath("/admin/events"); revalidatePath("/");
    return { success: true };
  } catch (error: any) { console.error("bulkPublishEvents error:", error); return { success: false, error: error.message }; }
}

export async function deleteEvent(id: string) {
  if (!db) return { success: false, error: "DB not connected" };
  try {
    await db.delete(events).where(eq(events.id, id));
    revalidatePath("/admin/events"); revalidatePath("/");
    return { success: true };
  } catch (error: any) { console.error("deleteEvent error:", error); return { success: false, error: error.message }; }
}
