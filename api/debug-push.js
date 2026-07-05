import webPush from "web-push";
import { getPushSubscription, getOrderStatus } from "./redis.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { number } = req.query;
  const report = {};

  // 1. Check env vars
  report.env = {
    VAPID_EMAIL: process.env.VAPID_EMAIL || "NOT SET",
    VITE_VAPID_PUBLIC_KEY: process.env.VITE_VAPID_PUBLIC_KEY
      ? process.env.VITE_VAPID_PUBLIC_KEY.slice(0, 20) + "..."
      : "NOT SET",
    VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY ? "SET" : "NOT SET",
    ADMIN_TOKEN: process.env.ADMIN_TOKEN ? "SET" : "NOT SET",
    REDIS_URL: process.env.REDIS_URL ? "SET" : "NOT SET",
  };

  // 2. Check order in Redis (if number provided)
  if (number) {
    try {
      const order = await getOrderStatus(number);
      report.order = order
        ? { found: true, status: order.status, orderNumber: order.orderNumber }
        : { found: false };
    } catch (err) {
      report.order = { error: err.message };
    }

    // 3. Check push subscription in Redis
    try {
      const sub = await getPushSubscription(number);
      report.pushSubscription = sub
        ? { found: true, endpoint: sub.endpoint?.slice(0, 50) + "..." }
        : { found: false, message: "No subscription saved for this order number" };
    } catch (err) {
      report.pushSubscription = { error: err.message };
    }

    // 4. Try sending a test push if subscription exists
    if (report.pushSubscription?.found) {
      try {
        webPush.setVapidDetails(
          process.env.VAPID_EMAIL,
          process.env.VITE_VAPID_PUBLIC_KEY,
          process.env.VAPID_PRIVATE_KEY
        );
        const sub = await getPushSubscription(number);
        await webPush.sendNotification(
          sub,
          JSON.stringify({
            title: "🧪 Test notification",
            body: `Test pour commande n°${number}`,
            orderNumber: number,
          })
        );
        report.testPush = { sent: true };
      } catch (err) {
        report.testPush = { sent: false, error: err.message };
      }
    }
  } else {
    report.note = "Add ?number=XXX to test a specific order (e.g. ?number=001)";
  }

  res.status(200).json(report);
}