import cloudinary from "cloudinary";

const configured = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

if (configured) {
  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log("[upload] Cloudinary configured");
} else {
  console.log("[upload] Cloudinary not configured — using local storage (server/uploads)");
}

/**
 * Uploads a local file to Cloudinary when configured.
 * Returns the remote URL + a thumbnail URL, or null when not configured.
 */
export async function uploadToCloudinary(filePath, { folder = "golz", resourceType = "auto" } = {}) {
  if (!configured) return null;
  const res = await cloudinary.v2.uploader.upload(filePath, { folder, resource_type: resourceType });
  const thumb = res.resource_type === "video"
    ? res.secure_url.replace(/\.mp4$/, ".jpg")
    : res.secure_url.replace(/\.(png|jpe?g|webp)$/, ".jpg");
  return { url: res.secure_url, thumb, publicId: res.public_id };
}

export function isCloudinaryConfigured() {
  return configured;
}
