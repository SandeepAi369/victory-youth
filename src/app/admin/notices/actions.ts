"use server";
import { errorMessage } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin-session";
import { getDb, schema } from "@/db";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

function revalidate() {
  revalidatePath("/");
  revalidatePath("/admin/notices");
  revalidatePath("/notices");
}

// ===== NOTICES =====

export async function getNotices() {
  await requireAdmin();
  try {
    const db = getDb();
    return await db.select({ id: schema.notices.id, title: schema.notices.title, body: schema.notices.body, status: schema.notices.status, createdAt: schema.notices.createdAt }).from(schema.notices).orderBy(desc(schema.notices.createdAt));
  } catch (error) {
    console.error("getNotices error:", error);
    return [];
  }
}

export async function addNotice(data: { title: string; body: string }) {
  await requireAdmin();
  try {
    const db = getDb();
    const id = `notice_${randomUUID()}`;
    await db.insert(schema.notices).values({ id, title: data.title, body: data.body, status: "DRAFT", sentBy: "Admin" });
    revalidate();
    return { success: true };
  } catch (e) {
    return { success: false, error: errorMessage(e) };
  }
}

export async function updateNotice(id: string, data: { title?: string; body?: string }) {
  await requireAdmin();
  try {
    const db = getDb();
    await db.update(schema.notices).set({ ...data, updatedAt: new Date() }).where(eq(schema.notices.id, id));
    revalidate();
    return { success: true };
  } catch (e) {
    return { success: false, error: errorMessage(e) };
  }
}

export async function deleteNotice(id: string) {
  await requireAdmin();
  try {
    const db = getDb();
    await db.delete(schema.notices).where(eq(schema.notices.id, id));
    revalidate();
    return { success: true };
  } catch (e) {
    return { success: false, error: errorMessage(e) };
  }
}

export async function toggleNoticePublish(id: string, publish: boolean) {
  await requireAdmin();
  try {
    const db = getDb();
    await db.update(schema.notices)
      .set({ status: publish ? "PUBLISHED" : "DRAFT", updatedAt: new Date() })
      .where(eq(schema.notices.id, id));
    revalidate();
    return { success: true };
  } catch (e) {
    return { success: false, error: errorMessage(e) };
  }
}

/** Master toggle: publish or unpublish ALL notices at once */
export async function setAllNoticesVisibility(
  publish: boolean
): Promise<{ success: boolean; newState: boolean; error?: string }> {
  await requireAdmin();
  try {
    const db = getDb();
    await db.update(schema.notices).set({
      status: publish ? "PUBLISHED" : "DRAFT",
      updatedAt: new Date(),
    });
    revalidate();
    return { success: true, newState: publish };
  } catch (e) {
    console.error("setAllNoticesVisibility error:", e);
    return { success: false, newState: !publish, error: errorMessage(e) };
  }
}

// ===== NOTES =====

export async function getNotes() {
  await requireAdmin();
  try {
    const db = getDb();
    return await db.select({ id: schema.importantNotes.id, title: schema.importantNotes.title, content: schema.importantNotes.content, category: schema.importantNotes.category, authorName: schema.importantNotes.authorName, isPublished: schema.importantNotes.isPublished, createdAt: schema.importantNotes.createdAt }).from(schema.importantNotes).orderBy(desc(schema.importantNotes.createdAt));
  } catch (error) {
    console.error("getNotes error:", error);
    return [];
  }
}

export async function addNote(data: { title: string; content: string; category: string; authorName: string }) {
  await requireAdmin();
  try {
    const db = getDb();
    const id = `note_${randomUUID()}`;
    await db.insert(schema.importantNotes).values({
      id, title: data.title, content: data.content, category: data.category,
      authorName: data.authorName, isPublished: false, isPinned: false, version: 1,
    });
    revalidate();
    return { success: true };
  } catch (e) {
    return { success: false, error: errorMessage(e) };
  }
}

export async function updateNote(id: string, data: { title?: string; content?: string; category?: string }) {
  await requireAdmin();
  try {
    const db = getDb();
    await db.update(schema.importantNotes).set({ ...data, updatedAt: new Date() }).where(eq(schema.importantNotes.id, id));
    revalidate();
    return { success: true };
  } catch (e) {
    return { success: false, error: errorMessage(e) };
  }
}

export async function deleteNote(id: string) {
  await requireAdmin();
  try {
    const db = getDb();
    await db.delete(schema.importantNotes).where(eq(schema.importantNotes.id, id));
    revalidate();
    return { success: true };
  } catch (e) {
    return { success: false, error: errorMessage(e) };
  }
}

export async function toggleNotePublish(id: string, publish: boolean) {
  await requireAdmin();
  try {
    const db = getDb();
    await db.update(schema.importantNotes)
      .set({ isPublished: publish, updatedAt: new Date() })
      .where(eq(schema.importantNotes.id, id));
    revalidate();
    return { success: true };
  } catch (e) {
    return { success: false, error: errorMessage(e) };
  }
}

/** Master toggle: publish or unpublish ALL notes at once */
export async function setAllNotesVisibility(
  publish: boolean
): Promise<{ success: boolean; newState: boolean; error?: string }> {
  await requireAdmin();
  try {
    const db = getDb();
    await db.update(schema.importantNotes).set({ isPublished: publish, updatedAt: new Date() });
    revalidate();
    return { success: true, newState: publish };
  } catch (e) {
    console.error("setAllNotesVisibility error:", e);
    return { success: false, newState: !publish, error: errorMessage(e) };
  }
}
