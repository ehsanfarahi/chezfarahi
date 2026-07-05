import { kv } from "@vercel/kv";

const BUSINESS_KEY = "business:data";
const COMBOS_KEY = "business:combos";

// ─── Business data ────────────────────────────────────────────────────────────
export async function getBusinessData() {
  const raw = await kv.get(BUSINESS_KEY);
  if (!raw) {
    // First time — seed from static JSON file
    const { createRequire } = await import("module");
    const require = createRequire(import.meta.url);
    const seed = require("./business-data.json");
    await kv.set(BUSINESS_KEY, seed);
    return seed;
  }
  return raw; // @vercel/kv auto-parses JSON
}

export async function setBusinessData(data) {
  await kv.set(BUSINESS_KEY, data);
}

// ─── Combos ───────────────────────────────────────────────────────────────────
export async function getCombos() {
  const raw = await kv.get(COMBOS_KEY);
  return raw || [];
}

export async function setCombos(combos) {
  await kv.set(COMBOS_KEY, combos);
}

// ─── Order numbers (daily 3-digit counter) ────────────────────────────────────
export async function createOrderNumber() {
  const today = new Date().toISOString().slice(0, 10);
  const key = `order:counter:${today}`;
  const count = await kv.incr(key);
  await kv.expire(key, 86400);
  return String(count).padStart(3, "0");
}

// ─── Order status ─────────────────────────────────────────────────────────────
export async function setOrderStatus(orderNumber, data) {
  await kv.set(`order:data:${orderNumber}`, data, { ex: 86400 });
}

export async function getOrderStatus(orderNumber) {
  const raw = await kv.get(`order:data:${orderNumber}`);
  return raw || null;
}

// ─── Push subscriptions ───────────────────────────────────────────────────────
export async function savePushSubscription(orderNumber, subscription) {
  await kv.set(`push:sub:${orderNumber}`, subscription, { ex: 86400 });
}

export async function getPushSubscription(orderNumber) {
  const raw = await kv.get(`push:sub:${orderNumber}`);
  return raw || null;
}