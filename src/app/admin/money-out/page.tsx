import { db, schema } from "@/db";
import { eq, desc } from "drizzle-orm";
import MoneyOutClient from "./client";

export const dynamic = "force-dynamic";

export default async function MoneyOutPage() {
  let data: any[] = [];
  if (db) {
    try {
      data = await db.select().from(schema.transactions).where(eq(schema.transactions.type, "EXPENSE")).orderBy(desc(schema.transactions.createdAt));
    } catch (e) { console.error("Error fetching expenses:", e); }
  }
  return <MoneyOutClient initialData={data} />;
}
