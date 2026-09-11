"use server";

import { getDb, schema } from "@/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

function revalidate() {
  revalidatePath("/"); revalidatePath("/admin/notices");
}

// ===== NOTICES =====
export async function addNotice(data: { title: string; body: string }) {
  try {
    const db = getDb();
    const id = `notice_${Date.now()}`;
    await db.insert(schema.notices).values({ id, title: data.title, body: data.body, status: "DRAFT", sentBy: "Admin" });
    revalidate();
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function updateNotice(id: string, data: { title?: string; body?: string }) {
  try {
    const db = getDb();
    await db.update(schema.notices).set({ ...data, updatedAt: new Date() }).where(eq(schema.notices.id, id));
    revalidate();
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function deleteNotice(id: string) {
  try {
    const db = getDb();
    await db.delete(schema.notices).where(eq(schema.notices.id, id));
    revalidate();
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function toggleNoticePublish(id: string, publish: boolean) {
  try {
    const db = getDb();
    await db.update(schema.notices).set({ status: publish ? "PUBLISHED" : "DRAFT", updatedAt: new Date() }).where(eq(schema.notices.id, id));
    revalidate();
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}

// ===== NOTES =====
export async function addNote(data: { title: string; content: string; category: string; authorName: string }) {
  try {
    const db = getDb();
    const id = `note_${Date.now()}`;
    await db.insert(schema.importantNotes).values({ id, title: data.title, content: data.content, category: data.category, authorName: data.authorName, isPublished: false, isPinned: false, version: 1 });
    revalidate();
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function updateNote(id: string, data: { title?: string; content?: string; category?: string }) {
  try {
    const db = getDb();
    await db.update(schema.importantNotes).set({ ...data, updatedAt: new Date() }).where(eq(schema.importantNotes.id, id));
    revalidate();
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function deleteNote(id: string) {
  try {
    const db = getDb();
    await db.delete(schema.importantNotes).where(eq(schema.importantNotes.id, id));
    revalidate();
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function toggleNotePublish(id: string, publish: boolean) {
  try {
    const db = getDb();
    await db.update(schema.importantNotes).set({ isPublished: publish, updatedAt: new Date() }).where(eq(schema.importantNotes.id, id));
    revalidate();
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}
