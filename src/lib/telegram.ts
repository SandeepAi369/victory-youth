const botToken = process.env.TELEGRAM_BOT_TOKEN || "";
const channelId = process.env.TELEGRAM_CHANNEL_ID || "";

export interface TelegramMessageParams {
  title: string;
  message: string;
  category?: string;
}

export async function sendTelegramBroadcast(params: TelegramMessageParams): Promise<boolean> {
  if (!botToken || !channelId) {
    console.log(`[Telegram Broadcast (Mock/Dev)] ${params.title}\nkay: ${params.message}`);
    return true;
  }

  try {
    const text = `𝔀 *${params.title}*\n\n${params.message}\n\n‌ *Victory Youth Association (VYA)*\n_Gudem Gally, Banswada_`;
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: channelId,
        text,
        parse_mode: "Markdown",
      }),
    });

    return res.ok;
  } catch (error) {
    console.error("[Telegram Error]:", error);
    return false;
  }
}
