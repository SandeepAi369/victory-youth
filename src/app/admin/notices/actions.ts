"use server";

import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ===== NOTICES =====
export async function addNotice(data: { title: string; body: string }) {
  if (!db) return { success: false };
  const id = `notice_${Date.now()}`;
  try {
    await db.insert(schema.notices).values({ id, title: data.title, body: data.body, status: "DRAFT", sentBy: "Admin" });
    revalidatePath("/"); revalidatePath("/admin/notices");
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function updateNotice(id: string, data: { title?: string; body?: string }) {
  if (!db) return { success: false };
  try {
    await db.update(schema.notices).set({ ...data, updatedAt: new Date() }).where(eq(schema.notices.id, id));
    revalidatePath("/"); revalidatePath("/admin/notices");
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function deleteNotice(id: string) {
  if (!db) return { success: false };
  try {
    await db.delete(schema.notices).where(eq(schema.notices.id, id));
    revalidatePath("/"); revalidatePath("/admin/notices");
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function toggleNoticePublish(id: string, publish: boolean) {
  if (!db) return { success: false };
  try {
    await db.update(schema.notices).set({ status: publish ? "PUBLISHED" : "DRAFT", updatedAt: new Date() }).where(eq(schema.notices.id, id));
    revalidatePath("/"); revalidatePath("/admin/notices");
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}

// ===== NOTES =====
export async function addNote(data: { title: string; content: string; category: string; authorName: string }) {
  if (!db) return { success: false };
  const id = `note_${Date.now()}`;
  try {
    await db.insert(schema.importantNotes).values({ id, title: data.title, content: data.content, category: data.category, authorName: data.authorName, isPublished: false, isPinned: false, version: 1 });
    revalidatePath("/"); revalidatePath("/admin/notices");
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function updateNote(id: string, data: { title?: string; content?: string; category?: string }) {
  if (!db) return { success: false };
  try {
    await db.update(schema.importantNotes).set({ ...data, updatedAt: new Date() }).where(eq(schema.importantNotes.id, id));
    revalidatePath("/"); revalidatePath("/admin/notices");
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function deleteNote(id: string) {
  if (!db) return { success: false };
  try {
    await db.delete(schema.importantNotes).where(eq(schema.importantNotes.id, id));
    revalidatePath("/"); revalidatePath("/admin/notices");
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function toggleNotePublish(id: string, publish: boolean) {
  if (!db) return { success: false };
  try {
    await db.update(schema.importantNotes).set({ isPublished: publish, updatedAt: new Date() }).where(eq(schema.importantNotes.id, id));
    revalidatePath("/"); revalidatePath("/admin/notices");
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}
