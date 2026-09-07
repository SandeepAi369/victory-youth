"use client";

export function getUpiPaymentUrl(
  vpa: string,
  payeeName: string,
  amount?: number,
  note: string = "Ganesh Utsav Donation"
): string {
  const params = new URLSearchParams({
    pa: vpa,
    pn: payeeName,
    tn: note,
    cu: "INR",
  });

  if (amount && amount > 0) {
    params.append("am", amount.toFixed(2));
  }

  return `upi://pay?${params.toString()}`;
}

export function getQrCodeImageUrl(data: string, size: number = 300): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
}

export const generateUpiIntent = getUpiPaymentUrl;
export function generateUpiQrUrl(vpa: string, payeeName: string, amount?: number, note?: string): string {
  const upi = getUpiPaymentUrl(vpa, payeeName, amount, note);
  return getQrCodeImageUrl(upi, 300);
}
