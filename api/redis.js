
import { createClient } from "redis";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const BUSINESS_KEY = "business:data";
const COMBOS_KEY = "business:combos";

// Creates a fresh connection, runs the operation, then closes it
// This is the correct pattern for serverless functions
async function withRedis(fn) {
  const client = createClient({ url: process.env.REDIS_URL });
  client.on("error", (err) => console.error("Redis error:", err));
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.disconnect();
  }
}

// ─── Business data ────────────────────────────────────────────────────────────
export async function getBusinessData() {
  return withRedis(async (client) => {
    const raw = await client.get(BUSINESS_KEY);
    if (!raw) {
      const seed = require("./business-data.json");
      await client.set(BUSINESS_KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw);
  });
}

export async function setBusinessData(data) {
  return withRedis((client) =>
    client.set(BUSINESS_KEY, JSON.stringify(data))
  );
}

// ─── Combos ───────────────────────────────────────────────────────────────────
export async function getCombos() {
  return withRedis(async (client) => {
    const raw = await client.get(COMBOS_KEY);
    return raw ? JSON.parse(raw) : [];
  });
}

export async function setCombos(combos) {
  return withRedis((client) =>
    client.set(COMBOS_KEY, JSON.stringify(combos))
  );
}

// ─── Order numbers (daily 3-digit counter) ────────────────────────────────────
export async function createOrderNumber() {
  return withRedis(async (client) => {
    const today = new Date().toISOString().slice(0, 10);
    const key = `order:counter:${today}`;
    const count = await client.incr(key);
    await client.expire(key, 86400);
    return String(count).padStart(3, "0");
  });
}

// ─── Order status ─────────────────────────────────────────────────────────────
export async function setOrderStatus(orderNumber, data) {
  return withRedis((client) =>
    client.set(`order:data:${orderNumber}`, JSON.stringify(data), { EX: 86400 })
  );
}

export async function getOrderStatus(orderNumber) {
  return withRedis(async (client) => {
    const raw = await client.get(`order:data:${orderNumber}`);
    return raw ? JSON.parse(raw) : null;
  });
}

// ─── Push subscriptions ───────────────────────────────────────────────────────
export async function savePushSubscription(orderNumber, subscription) {
  return withRedis((client) =>
    client.set(`push:sub:${orderNumber}`, JSON.stringify(subscription), { EX: 86400 })
  );
}

export async function getPushSubscription(orderNumber) {
  return withRedis(async (client) => {
    const raw = await client.get(`push:sub:${orderNumber}`);
    return raw ? JSON.parse(raw) : null;
  });
}







// import { createClient } from "redis";

// let client = null;

// export async function getRedisClient() {
//   if (client && client.isOpen) return client;
//   client = createClient({ url: process.env.REDIS_URL });
//   client.on("error", (err) => console.error("Redis error:", err));
//   await client.connect();
//   return client;
// }

// const BUSINESS_KEY = "business:data";
// const COMBOS_KEY = "business:combos";

// export async function getBusinessData() {
//   const redis = await getRedisClient();
//   const raw = await redis.get(BUSINESS_KEY);
//   if (!raw) {
//     const { default: seed } = await import("./business-data.json", { with: { type: "json" } });
//     await redis.set(BUSINESS_KEY, JSON.stringify(seed));
//     return seed;
//   }
//   return JSON.parse(raw);
// }

// export async function setBusinessData(data) {
//   const redis = await getRedisClient();
//   await redis.set(BUSINESS_KEY, JSON.stringify(data));
// }

// export async function getCombos() {
//   const redis = await getRedisClient();
//   const raw = await redis.get(COMBOS_KEY);
//   if (!raw) return [];
//   return JSON.parse(raw);
// }

// export async function setCombos(combos) {
//   const redis = await getRedisClient();
//   await redis.set(COMBOS_KEY, JSON.stringify(combos));
// }

// export async function createOrderNumber() {
//   const redis = await getRedisClient();
//   const today = new Date().toISOString().slice(0, 10);
//   const key = `order:counter:${today}`;
//   const count = await redis.incr(key);
//   await redis.expire(key, 86400);
//   return String(count).padStart(3, "0");
// }

// export async function setOrderStatus(orderNumber, data) {
//   const redis = await getRedisClient();
//   await redis.set(`order:data:${orderNumber}`, JSON.stringify(data), { EX: 86400 });
// }

// export async function getOrderStatus(orderNumber) {
//   const redis = await getRedisClient();
//   const raw = await redis.get(`order:data:${orderNumber}`);
//   if (!raw) return null;
//   return JSON.parse(raw);
// }

// export async function savePushSubscription(orderNumber, subscription) {
//   const redis = await getRedisClient();
//   await redis.set(`push:sub:${orderNumber}`, JSON.stringify(subscription), { EX: 86400 });
// }

// export async function getPushSubscription(orderNumber) {
//   const redis = await getRedisClient();
//   const raw = await redis.get(`push:sub:${orderNumber}`);
//   if (!raw) return null;
//   return JSON.parse(raw);
// }






// // 222222222222222222222222222222222222222222222222222

// // import { createClient } from "redis";

// // let client = null;

// // export async function getRedisClient() {
// //   if (client && client.isOpen) return client;
// //   client = createClient({ url: process.env.REDIS_URL });
// //   client.on("error", (err) => console.error("Redis error:", err));
// //   await client.connect();
// //   return client;
// // }

// // const BUSINESS_KEY = "business:data";
// // const COMBOS_KEY = "business:combos";

// // // ---------- Business data ----------
// // export async function getBusinessData() {
// //   const redis = await getRedisClient();
// //   const raw = await redis.get(BUSINESS_KEY);
// //   if (!raw) {
// //     const { default: seed } = await import("./business-data.json", {
// //       with: { type: "json" },
// //     });
// //     await redis.set(BUSINESS_KEY, JSON.stringify(seed));
// //     return seed;
// //   }
// //   return JSON.parse(raw);
// // }

// // export async function setBusinessData(data) {
// //   const redis = await getRedisClient();
// //   await redis.set(BUSINESS_KEY, JSON.stringify(data));
// // }

// // // ---------- Combo data ----------
// // export async function getCombos() {
// //   const redis = await getRedisClient();
// //   const raw = await redis.get(COMBOS_KEY);
// //   if (!raw) return [];
// //   return JSON.parse(raw);
// // }

// // export async function setCombos(combos) {
// //   const redis = await getRedisClient();
// //   await redis.set(COMBOS_KEY, JSON.stringify(combos));
// // }




// // 111111111111111111111111111111111111111

// // import { createClient } from "redis";

// // let client = null;

// // export async function getRedisClient() {
// //   if (client && client.isOpen) return client;

// //   client = createClient({ url: process.env.REDIS_URL });

// //   client.on("error", (err) => console.error("Redis error:", err));

// //   await client.connect();
// //   return client;
// // }

// // const BUSINESS_KEY = "business:data";

// // export async function getBusinessData() {
// //   const redis = await getRedisClient();
// //   const raw = await redis.get(BUSINESS_KEY);
// //   if (!raw) {
// //     // First time — seed from the static JSON file
// //     const { default: seed } = await import("./business-data.json", { with: { type: "json" } });
// //     await redis.set(BUSINESS_KEY, JSON.stringify(seed));
// //     return seed;
// //   }
// //   return JSON.parse(raw);
// // }

// // export async function setBusinessData(data) {
// //   const redis = await getRedisClient();
// //   await redis.set(BUSINESS_KEY, JSON.stringify(data));
// // }