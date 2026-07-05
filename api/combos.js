import { getCombos, setCombos } from "./redis.js";

function requireAdmin(req) {
  const token = req.headers["x-admin-token"];
  return token && token === process.env.ADMIN_TOKEN;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-token");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    // Public — customer-facing combo list (strip admin-only fields if needed)
    try {
      const combos = await getCombos();
      res.status(200).json(combos);
    } catch (err) {
      res.status(500).json({ error: "Could not load combos" });
    }
    return;
  }

  if (!requireAdmin(req)) return res.status(401).json({ error: "Unauthorized" });

  if (req.method === "PUT") {
    try {
      const combos = req.body;
      if (!Array.isArray(combos)) {
        return res.status(400).json({ error: "Expected array of combos" });
      }
      await setCombos(combos);
      res.status(200).json({ ok: true });
    } catch (err) {
      console.error("Save combos error:", err);
      res.status(500).json({ error: "Could not save combos" });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
