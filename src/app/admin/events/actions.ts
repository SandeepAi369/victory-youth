"use server";

import { db } from "@/db";
import { events } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getEvents() {
  return await db.select().from(events).orderBy(events.day);
}

export async function addEvent(data: any) {
  await db.insert(events).values({
    id: `evt_${Date.now()}`,
    ...data,
  });
  revalidatePath("/admin/events");
  revalidatePath("/");
}

export async function updateEvent(id: string, data: any) {
  await db.update(events).set(data).where(eq(events.id, id));
  revalidatePath("/admin/events");
  revalidatePath("/");
}

export async function togglePublishEvent(id: string, isPublished: boolean) {
  await db.update(events).set({ isPublished }).where(eq(events.id, id));
  revalidatePath("/admin/events");
  revalidatePath("/");
}

export async function bulkPublishEvents(ids: string[], isPublished: boolean) {
  if (ids.length === 0) return;
  await db.update(events).set({ isPublished }).where(inArray(events.id, ids));
  revalidatePath("/admin/events");
  revalidatePath("/");
}

export async function deleteEvent(id: string) {
  await db.delete(events).where(eq(events.id, id));
  revalidatePath("/admin/events");
  revalidatePath("/");
}
