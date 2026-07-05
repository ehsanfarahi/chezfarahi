import { createOrderNumber, setOrderStatus } from "./redis.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { items, total } = req.body;

    if (!Array.isArray(items) || !total) {
      return res.status(400).json({ error: "items and total required" });
    }

    const orderNumber = await createOrderNumber();

    await setOrderStatus(orderNumber, {
      orderNumber,
      status: "pending",
      items,
      total,
      createdAt: new Date().toISOString(),
    });

    res.status(200).json({ orderNumber });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ error: "Could not create order" });
  }
}