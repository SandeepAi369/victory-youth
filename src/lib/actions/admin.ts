/**
 * Admin CRUD Actions for Ganesh BNS
 * 
 * Comprehensive server actions for all admin operations:
 * - Members, Donations, Expenses, Events, Notices, Sponsors, Gallery, Auction, Notes
 * - Full Create, Read, Update, Delete functionality
 * - Audit logging integration
 */

"use server";

import { getDb, schema } from "@/db";
import type { NewMemberRow, NewDonationRow, NewExpenseRow, NewEventRow, NewNoticeRow, NewSponsorRow, NewGalleryRow, NewAuctionItemRow, NewImportantNoteRow, NewAssociationSettingsRow } from "@/db/schema";
import { eq, ilike, or, desc, and, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

// ============================================
// UTILITY FUNCTIONS
// ============================================

function generateId(prefix: string = ""): string {
  return `${prefix}${prefix ? "_" : ""}${randomUUID()}`;
}

function handleError(operation: string, error: any): { success: false; error: string } {
  console.error(`Error ${operation}:`, error);
  return { success: false, error: error.message || "An error occurred" };
}

// ============================================
// MEMBERS CRUD
// ============================================

export async function getMembers(query: string = "") {
  const db = getDb();
  try {
    if (query) {
      return await db
        .select()
        .from(schema.members)
        .where(
          or(
            ilike(schema.members.name, `%${query}%`),
            ilike(schema.members.memberId, `%${query}%`),
            ilike(schema.members.phone, `%${query}%`)
          )
        )
        .orderBy(desc(schema.members.createdAt));
    }

    return await db
      .select()
      .from(schema.members)
      .orderBy(desc(schema.members.createdAt));
  } catch (error) {
    return handleError("fetching members", error) as any[];
  }
}

export async function getMemberById(id: string) {
  const db = getDb();
  try {
    const member = await db
      .select()
      .from(schema.members)
      .where(eq(schema.members.id, id))
      .limit(1);
    return member[0] || null;
  } catch (error) {
    console.error("Error fetching member:", error);
    return null;
  }
}

export async function createMember(data: NewMemberRow) {
  const db = getDb();
  try {
    const id = generateId("mem");
    await db.insert(schema.members).values({ ...data, id });
    revalidatePath("/admin/members");
    return { success: true, id };
  } catch (error) {
    return handleError("creating member", error);
  }
}

export async function updateMember(id: string, data: Partial<NewMemberRow>) {
  const db = getDb();
  try {
    await db
      .update(schema.members)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.members.id, id));
    revalidatePath("/admin/members");
    return { success: true };
  } catch (error) {
    return handleError("updating member", error);
  }
}

export async function deleteMember(id: string) {
  const db = getDb();
  try {
    await db.delete(schema.members).where(eq(schema.members.id, id));
    revalidatePath("/admin/members");
    return { success: true };
  } catch (error) {
    return handleError("deleting member", error);
  }
}

// ============================================
// DONATIONS CRUD
// ============================================

export async function getDonations(query: string = "") {
  const db = getDb();
  try {
    if (query) {
      return await db
        .select()
        .from(schema.donations)
        .where(
          or(
            ilike(schema.donations.donorName, `%${query}%`),
            ilike(schema.donations.receiptNo, `%${query}%`),
            ilike(schema.donations.phone, `%${query}%`)
          )
        )
        .orderBy(desc(schema.donations.createdAt));
    }

    return await db
      .select()
      .from(schema.donations)
      .orderBy(desc(schema.donations.createdAt));
  } catch (error) {
    return handleError("fetching donations", error) as any[];
  }
}

export async function getDonationById(id: string) {
  const db = getDb();
  try {
    const donation = await db
      .select()
      .from(schema.donations)
      .where(eq(schema.donations.id, id))
      .limit(1);
    return donation[0] || null;
  } catch (error) {
    console.error("Error fetching donation:", error);
    return null;
  }
}

export async function createDonation(data: NewDonationRow) {
  const db = getDb();
  try {
    const id = generateId("don");
    const receiptNo = data.receiptNo || `REC-${Date.now()}`;
    
    await db.insert(schema.donations).values({ ...data, id, receiptNo });
    revalidatePath("/admin/donations");
    revalidatePath("/admin");
    return { success: true, id, receiptNo };
  } catch (error) {
    return handleError("creating donation", error);
  }
}

export async function updateDonation(id: string, data: Partial<NewDonationRow>) {
  const db = getDb();
  try {
    await db
      .update(schema.donations)
      .set(data)
      .where(eq(schema.donations.id, id));
    revalidatePath("/admin/donations");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return handleError("updating donation", error);
  }
}

export async function deleteDonation(id: string) {
  const db = getDb();
  try {
    await db.delete(schema.donations).where(eq(schema.donations.id, id));
    revalidatePath("/admin/donations");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return handleError("deleting donation", error);
  }
}

// ============================================
// EXPENSES CRUD
// ============================================

export async function getExpenses(query: string = "") {
  const db = getDb();
  try {
    if (query) {
      return await db
        .select()
        .from(schema.expenses)
        .where(
          or(
            ilike(schema.expenses.title, `%${query}%`),
            ilike(schema.expenses.description, `%${query}%`)
          )
        )
        .orderBy(desc(schema.expenses.createdAt));
    }

    return await db
      .select()
      .from(schema.expenses)
      .orderBy(desc(schema.expenses.createdAt));
  } catch (error) {
    return handleError("fetching expenses", error) as any[];
  }
}

export async function getExpenseById(id: string) {
  const db = getDb();
  try {
    const expense = await db
      .select()
      .from(schema.expenses)
      .where(eq(schema.expenses.id, id))
      .limit(1);
    return expense[0] || null;
  } catch (error) {
    console.error("Error fetching expense:", error);
    return null;
  }
}

export async function createExpense(data: NewExpenseRow) {
  const db = getDb();
  try {
    const id = generateId("exp");
    await db.insert(schema.expenses).values({ ...data, id });
    revalidatePath("/admin/expenses");
    return { success: true, id };
  } catch (error) {
    return handleError("creating expense", error);
  }
}

export async function updateExpense(id: string, data: Partial<NewExpenseRow>) {
  const db = getDb();
  try {
    await db
      .update(schema.expenses)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.expenses.id, id));
    revalidatePath("/admin/expenses");
    return { success: true };
  } catch (error) {
    return handleError("updating expense", error);
  }
}

export async function deleteExpense(id: string) {
  const db = getDb();
  try {
    await db.delete(schema.expenses).where(eq(schema.expenses.id, id));
    revalidatePath("/admin/expenses");
    return { success: true };
  } catch (error) {
    return handleError("deleting expense", error);
  }
}

// ============================================
// EVENTS CRUD
// ============================================

export async function getEvents(query: string = "") {
  const db = getDb();
  try {
    if (query) {
      return await db
        .select()
        .from(schema.events)
        .where(ilike(schema.events.title, `%${query}%`))
        .orderBy(desc(schema.events.date));
    }

    return await db
      .select()
      .from(schema.events)
      .orderBy(desc(schema.events.date));
  } catch (error) {
    return handleError("fetching events", error) as any[];
  }
}

export async function getEventById(id: string) {
  const db = getDb();
  try {
    const event = await db
      .select()
      .from(schema.events)
      .where(eq(schema.events.id, id))
      .limit(1);
    return event[0] || null;
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}

export async function createEvent(data: NewEventRow) {
  const db = getDb();
  try {
    const id = generateId("evt");
    await db.insert(schema.events).values({ ...data, id });
    revalidatePath("/admin/events");
    revalidatePath("/schedule");
    return { success: true, id };
  } catch (error) {
    return handleError("creating event", error);
  }
}

export async function updateEvent(id: string, data: Partial<NewEventRow>) {
  const db = getDb();
  try {
    await db
      .update(schema.events)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.events.id, id));
    revalidatePath("/admin/events");
    revalidatePath("/schedule");
    return { success: true };
  } catch (error) {
    return handleError("updating event", error);
  }
}

export async function deleteEvent(id: string) {
  const db = getDb();
  try {
    await db.delete(schema.events).where(eq(schema.events.id, id));
    revalidatePath("/admin/events");
    revalidatePath("/schedule");
    return { success: true };
  } catch (error) {
    return handleError("deleting event", error);
  }
}

// ============================================
// NOTICES CRUD
// ============================================

export async function getNotices(query: string = "") {
  const db = getDb();
  try {
    if (query) {
      return await db
        .select()
        .from(schema.notices)
        .where(ilike(schema.notices.title, `%${query}%`))
        .orderBy(desc(schema.notices.createdAt));
    }

    return await db
      .select()
      .from(schema.notices)
      .orderBy(desc(schema.notices.createdAt));
  } catch (error) {
    return handleError("fetching notices", error) as any[];
  }
}

export async function getNoticeById(id: string) {
  const db = getDb();
  try {
    const notice = await db
      .select()
      .from(schema.notices)
      .where(eq(schema.notices.id, id))
      .limit(1);
    return notice[0] || null;
  } catch (error) {
    console.error("Error fetching notice:", error);
    return null;
  }
}

export async function createNotice(data: NewNoticeRow) {
  const db = getDb();
  try {
    const id = generateId("ntc");
    const now = data.status === "PUBLISHED" ? { publishedAt: new Date() } : {};
    await db.insert(schema.notices).values({ ...data, id, ...now });
    revalidatePath("/admin/notices");
    return { success: true, id };
  } catch (error) {
    return handleError("creating notice", error);
  }
}

export async function updateNotice(id: string, data: Partial<NewNoticeRow>) {
  const db = getDb();
  try {
    const now = data.status === "PUBLISHED" ? { publishedAt: new Date() } : {};
    await db
      .update(schema.notices)
      .set({ ...data, ...now, updatedAt: new Date() })
      .where(eq(schema.notices.id, id));
    revalidatePath("/admin/notices");
    return { success: true };
  } catch (error) {
    return handleError("updating notice", error);
  }
}

export async function deleteNotice(id: string) {
  const db = getDb();
  try {
    await db.delete(schema.notices).where(eq(schema.notices.id, id));
    revalidatePath("/admin/notices");
    return { success: true };
  } catch (error) {
    return handleError("deleting notice", error);
  }
}

// ============================================
// SPONSORS CRUD
// ============================================

export async function getSponsors(query: string = "") {
  const db = getDb();
  try {
    if (query) {
      return await db
        .select()
        .from(schema.sponsors)
        .where(ilike(schema.sponsors.name, `%${query}%`))
        .orderBy(desc(schema.sponsors.sortOrder));
    }

    return await db
      .select()
      .from(schema.sponsors)
      .orderBy(desc(schema.sponsors.sortOrder));
  } catch (error) {
    return handleError("fetching sponsors", error) as any[];
  }
}

export async function getSponsorById(id: string) {
  const db = getDb();
  try {
    const sponsor = await db
      .select()
      .from(schema.sponsors)
      .where(eq(schema.sponsors.id, id))
      .limit(1);
    return sponsor[0] || null;
  } catch (error) {
    console.error("Error fetching sponsor:", error);
    return null;
  }
}

export async function createSponsor(data: NewSponsorRow) {
  const db = getDb();
  try {
    const id = generateId("spn");
    await db.insert(schema.sponsors).values({ ...data, id });
    revalidatePath("/admin/sponsors");
    return { success: true, id };
  } catch (error) {
    return handleError("creating sponsor", error);
  }
}

export async function updateSponsor(id: string, data: Partial<NewSponsorRow>) {
  const db = getDb();
  try {
    await db
      .update(schema.sponsors)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.sponsors.id, id));
    revalidatePath("/admin/sponsors");
    return { success: true };
  } catch (error) {
    return handleError("updating sponsor", error);
  }
}

export async function deleteSponsor(id: string) {
  const db = getDb();
  try {
    await db.delete(schema.sponsors).where(eq(schema.sponsors.id, id));
    revalidatePath("/admin/sponsors");
    return { success: true };
  } catch (error) {
    return handleError("deleting sponsor", error);
  }
}

// ============================================
// GALLERY CRUD
// ============================================

export async function getGallery(query: string = "") {
  const db = getDb();
  try {
    if (query) {
      return await db
        .select()
        .from(schema.gallery)
        .where(ilike(schema.gallery.title, `%${query}%`))
        .orderBy(desc(schema.gallery.createdAt));
    }

    return await db
      .select()
      .from(schema.gallery)
      .orderBy(desc(schema.gallery.createdAt));
  } catch (error) {
    return handleError("fetching gallery", error) as any[];
  }
}

export async function getGalleryItemById(id: string) {
  const db = getDb();
  try {
    const item = await db
      .select()
      .from(schema.gallery)
      .where(eq(schema.gallery.id, id))
      .limit(1);
    return item[0] || null;
  } catch (error) {
    console.error("Error fetching gallery item:", error);
    return null;
  }
}

export async function createGalleryItem(data: NewGalleryRow) {
  const db = getDb();
  try {
    const id = generateId("img");
    await db.insert(schema.gallery).values({ ...data, id });
    revalidatePath("/admin/gallery");
    return { success: true, id };
  } catch (error) {
    return handleError("creating gallery item", error);
  }
}

export async function updateGalleryItem(id: string, data: Partial<NewGalleryRow>) {
  const db = getDb();
  try {
    await db
      .update(schema.gallery)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.gallery.id, id));
    revalidatePath("/admin/gallery");
    return { success: true };
  } catch (error) {
    return handleError("updating gallery item", error);
  }
}

export async function deleteGalleryItem(id: string) {
  const db = getDb();
  try {
    await db.delete(schema.gallery).where(eq(schema.gallery.id, id));
    revalidatePath("/admin/gallery");
    return { success: true };
  } catch (error) {
    return handleError("deleting gallery item", error);
  }
}

// ============================================
// AUCTION ITEMS CRUD
// ============================================

export async function getAuctionItems(query: string = "") {
  const db = getDb();
  try {
    if (query) {
      return await db
        .select()
        .from(schema.auctionItems)
        .where(ilike(schema.auctionItems.title, `%${query}%`))
        .orderBy(desc(schema.auctionItems.createdAt));
    }

    return await db
      .select()
      .from(schema.auctionItems)
      .orderBy(desc(schema.auctionItems.createdAt));
  } catch (error) {
    return handleError("fetching auction items", error) as any[];
  }
}

export async function getAuctionItemById(id: string) {
  const db = getDb();
  try {
    const item = await db
      .select()
      .from(schema.auctionItems)
      .where(eq(schema.auctionItems.id, id))
      .limit(1);
    return item[0] || null;
  } catch (error) {
    console.error("Error fetching auction item:", error);
    return null;
  }
}

export async function createAuctionItem(data: NewAuctionItemRow) {
  const db = getDb();
  try {
    const id = generateId("auc");
    await db.insert(schema.auctionItems).values({ ...data, id });
    revalidatePath("/admin/auction");
    return { success: true, id };
  } catch (error) {
    return handleError("creating auction item", error);
  }
}

export async function updateAuctionItem(id: string, data: Partial<NewAuctionItemRow>) {
  const db = getDb();
  try {
    await db
      .update(schema.auctionItems)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.auctionItems.id, id));
    revalidatePath("/admin/auction");
    return { success: true };
  } catch (error) {
    return handleError("updating auction item", error);
  }
}

export async function deleteAuctionItem(id: string) {
  const db = getDb();
  try {
    await db.delete(schema.auctionItems).where(eq(schema.auctionItems.id, id));
    revalidatePath("/admin/auction");
    return { success: true };
  } catch (error) {
    return handleError("deleting auction item", error);
  }
}

// ============================================
// IMPORTANT NOTES CRUD
// ============================================

export async function getImportantNotes(query: string = "") {
  const db = getDb();
  try {
    if (query) {
      return await db
        .select()
        .from(schema.importantNotes)
        .where(ilike(schema.importantNotes.title, `%${query}%`))
        .orderBy(desc(schema.importantNotes.isPinned), desc(schema.importantNotes.updatedAt));
    }

    return await db
      .select()
      .from(schema.importantNotes)
      .orderBy(desc(schema.importantNotes.isPinned), desc(schema.importantNotes.updatedAt));
  } catch (error) {
    return handleError("fetching notes", error) as any[];
  }
}

export async function getImportantNoteById(id: string) {
  const db = getDb();
  try {
    const note = await db
      .select()
      .from(schema.importantNotes)
      .where(eq(schema.importantNotes.id, id))
      .limit(1);
    return note[0] || null;
  } catch (error) {
    console.error("Error fetching note:", error);
    return null;
  }
}

export async function createImportantNote(data: NewImportantNoteRow) {
  const db = getDb();
  try {
    const id = generateId("note");
    await db.insert(schema.importantNotes).values({ ...data, id });
    revalidatePath("/admin/notes");
    return { success: true, id };
  } catch (error) {
    return handleError("creating note", error);
  }
}

export async function updateImportantNote(id: string, data: Partial<NewImportantNoteRow>) {
  const db = getDb();
  try {
    await db
      .update(schema.importantNotes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.importantNotes.id, id));
    revalidatePath("/admin/notes");
    return { success: true };
  } catch (error) {
    return handleError("updating note", error);
  }
}

export async function deleteImportantNote(id: string) {
  const db = getDb();
  try {
    await db.delete(schema.importantNotes).where(eq(schema.importantNotes.id, id));
    revalidatePath("/admin/notes");
    return { success: true };
  } catch (error) {
    return handleError("deleting note", error);
  }
}

// ============================================
// ASSOCIATION SETTINGS
// ============================================

export async function getAssociationSettings() {
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
