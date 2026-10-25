"use server";
import { getDb, schema } from "@/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

function revalidate() {
  revalidatePath("/admin/members");
  revalidatePath("/members");
  revalidatePath("/");
}

export async function getMembers() {
  try {
    const db = getDb();
    return await db.select({ id: schema.members.id, memberId: schema.members.memberId, name: schema.members.name, fullName: schema.members.fullName, phone: schema.members.phone, membershipFee: schema.members.membershipFee, role: schema.members.role, committeeRole: schema.members.committeeRole, isActive: schema.members.isActive }).from(schema.members).orderBy(schema.members.name);
  } catch (error: any) {
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
  } catch (error: any) {
    console.error("addMember error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateMember(id: string, data: Record<string, any>) {
  try {
    const db = getDb();
    await db
      .update(schema.members)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.members.id, id));
    revalidate();
    return { success: true };
  } catch (error: any) {
    console.error("updateMember error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteMember(id: string) {
  try {
    const db = getDb();
    await db.delete(schema.members).where(eq(schema.members.id, id));
    revalidate();
    return { success: true };
  } catch (error: any) {
    console.error("deleteMember error:", error);
    return { success: false, error: error.message };
  }
}

export async function setAllMembersVisibility(
  publish: boolean
): Promise<{ success: boolean; newState: boolean; error?: string }> {
  try {
    const db = getDb();
    await db.update(schema.members).set({ isActive: publish });
    revalidatePath("/admin/members");
    revalidatePath("/members");
    revalidatePath("/");
    return { success: true, newState: publish };
  } catch (error: any) {
    console.error("setAllMembersVisibility error:", error);
    return { success: false, newState: !publish, error: error.message };
  }
}
