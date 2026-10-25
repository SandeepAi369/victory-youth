import { NextResponse } from "next/server";
import { getFormattedFinancialSummary } from "@/lib/queries/financial";
import { isAdmin } from "@/lib/admin-session";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await getFormattedFinancialSummary();
    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error fetching financial summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch financial summary" },
      { status: 500 }
    );
  }
}
