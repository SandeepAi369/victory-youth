"use server";
import { errorMessage } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin-session";
import { getDb, schema } from "@/db";
import type { NewMemberRow } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

function revalidate() {
  revalidatePath("/admin/members");
  revalidatePath("/admin/active-members");
  revalidatePath("/active-members");
  revalidatePath("/members");
  revalidatePath("/");
}

export async function getMembers() {
  await requireAdmin();
  try {
    const db = getDb();
    return await db.select({ id: schema.members.id, memberId: schema.members.memberId, name: schema.members.name, fullName: schema.members.fullName, phone: schema.members.phone, membershipFee: schema.members.membershipFee, role: schema.members.role, committeeRole: schema.members.committeeRole, isActive: schema.members.isActive, joinDate: schema.members.joinDate, createdAt: schema.members.createdAt }).from(schema.members).orderBy(schema.members.name);
  } catch (error) {
    console.error("getMembers error:", error);
    return [];
  }
}

export async function addMember(data: {
  name: string;
  fullName: string;
  phone: string;
  membershipFee: number;
  role?: string;
}) {
  await requireAdmin();
  try {
    const db = getDb();
    const id = `mem_${randomUUID()}`;
    const memberId = `VY-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;
    await db.insert(schema.members).values({
      id,
      memberId,
      name: data.name,
      fullName: data.fullName || data.name,
      phone: data.phone,
      membershipFee: data.membershipFee || 0,
      role: data.role || "Member",
      committeeRole: data.role || "Member",
      isActive: false,
    });
    revalidate();
    return { success: true };
  } catch (error) {
    console.error("addMember error:", error);
    return { success: false, error: errorMessage(error) };
  }
}

export async function updateMember(id: string, data: Partial<NewMemberRow>) {
  await requireAdmin();
  try {
    const db = getDb();
    await db
      .update(schema.members)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.members.id, id));
    revalidate();
    return { success: true };
  } catch (error) {
    console.error("updateMember error:", error);
    return { success: false, error: errorMessage(error) };
  }
}

export async function deleteMember(id: string) {
  await requireAdmin();
  try {
    const db = getDb();
    await db.delete(schema.members).where(eq(schema.members.id, id));
    revalidate();
    return { success: true };
  } catch (error) {
    console.error("deleteMember error:", error);
    return { success: false, error: errorMessage(error) };
  }
}

export async function setAllMembersVisibility(
  publish: boolean
): Promise<{ success: boolean; newState: boolean; error?: string }> {
  await requireAdmin();
  try {
    const db = getDb();
    await db.update(schema.members).set({ isActive: publish });
    revalidatePath("/admin/members");
    revalidatePath("/members");
    revalidatePath("/");
    return { success: true, newState: publish };
  } catch (error) {
    console.error("setAllMembersVisibility error:", error);
    return { success: false, newState: !publish, error: errorMessage(error) };
  }
}

/** Names of active members only (plus whether each is published on the public list). */
export async function getActiveMemberNames() {
  await requireAdmin();
  try {
    const db = getDb();
    return await db
      .select({ id: schema.members.id, name: schema.members.name, listedPublicly: schema.members.listedPublicly })
      .from(schema.members)
      .where(eq(schema.members.isActive, true))
      .orderBy(schema.members.name);
  } catch (error) {
    console.error("getActiveMemberNames error:", error);
    return [];
  }
}

/** Publish (true) or hide (false) a member's name on the public Active Members list. */
export async function toggleMemberListing(id: string, listed: boolean) {
  await requireAdmin();
  try {
    const db = getDb();
    await db.update(schema.members).set({ listedPublicly: listed }).where(eq(schema.members.id, id));
    revalidate();
    return { success: true };
  } catch (error) {
    console.error("toggleMemberListing error:", error);
    return { success: false, error: errorMessage(error) };
  }
}
