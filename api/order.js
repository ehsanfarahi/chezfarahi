import { createOrderNumber, saveOrder, getBusinessData } from "./redis.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
<<<<<<< HEAD
    const { items, total, note } = req.body;

    if (!Array.isArray(items) || !total) {
=======
    const { items, total, note, customerName, customerPhone } = req.body;
    if (!Array.isArray(items) || total === undefined) {
>>>>>>> 393817f8858bbe4ffc92642f0f2f8cbadb6b6707
      return res.status(400).json({ error: "items and total required" });
    }

    const today       = new Date().toISOString().slice(0, 10);
    const orderNumber = await createOrderNumber(today);

    // Compact date: 20260720
    const compactDate = today.replace(/-/g, "");
    // Unique reference readable by admin: 20260720-042
    const uniqueRef   = `${compactDate}-${orderNumber}`;
    // QR payload: CF:20260720:042  (18 chars → tiny QR)
    const qrPayload   = `CF:${compactDate}:${orderNumber}`;

    const orderData = {
      orderNumber,
      uniqueRef,
      qrPayload,
      date:          today,
      status:        "pending",
      adminConfirmed: false,  // becomes true when admin scans in QR mode
      items,
      total,
<<<<<<< HEAD
      note: note || "",
      createdAt: new Date().toISOString(),
    });
=======
      note:          note || "",
      customerName:  customerName || "",
      customerPhone: customerPhone || "",
      createdAt:     new Date().toISOString(),
    };
>>>>>>> 393817f8858bbe4ffc92642f0f2f8cbadb6b6707

    await saveOrder(today, orderNumber, orderData);

    res.status(200).json({ orderNumber, uniqueRef, qrPayload });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ error: "Could not create order" });
  }
}











// import { createOrderNumber, setOrderStatus } from "./redis.js";

// export default async function handler(req, res) {
//   res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "*");
//   res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type");

//   if (req.method === "OPTIONS") return res.status(200).end();
//   if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

//   try {
//     const { items, total } = req.body;

//     if (!Array.isArray(items) || !total) {
//       return res.status(400).json({ error: "items and total required" });
//     }

//     const orderNumber = await createOrderNumber();

//     await setOrderStatus(orderNumber, {
//       orderNumber,
//       status: "pending",
//       items,
//       total,
//       createdAt: new Date().toISOString(),
//     });

//     res.status(200).json({ orderNumber });
//   } catch (err) {
//     console.error("Create order error:", err);
//     res.status(500).json({ error: "Could not create order" });
//   }
// }