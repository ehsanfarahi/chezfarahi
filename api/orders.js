import {
  getAllOrdersForDate, getOrder, updateOrder,
  deleteOrder, getBusinessData, parseOrderRef, getOrderLegacy,
} from "./redis.js";

function requireAdmin(req) {
  return req.headers["x-admin-token"] === process.env.ADMIN_TOKEN;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-token");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAdmin(req)) return res.status(401).json({ error: "Unauthorized" });

  // GET — fetch orders for a date, with mode awareness
  if (req.method === "GET") {
    try {
      const { date, ref } = req.query;

      // Single order lookup by ref
      if (ref) {
        const parsed = parseOrderRef(ref);
        if (!parsed) return res.status(400).json({ error: "Invalid order reference" });
        let order = await getOrder(parsed.date, parsed.orderNumber);
        // Fallback to legacy key
        if (!order) order = await getOrderLegacy(parsed.orderNumber);
        if (!order) return res.status(404).json({ error: "Order not found" });
        return res.status(200).json(order);
      }

      const biz        = await getBusinessData();
      const orderMode  = biz.orderMode || "qr";
      const targetDate = date || new Date().toISOString().slice(0, 10);
      let   orders     = await getAllOrdersForDate(targetDate);

      // In QR mode: only show orders admin has confirmed by scanning
      if (orderMode === "qr") {
        orders = orders.filter((o) => o.adminConfirmed === true);
      }
      // In direct mode: show all orders

      res.status(200).json(orders);
    } catch (err) {
      console.error("GET orders error:", err);
      res.status(500).json({ error: "Could not fetch orders" });
    }
    return;
  }

  // PATCH — update order (status, adminConfirmed, etc.)
  if (req.method === "PATCH") {
    try {
      const { orderNumber, date, fields } = req.body;
      if (!orderNumber || !fields) {
        return res.status(400).json({ error: "orderNumber and fields required" });
      }
      const d       = date || new Date().toISOString().slice(0, 10);
      const updated = await updateOrder(d, orderNumber, fields);
      if (!updated) return res.status(404).json({ error: "Order not found" });
      res.status(200).json({ ok: true, order: updated });
    } catch (err) {
      console.error("PATCH orders error:", err);
      res.status(500).json({ error: "Could not update order" });
    }
    return;
  }

  // DELETE — remove order
  if (req.method === "DELETE") {
    try {
      const { orderNumber, date } = req.body;
      if (!orderNumber) return res.status(400).json({ error: "orderNumber required" });
      const d = date || new Date().toISOString().slice(0, 10);
      await deleteOrder(d, orderNumber);
      res.status(200).json({ ok: true });
    } catch (err) {
      console.error("DELETE orders error:", err);
      res.status(500).json({ error: "Could not delete order" });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}