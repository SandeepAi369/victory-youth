import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "mock_cloud",
  api_key: process.env.CLOUDINARY_API_KEY || "mock_key",
  api_secret: process.env.CLOUDINARY_API_SECRET || "mock_secret",
  secure: true,
});

export async function uploadToCloudinary(fileBase64: string, folder = "ganesh-bns"): Promise<{
  url: string;
  publicId: string;
}> {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.log(`[Cloudinary Mock] Uploaded image to ${folder}`);
    return {
      url: "https://images.unsplash.com/photo-1567794639-9e54e66dee44?w=800",
      publicId: `mock_${Date.now()}`,
    };
  }

  const result = await cloudinary.uploader.upload(fileBase64, {
    folder,
    resource_type: "auto",
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}
