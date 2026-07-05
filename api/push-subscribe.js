import { savePushSubscription } from "./redis.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { orderNumber, subscription } = req.body;

    if (!orderNumber || !subscription) {
      return res.status(400).json({ error: "orderNumber and subscription required" });
    }

    await savePushSubscription(orderNumber, subscription);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Push subscribe error:", err);
    res.status(500).json({ error: "Could not save subscription" });
  }
}



// import { getOrderStatus } from "./redis.js";

// export default async function handler(req, res) {
//   res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "*");
//   res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type");

//   if (req.method === "OPTIONS") return res.status(200).end();
//   if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

//   const { number } = req.query;

//   if (!number) return res.status(400).json({ error: "Order number required" });

//   try {
//     const order = await getOrderStatus(number);
//     if (!order) return res.status(404).json({ error: "Order not found" });
//     res.status(200).json({ orderNumber: order.orderNumber, status: order.status });
//   } catch (err) {
//     console.error("Order status error:", err);
//     res.status(500).json({ error: "Could not fetch order status" });
//   }
// }