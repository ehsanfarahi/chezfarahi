import { getMenuDuJour, setMenuDuJour } from "./redis.js";

function requireAdmin(req) {
  return req.headers["x-admin-token"] === process.env.ADMIN_TOKEN;
}

function isActiveToday(data) {
  if (!data || !data.active) return false;
  const today = new Date().toISOString().slice(0, 10);
  const from = data.dateFrom || data.date || today;
  const to = data.dateTo || data.date || today;
  return today >= from && today <= to; 
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-token");

  if (req.method === "OPTIONS") return res.status(200).end();

  // Public GET — customers fetch the active menu du jour
  if (req.method === "GET") {
    try {
      const data = await getMenuDuJour();
      const isAdmin = requireAdmin(req);

      if (isAdmin) {
        return res.status(200).json(data || null);
      }

      if (!isActiveToday(data)) return res.status(200).json(null); // no active menu today
      res.status(200).json(data);
    } catch (err) {
      console.error("Plat du jour GET error:", err);
      res.status(500).json({ error: "Could not load plat du jour" });
    }
    return;
  }

  // Admin PUT — create or update
  if (req.method === "PUT") {
    if (!requireAdmin(req)) return res.status(401).json({ error: "Unauthorized" });
    try {
      const data = req.body;
      if (data.menuPrice === undefined || !data.items) {
        return res.status(400).json({ error: "menuPrice and items required" });
      }
      await setMenuDuJour(data);
      res.status(200).json({ ok: true });
    } catch (err) {
      console.error("Plat du jour PUT error:", err);
      res.status(500).json({ error: "Could not save plat du jour" });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}