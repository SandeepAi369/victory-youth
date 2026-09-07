import { NextResponse } from "next/server";
import { getFormattedFinancialSummary } from "@/lib/queries/financial";

export async function GET() {
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
