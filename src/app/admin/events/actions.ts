"use server";
import { errorMessage } from "@/lib/utils";

import { requireAdmin } from "@/lib/admin-session";
import { getDb } from "@/db";
import { events, type NewEventRow } from "@/db/schema";
import { eq } from "drizzle-orm";
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
    return await db.select({ id: events.id, day: events.day, title: events.title, description: events.description, date: events.date, timing: events.timing, location: events.location, inCharge: events.inCharge, imageUrl: events.imageUrl, isPublished: events.isPublished }).from(events).orderBy(events.day);
  } catch (error) {
    console.error("getEvents error:", error);
    return [];
  }
}

export async function addEvent(data: Omit<NewEventRow, "id">) {
  await requireAdmin();
  try {
    const db = getDb();
    await db.insert(events).values({ id: `evt_${randomUUID()}`, ...data });
    revalidate();
    return { success: true };
  } catch (error) {
    console.error("addEvent error:", error);
    return { success: false, error: errorMessage(error) };
  }
}

export async function updateEvent(id: string, data: Partial<NewEventRow>) {
  await requireAdmin();
  try {
    const db = getDb();
    await db.update(events).set(data).where(eq(events.id, id));
    revalidate();
    return { success: true };
  } catch (error) {
    console.error("updateEvent error:", error);
    return { success: false, error: errorMessage(error) };
  }
}

export async function togglePublishEvent(id: string, isPublished: boolean) {
  await requireAdmin();
  try {
    const db = getDb();
    await db.update(events).set({ isPublished }).where(eq(events.id, id));
    revalidate();
    return { success: true };
  } catch (error) {
    console.error("togglePublishEvent error:", error);
    return { success: false, error: errorMessage(error) };
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
  } catch (error) {
    console.error("setAllEventsVisibility error:", error);
    return { success: false, newState: !publish, error: errorMessage(error) };
  }
}

export async function deleteEvent(id: string) {
  await requireAdmin();
  try {
    const db = getDb();
    await db.delete(events).where(eq(events.id, id));
    revalidate();
    return { success: true };
  } catch (error) {
    console.error("deleteEvent error:", error);
    return { success: false, error: errorMessage(error) };
  }
}
