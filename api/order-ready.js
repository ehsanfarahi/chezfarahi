import webPush from "web-push";
import { getOrderStatus, setOrderStatus, getPushSubscription } from "./redis.js";

webPush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VITE_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

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
    const { orderNumber } = req.body;

    if (!orderNumber) return res.status(400).json({ error: "orderNumber required" });

    // Update status in Redis
    const order = await getOrderStatus(orderNumber);
    if (!order) return res.status(404).json({ error: "Order not found" });

    await setOrderStatus(orderNumber, { ...order, status: "ready", readyAt: new Date().toISOString() });

    // Send push notification
    const subscription = await getPushSubscription(orderNumber);
    if (subscription) {
      const payload = JSON.stringify({
        title: "🍔 Le Camion Doré",
        body: `Votre commande n°${orderNumber} est prête ! Venez la récupérer.`,
        orderNumber,
      });

      try {
        await webPush.sendNotification(subscription, payload);
      } catch (pushErr) {
        // Push failed (subscription expired etc.) — order is still marked ready
        console.warn("Push notification failed:", pushErr.message);
      }
    }

    res.status(200).json({ ok: true, pushed: !!subscription });
  } catch (err) {
    console.error("Order ready error:", err);
    res.status(500).json({ error: "Could not mark order ready" });
  }
}