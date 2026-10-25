import * as XLSX from "xlsx";
import { Donation, Expense, CashBookEntry, Member } from "@/types";

export function exportDonationsToExcel(donations: Donation[]) {
  const data = donations.map((d) => ({
    "Receipt No": d.receiptNo,
    "Date": d.date,
    "Donor Name": d.donorName,
    "Phone": d.donorPhone,
    "Amount (INR)": d.amount,
    "Payment Mode": d.paymentMode,
    "Status": d.status,
    "Sponsor Tier": d.sponsorTier,
    "Purpose": d.purpose,
    "Gotram": d.gotram || "-",
    "Transaction ID": d.transactionId || "-",
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Donations");
  XLSX.writeFile(wb, `Ganesh_BNS_Donations_${new Date().toISOString().split("T")[0]}.xlsx`);
}

export function exportExpensesToExcel(expenses: Expense[]) {
  const data = expenses.map((e) => ({
    "Voucher No": e.voucherNo,
    "Date": e.date,
    "Category": e.category,
    "Description": e.description,
    "Amount (INR)": e.amount,
    "Payment Mode": e.paymentMode,
    "Vendor Name": e.vendorName,
    "Status": e.status,
    "Submitted By": e.submittedBy,
    "Approved By": e.approvedBy || "-",
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Expenses");
  XLSX.writeFile(wb, `Ganesh_BNS_Expenses_${new Date().toISOString().split("T")[0]}.xlsx`);
}

export function exportCashBookToExcel(entries: CashBookEntry[]) {
  const data = entries.map((c) => ({
    "ID": c.id,
    "Date": c.date,
    "Particulars": c.particulars,
    "Type": c.type,
    "Amount (INR)": c.amount,
    "Running Balance (INR)": c.balance,
    "Payment Mode": c.paymentMode,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Cash_Book");
  XLSX.writeFile(wb, `Ganesh_BNS_CashBook_${new Date().toISOString().split("T")[0]}.xlsx`);
}

export function exportMembersToExcel(members: Member[]) {
  const data = members.map((m) => ({
    "Member ID": m.memberId,
    "Name": m.name,
    "Father Name": m.fatherName || "-",
    "Mobile": m.mobile,
    "Email": m.email || "-",
    "Blood Group": m.bloodGroup || "-",
    "Role": m.role,
    "Status": m.status,
    "Membership Fee": m.membershipFee,
    "Member Since": m.memberSince,
    "Address": m.address || "-",
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Members");
  XLSX.writeFile(wb, `Ganesh_BNS_Members_${new Date().toISOString().split("T")[0]}.xlsx`);
}

type InventoryExportRow = {
  name: string;
  category: string;
  quantity: number | null;
  unit: string | null;
  condition: string | null;
  inCharge: string | null;
};

export function exportInventoryToExcel(items: InventoryExportRow[]) {
  const data = items.map((i) => ({
    "Item Name": i.name,
    "Category": i.category,
    "Quantity": i.quantity ?? 0,
    "Unit": i.unit || "-",
    "Condition": i.condition || "-",
    "In Charge": i.inCharge || "-",
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Inventory");
  XLSX.writeFile(wb, `Victory_Youth_Inventory_${new Date().toISOString().split("T")[0]}.xlsx`);
}