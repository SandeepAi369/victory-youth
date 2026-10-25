import { createHash } from "crypto";

/**
 * Deletes an image from Cloudinary via the signed REST API.
 *
 * Credentials come only from the environment (Worker secrets in production,
 * .env locally): CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.
 * Never hardcode them here.
 */
export async function destroyCloudinaryImage(publicId: string): Promise<void> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.error(
      "Cloudinary destroy skipped: set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET."
    );
    return;
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const toSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = createHash("sha1").update(toSign).digest("hex");

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ public_id: publicId, api_key: apiKey, timestamp, signature }),
    });
    if (!res.ok) console.error("Cloudinary destroy failed:", res.status, await res.text());
  } catch (err) {
    console.error("Cloudinary destroy error:", err);
  }
}
