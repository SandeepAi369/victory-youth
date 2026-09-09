import { getDb, schema } from "@/db";
import { desc } from "drizzle-orm";
import MoneyInClient from "./client";

export const dynamic = "force-dynamic";

export default async function MoneyInPage() {
  let data: any[] = [];
    try {
      const db = getDb();
      data = await db.select().from(schema.donations).orderBy(desc(schema.donations.createdAt));
    } catch (e) {
      console.error("Error fetching donations:", e);
  }
  return <MoneyInClient initialData={data} />;
}
