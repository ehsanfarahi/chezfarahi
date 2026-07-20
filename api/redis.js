import { createClient } from "redis";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

async function withRedis(fn) {
  const r = createClient({ url: process.env.REDIS_URL });
  r.on("error", (err) => console.error("Redis error:", err));
  await r.connect();
  try { return await fn(r); }
  finally { await r.disconnect(); }
}

const BUSINESS_KEY = "business:data";
const COMBOS_KEY   = "business:combos";

export async function getBusinessData() {
  return withRedis(async (r) => {
    const raw = await r.get(BUSINESS_KEY);
    if (!raw) {
      const seed = require("./business-data.json");
      await r.set(BUSINESS_KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw);
  });
}

export async function setBusinessData(data) {
  return withRedis((r) => r.set(BUSINESS_KEY, JSON.stringify(data)));
}

export async function getCombos() {
  return withRedis(async (r) => {
    const raw = await r.get(COMBOS_KEY);
    return raw ? JSON.parse(raw) : [];
  });
}

export async function setCombos(combos) {
  return withRedis((r) => r.set(COMBOS_KEY, JSON.stringify(combos)));
}

export async function getMenuDuJour() {
  return withRedis(async (r) => {
    const raw = await r.get("menu:du:jour");
    return raw ? JSON.parse(raw) : null;
  });
}

export async function setMenuDuJour(data) {
  return withRedis((r) => r.set("menu:du:jour", JSON.stringify(data)));
}

// ─── Order counter (resets daily) ────────────────────────────────────────────
export async function createOrderNumber(date) {
  return withRedis(async (r) => {
    const day   = date || new Date().toISOString().slice(0, 10);
    const key   = `order:counter:${day}`;
    const count = await r.incr(key);
    await r.expire(key, 86400 * 2);
    return String(count).padStart(3, "0");
  });
}

// ─── Date-keyed order storage ─────────────────────────────────────────────────
// Key: order:data:2026-07-20:042
// Unique ref (for customer/admin): 20260720-042

function orderKey(date, num)  { return `order:data:${date}:${num}`; }
function listKey(date)        { return `orders:list:${date}`; }

export async function saveOrder(date, orderNumber, data) {
  return withRedis(async (r) => {
    await r.set(orderKey(date, orderNumber), JSON.stringify(data), { EX: 86400 * 7 });
    const existing = await r.lRange(listKey(date), 0, -1);
    if (!existing.includes(orderNumber)) {
      await r.lPush(listKey(date), orderNumber);
      await r.expire(listKey(date), 86400 * 7);
    }
  });
}

export async function getOrder(date, orderNumber) {
  return withRedis(async (r) => {
    const raw = await r.get(orderKey(date, orderNumber));
    return raw ? JSON.parse(raw) : null;
  });
}

export async function updateOrder(date, orderNumber, fields) {
  return withRedis(async (r) => {
    const raw = await r.get(orderKey(date, orderNumber));
    if (!raw) return null;
    const updated = { ...JSON.parse(raw), ...fields, updatedAt: new Date().toISOString() };
    await r.set(orderKey(date, orderNumber), JSON.stringify(updated), { EX: 86400 * 7 });
    return updated;
  });
}

export async function getAllOrdersForDate(date) {
  return withRedis(async (r) => {
    const numbers = await r.lRange(listKey(date), 0, -1);
    if (!numbers.length) return [];
    const orders = await Promise.all(
      numbers.map(async (num) => {
        const raw = await r.get(orderKey(date, num));
        return raw ? JSON.parse(raw) : null;
      })
    );
    return orders
      .filter(Boolean)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  });
}

export async function deleteOrder(date, orderNumber) {
  return withRedis(async (r) => {
    await r.del(orderKey(date, orderNumber));
    await r.del(`push:sub:${date}:${orderNumber}`);
    await r.lRem(listKey(date), 0, orderNumber);
  });
}

// ─── Push subscriptions ───────────────────────────────────────────────────────
export async function savePushSubscription(date, orderNumber, sub) {
  return withRedis((r) =>
    r.set(`push:sub:${date}:${orderNumber}`, JSON.stringify(sub), { EX: 86400 * 2 })
  );
}

export async function getPushSubscription(date, orderNumber) {
  return withRedis(async (r) => {
    const raw = await r.get(`push:sub:${date}:${orderNumber}`);
    return raw ? JSON.parse(raw) : null;
  });
}

// ─── Parse order reference ────────────────────────────────────────────────────
// Supports: "CF:20260720:042" | "20260720-042" | "042" (assumes today)
export function parseOrderRef(ref) {
  const s = (ref || "").trim();

  if (s.startsWith("CF:")) {
    const [, d, n] = s.split(":");
    if (d && n) {
      const date = `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`;
      return { date, orderNumber: n.padStart(3, "0") };
    }
  }

  const longMatch = s.match(/^(\d{8})-(\d{1,3})$/);
  if (longMatch) {
    const d = longMatch[1];
    return {
      date: `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`,
      orderNumber: longMatch[2].padStart(3, "0"),
    };
  }

  if (/^\d{1,3}$/.test(s)) {
    return {
      date: new Date().toISOString().slice(0, 10),
      orderNumber: s.padStart(3, "0"),
    };
  }

  return null;
}

// Legacy (old keys without date — backward compat)
export async function getOrderLegacy(orderNumber) {
  return withRedis(async (r) => {
    const raw = await r.get(`order:data:${orderNumber}`);
    return raw ? JSON.parse(raw) : null;
  });
}













// import { createClient } from "redis";
// import { createRequire } from "module";

// const require = createRequire(import.meta.url);

// const BUSINESS_KEY = "business:data";
// const COMBOS_KEY = "business:combos";

// // Creates a fresh connection, runs the operation, then closes it
// // This is the correct pattern for serverless functions
// async function withRedis(fn) {
//   const client = createClient({ url: process.env.REDIS_URL });
//   client.on("error", (err) => console.error("Redis error:", err));
//   await client.connect();
//   try {
//     return await fn(client);
//   } finally {
//     await client.disconnect();
//   }
// }

// // ─── Business data ────────────────────────────────────────────────────────────
// export async function getBusinessData() {
//   return withRedis(async (client) => {
//     const raw = await client.get(BUSINESS_KEY);
//     if (!raw) {
//       const seed = require("./business-data.json");
//       await client.set(BUSINESS_KEY, JSON.stringify(seed));
//       return seed;
//     }
//     return JSON.parse(raw);
//   });
// }

// export async function setBusinessData(data) {
//   return withRedis((client) =>
//     client.set(BUSINESS_KEY, JSON.stringify(data))
//   );
// }

// // ─── Combos ───────────────────────────────────────────────────────────────────
// export async function getCombos() {
//   return withRedis(async (client) => {
//     const raw = await client.get(COMBOS_KEY);
//     return raw ? JSON.parse(raw) : [];
//   });
// }

// export async function setCombos(combos) {
//   return withRedis((client) =>
//     client.set(COMBOS_KEY, JSON.stringify(combos))
//   );
// }

// // ─── Order numbers (daily 3-digit counter) ────────────────────────────────────
// export async function createOrderNumber() {
//   return withRedis(async (client) => {
//     const today = new Date().toISOString().slice(0, 10);
//     const key = `order:counter:${today}`;
//     const count = await client.incr(key);
//     await client.expire(key, 86400);
//     return String(count).padStart(3, "0");
//   });
// }

// // ─── Order status ─────────────────────────────────────────────────────────────
// export async function setOrderStatus(orderNumber, data) {
//   return withRedis((client) =>
//     client.set(`order:data:${orderNumber}`, JSON.stringify(data), { EX: 86400 })
//   );
// }

// export async function getOrderStatus(orderNumber) {
//   return withRedis(async (client) => {
//     const raw = await client.get(`order:data:${orderNumber}`);
//     return raw ? JSON.parse(raw) : null;
//   });
// }

// // ─── Push subscriptions ───────────────────────────────────────────────────────
// export async function savePushSubscription(orderNumber, subscription) {
//   return withRedis((client) =>
//     client.set(`push:sub:${orderNumber}`, JSON.stringify(subscription), { EX: 86400 })
//   );
// }

// export async function getPushSubscription(orderNumber) {
//   return withRedis(async (client) => {
//     const raw = await client.get(`push:sub:${orderNumber}`);
//     return raw ? JSON.parse(raw) : null;
//   });
// }


// // ─── Menu du Jour ─────────────────────────────────────────────────────────────
// export async function getMenuDuJour() {
//   return withRedis(async (client) => {
//     const raw = await client.get("menu:du:jour");
//     return raw ? JSON.parse(raw) : null;
//   });
// }

// export async function setMenuDuJour(data) {
//   return withRedis((client) =>
//     client.set("menu:du:jour", JSON.stringify(data))
//   );
// }







