// import businessData from "./business-data.json" with { type: "json" };

// export default function handler(req, res) {
//   res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "*");
//   res.status(200).json(businessData);
// }


import { getBusinessData } from "./redis.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const data = await getBusinessData();
    res.status(200).json(data);
  } catch (err) {
    console.error("business error:", err);
    res.status(500).json({ error: "Could not load business data" });
  }
}