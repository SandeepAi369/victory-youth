import { Resend } from "resend";

export const resendClient = new Resend(process.env.RESEND_API_KEY || "re_mock_key");

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendEmailNotification(params: SendEmailParams): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[Resend Email (Mock/Dev)] To: ${params.to} | Subject: ${params.subject}`);
    return true;
  }

  try {
    const data = await resendClient.emails.send({
      from: "Victory Youth Association <contact@ganeshbns.org>",
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    return !!data;
  } catch (error) {
    console.error("[Email Error]:", error);
    return false;
  }
}
