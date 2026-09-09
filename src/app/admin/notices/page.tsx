import { getDb, schema } from "@/db";
import { desc } from "drizzle-orm";
import NoticesClient from "./client";

export const dynamic = "force-dynamic";

export default async function NoticesPage() {
  let notices: any[] = [];
  let notes: any[] = [];
    try {
      const db = getDb();
      [notices, notes] = await Promise.all([
        db.select().from(schema.notices).orderBy(desc(schema.notices.createdAt)),
        db.select().from(schema.importantNotes).orderBy(desc(schema.importantNotes.createdAt)),
      ]);
    } catch (e) { console.error("Error:", e); }
  }
  return <NoticesClient initialNotices={notices} initialNotes={notes} />;
}
