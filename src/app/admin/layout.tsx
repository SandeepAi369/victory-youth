import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ClientLayout from "./client-layout";

export default async function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("admin-auth");

  // Bug #6 fix: NEVER hardcode a fallback password in source code.
  // If ADMIN_PASSWORD is not set in the environment, deny all access.
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error("ADMIN_PASSWORD environment variable is not configured.");
    redirect("/login");
  }

  if (!authCookie || authCookie.value !== adminPassword) {
    redirect("/login");
  }

  return <ClientLayout>{children}</ClientLayout>;
}
