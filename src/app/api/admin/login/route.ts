import { NextResponse } from "next/server";
import { createAdminSession, verifyAdminPassword } from "@/lib/admin-session";

export async function POST(request: Request) {
  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body. Expected JSON with 'password' field." },
      { status: 400 }
    );
  }

  if (!body.password || typeof body.password !== "string") {
    return NextResponse.json(
      { success: false, error: "Password field is required." },
      { status: 400 }
    );
  }

  if (!(await verifyAdminPassword(body.password))) {
    return NextResponse.json(
      { success: false, error: "Incorrect password." },
      { status: 401 }
    );
  }

  // Signed, httpOnly session cookie — the password is never stored in the browser
  await createAdminSession();
  return NextResponse.json({ success: true, message: "Login successful." });
}
