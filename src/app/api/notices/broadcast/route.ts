import { NextRequest, NextResponse } from "next/server";
import { sendTelegramBroadcast } from "@/lib/telegram";
import { sendEmailNotification } from "@/lib/email";
import { logAuditAction } from "@/lib/audit";
import { getDb, schema } from "@/db";
import { randomUUID } from "crypto";
import { isAdmin } from "@/lib/admin-session";

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, body, channel, sentBy } = await req.json();

    if (!title || !body) {
      return NextResponse.json({ error: "Title and body are required" }, { status: 400 });
    }

    if (channel === "TELEGRAM" || channel === "BOTH") {
      await sendTelegramBroadcast({ title, message: body });
    }

    if (channel === "EMAIL" || channel === "BOTH") {
      await sendEmailNotification({
        to: "committee@ganeshbns.org",
        subject: `[VYA Notice] ${title}`,
        html: `<h2>${title}</h2><p>${body}</p><p><i>Victory Youth Association - Gudem Gally, Banswada</i></p>`,
      });
    }

    const db = getDb();
    await db.insert(schema.notices).values({
      id: `notice-${randomUUID()}`,
      title,
      body,
      channel: channel || "TELEGRAM",
      sentBy: sentBy || "Secretary",
    });

    await logAuditAction({
      actorMemberId: sentBy || "SECRETARY",
      action: "CREATE",
      entity: "system",
      entityId: `broadcast-${Date.now()}`,
      newValue: { title, channel },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Notice Broadcast Error]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
