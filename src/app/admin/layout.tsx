import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-session";
import ClientLayout from "./client-layout";

export default async function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  // Valid signed session cookie required (see src/lib/admin-session.ts)
  if (!(await isAdmin())) {
    redirect("/login");
  }

  return <ClientLayout>{children}</ClientLayout>;
}
