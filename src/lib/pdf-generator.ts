"use client";
import jsPDF from "jspdf";
import { Donation, Member, AssociationSettings } from "@/types";
import { formatCurrency, numberToIndianWords } from "@/lib/utils";

export function generateDonationReceiptPdf(donation: Donation, settings: AssociationSettings) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a5" });
  const primary = [90, 16, 24];
  const gold = [212, 160, 23];
  const dark = [18, 11, 13];

  doc.setDrawColor(gold[0], gold[1], gold[2]);
  doc.setLineWidth(1.2);
  doc.rect(5, 5, 138, 200);
  doc.setDrawColor(primary[0], primary[1], primary[2]);
  doc.setLineWidth(0.4);
  doc.rect(7, 7, 134, 196);

  doc.setFillColor(primary[0], primary[1], primary[2]);
  doc.rect(7, 7, 134, 34, "F");

  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("|| SRI GANESHAYA NAMAHA ||", 74, 13, { align: "center" });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.text(settings.associationName || settings.name || "Victory Youth Association", 74, 20, { align: "center" });

  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.setFontSize(16);
  doc.text("Victory Youth - Gudem Gally", 74, 28, { align: "center" });

  doc.setTextColor(220, 220, 220);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  const regNo = settings.registrationNo || settings.regNo;
  const estd = settings.establishedYear || settings.estYear;
  const legalLine = [regNo && `Reg No: ${regNo}`, estd && `Estd. ${estd}`, "50+ Years Golden Jubilee"].filter(Boolean).join(" | ");
  doc.text(legalLine, 74, 34, { align: "center" });
  doc.setFillColor(gold[0], gold[1], gold[2]);
  doc.roundedRect(42, 44, 64, 8, 2, 2, "F");
  doc.setTextColor(dark[0], dark[1], dark[2]);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("OFFICIAL 80G DONATION RECEIPT", 74, 49.5, { align: "center" });

  doc.setTextColor(dark[0], dark[1], dark[2]);
  doc.setFontSize(8.5);
  doc.text(`Receipt No: ${donation.receiptNo}`, 12, 59);
  doc.text(`Date: ${donation.date}`, 100, 59);

  doc.setDrawColor(200, 200, 200);
  doc.line(12, 62, 136, 62);

  doc.setFillColor(255, 251, 242);
  doc.roundedRect(12, 66, 124, 62, 2, 2, "F");
  doc.setDrawColor(gold[0], gold[1], gold[2]);
  doc.roundedRect(12, 66, 124, 62, 2, 2, "D");

  let y = 73;
  const printRow = (label: string, value: string, boldVal = false) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(primary[0], primary[1], primary[2]);
    doc.text(label, 16, y);
    doc.setFont("helvetica", boldVal ? "bold" : "normal");
    doc.setTextColor(20, 20, 20);
    doc.text(`: ${value || "-"}`, 50, y);
    y += 9.5;
  };

  printRow("Donor Name", donation.donorName || "", true);
  printRow("Gotram / Family", donation.gotram || "-");
  printRow("Mobile Number", donation.donorPhone || donation.phone || "-");
  printRow("Seva / Purpose", donation.purpose || "Golden Jubilee Utsav Seva");
  printRow("Payment Mode", `${donation.paymentMode || "UPI"} (Txn: ${donation.transactionId || "Verified"})`);
  printRow("Sponsor Tier", donation.sponsorTier || "Devotee Patron", true);

  doc.setFillColor(primary[0], primary[1], primary[2]);
  doc.roundedRect(12, 132, 124, 15, 2, 2, "F");
  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("DONATION AMOUNT RECEIVED:", 16, 141.5);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.text(formatCurrency(donation.amount), 130, 142.5, { align: "right" });

  doc.setTextColor(dark[0], dark[1], dark[2]);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "italic");
  doc.text(`Amount in words: ${numberToIndianWords(donation.amount)} Only`, 14, 152);

  doc.setTextColor(100, 100, 100);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  // Only print the 80G line when the real exemption number is configured in settings
  if (settings.tax80GNo) {
    doc.text(`80G Exemption: ${settings.tax80GNo} | Tax Deductible under Sec 80G`, 14, 158);
  }

  doc.setDrawColor(200, 200, 200);
  doc.line(14, 178, 50, 178);
  doc.line(100, 178, 136, 178);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(primary[0], primary[1], primary[2]);
  doc.text("Treasurer Signature", 32, 182, { align: "center" });
  doc.text("President Signature", 118, 182, { align: "center" });

  doc.text("Thank You for your Seva! May Lord Ganesha Bless You & Your Family!", 74, 194, { align: "center" });

  doc.save(`80G_Donation_Receipt_${donation.receiptNo.replace("#", "")}.pdf`);
}

export function generateMemberIdCardPdf(member: Member, settings: AssociationSettings) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: [85.6, 53.98] });
  const primary = [90, 16, 24];
  const gold = [212, 160, 23];

  doc.setFillColor(18, 5, 8);
  doc.rect(0, 0, 85.6, 53.98, "F");

  doc.setFillColor(primary[0], primary[1], primary[2]);
  doc.rect(0, 0, 85.6, 14, "F");

  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.setFontSize(6);
  doc.setFont("helvetica", "bold");
  doc.text(settings.associationName || settings.name || "Victory Youth Association", 42.8, 4.5, { align: "center" });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.text("Victory Youth - Gudem Gally", 42.8, 8.5, { align: "center" });

  doc.setDrawColor(gold[0], gold[1], gold[2]);
  doc.setLineWidth(0.5);
  doc.setFillColor(30, 10, 15);
  doc.roundedRect(4, 17, 20, 25, 1, 1, "FD");
  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.setFontSize(5);
  doc.text("PHOTO", 14, 30, { align: "center" });

  let y = 19;
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(member.name, 28, y);

  y += 4.5;
  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.setFontSize(6.5);
  doc.text(`ROLE: ${member.role}`, 28, y);

  y += 4;
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(5.5);
  doc.setFont("helvetica", "normal");
  doc.text(`Member ID: ${member.memberId}`, 28, y);

  y += 3.5;
  doc.text(`Father: ${member.fatherName || "-"}`, 28, y);

  y += 3.5;
  doc.text(`Mobile: ${member.mobile || member.phone || "-"}`, 28, y);

  doc.setFillColor(primary[0], primary[1], primary[2]);
  doc.rect(0, 48, 85.6, 6, "F");
  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.setFontSize(4.5);
  doc.setFont("helvetica", "bold");
  doc.text("AUTHORIZED COMMITTEE MEMBER | NON-TRANSFERABLE", 42.8, 52, { align: "center" });

  doc.save(`Member_Card_${member.memberId}.pdf`);
}
