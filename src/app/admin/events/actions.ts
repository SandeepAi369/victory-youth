"use server";

import { requireAdmin } from "@/lib/admin-session";
import { getDb } from "@/db";
import { events } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

function revalidate() {
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/schedule");
  revalidatePath("/");
}

export async function getEvents() {
  await requireAdmin();
  try {
    const db = getDb();
    return await db.select({ id: events.id, day: events.day, title: events.title, description: events.description, date: events.date, timing: events.timing, location: events.location, inCharge: events.inCharge, isPublished: events.isPublished }).from(events).orderBy(events.day);
  } catch (error: any) {
    console.error("getEvents error:", error);
    return [];
  }
}

export async function addEvent(data: any) {
  await requireAdmin();
  try {
    const db = getDb();
    await db.insert(events).values({ id: `evt_${randomUUID()}`, ...data });
    revalidate();
    return { success: true };
  } catch (error: any) {
    console.error("addEvent error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateEvent(id: string, data: any) {
  await requireAdmin();
  try {
    const db = getDb();
    await db.update(events).set(data).where(eq(events.id, id));
    revalidate();
    return { success: true };
  } catch (error: any) {
    console.error("updateEvent error:", error);
    return { success: false, error: error.message };
  }
}

export async function togglePublishEvent(id: string, isPublished: boolean) {
  await requireAdmin();
  try {
    const db = getDb();
    await db.update(events).set({ isPublished }).where(eq(events.id, id));
    revalidate();
    return { success: true };
  } catch (error: any) {
    console.error("togglePublishEvent error:", error);
    return { success: false, error: error.message };
  }
}

export async function bulkPublishEvents(ids: string[], isPublished: boolean) {
  await requireAdmin();
  if (ids.length === 0) return { success: false, error: "No items" };
  try {
    const db = getDb();
    await db.update(events).set({ isPublished }).where(inArray(events.id, ids));
    revalidate();
    return { success: true };
  } catch (error: any) {
    console.error("bulkPublishEvents error:", error);
    return { success: false, error: error.message };
  }
}

/** Master toggle: publish or unpublish ALL events at once */
export async function setAllEventsVisibility(
  publish: boolean
): Promise<{ success: boolean; newState: boolean; error?: string }> {
  await requireAdmin();
  try {
    const db = getDb();
    await db.update(events).set({ isPublished: publish });
    revalidate();
    return { success: true, newState: publish };
  } catch (error: any) {
    console.error("setAllEventsVisibility error:", error);
    return { success: false, newState: !publish, error: error.message };
  }
}

export async function deleteEvent(id: string) {
  await requireAdmin();
  try {
    const db = getDb();
    await db.delete(events).where(eq(events.id, id));
    revalidate();
    return { success: true };
  } catch (error: any) {
    console.error("deleteEvent error:", error);
    return { success: false, error: error.message };
  }
}
