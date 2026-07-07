import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function requireAdmin(req) {
  return req.headers["x-admin-token"] === process.env.ADMIN_TOKEN;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-token");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!requireAdmin(req)) return res.status(401).json({ error: "Unauthorized" });

  try {
    const { image, folder = "chezfarahi" } = req.body;

    if (!image) return res.status(400).json({ error: "image required (base64 or URL)" });

    const result = await cloudinary.uploader.upload(image, {
      folder,
      transformation: [
        { width: 800, height: 800, crop: "limit" }, // max 800px, keep aspect ratio
        { quality: "auto:good" },                    // auto-optimize quality
        { fetch_format: "auto" },                    // serve WebP/AVIF automatically
      ],
    });

    res.status(200).json({
      url:       result.secure_url,
      publicId:  result.public_id,
      width:     result.width,
      height:    result.height,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed: " + err.message });
  }
}