/**
 * Public Cloudinary settings for browser uploads (not secrets).
 *
 * Uploads use an UNSIGNED upload preset, so only the cloud name and preset
 * name are needed in the browser. Forks: set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
 * and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET (in .env and in the CI build env),
 * or change the defaults below.
 */
export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "y5dnsgyb";
export const CLOUDINARY_UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "victory_youth_unsigned";
