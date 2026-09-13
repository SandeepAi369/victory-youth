import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ClientLayout from "./client-layout";

export default async function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("admin-auth");

  // Use env var in production, fallback to default for local/unset environments
  const adminPassword = process.env.ADMIN_PASSWORD || "ganesh2026";

  if (!authCookie || authCookie.value !== adminPassword) {
    redirect("/login");
  }

  return <ClientLayout>{children}</ClientLayout>;
}
