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

  const adminPassword = process.env.ADMIN_PASSWORD || "ganesh2026";

  if (body.password !== adminPassword) {
    return NextResponse.json(
      { success: false, error: "Incorrect password." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ success: true, message: "Login successful." });

  // Detect if running on HTTPS (Cloudflare) or HTTP (local dev)
  const isSecure = request.url.startsWith("https");

  response.cookies.set("admin-auth", adminPassword, {
    path: "/",
    maxAge: 86400,
    httpOnly: false,
    sameSite: "lax",
    secure: isSecure,
  });

  return response;
}
