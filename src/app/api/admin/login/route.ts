import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: { password?: string };
  try {
    body = await request.json();
  } catch (e) {
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

  if (body.password !== (process.env.ADMIN_PASSWORD || "ganesh2026")) {
    return NextResponse.json(
      { success: false, error: "Incorrect password." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ success: true, message: "Login successful." });

  response.cookies.set("admin-auth", (process.env.ADMIN_PASSWORD || "ganesh2026"), {
    path: "/",
    maxAge: 86400,
    httpOnly: false,
    sameSite: "lax",
    secure: false,   // Dev/demo behind Pinggy — always false
  });

  return response;
}
