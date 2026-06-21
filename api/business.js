import businessData from "./business-data.json" with { type: "json" };

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "*");
  res.status(200).json(businessData);
}