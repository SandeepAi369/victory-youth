import Razorpay from "razorpay";

export const razorpayClient = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_mockKeyId",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "mockKeySecret",
});

export interface CreateOrderParams {
  amount: number; // in INR
  donorName: string;
  phone: string;
  gotram?: string;
  purpose?: string;
  isAnonymous?: boolean;
}
