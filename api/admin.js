import { getBusinessData, setBusinessData } from "./redis.js";

function requireAdmin(req) {
  const token = req.headers["x-admin-token"];
  return token && token === process.env.ADMIN_TOKEN;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-token");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAdmin(req)) return res.status(401).json({ error: "Unauthorized" });

  if (req.method === "GET") {
    try {
      const data = await getBusinessData();
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ error: "Could not load business data" });
    }
  } else if (req.method === "PUT") {
    try {
      const incoming = req.body;
      const required = ["businessName", "hours", "locations", "menu", "recommendations"];
      for (const key of required) {
        if (!(key in incoming)) {
          return res.status(400).json({ error: `Missing field: ${key}` });
        }
      }
      await setBusinessData(incoming);
      res.status(200).json({ ok: true });
    } catch (err) {
      console.error("Save error:", err);
      res.status(500).json({ error: "Could not save business data" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}