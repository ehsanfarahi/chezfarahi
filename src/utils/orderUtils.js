// Generates a unique order ID like ORD-1719432000-X7K2
export function generateOrderId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

// Builds the full order object that gets encoded into the QR
export function buildOrder(cart) {
  return {
    orderId: generateOrderId(),
    timestamp: new Date().toISOString(),
    items: cart.map((item) => ({
      id: item.id,
      name: item.name,
      qty: item.qty,
      unitPrice: item.price,
      lineTotal: parseFloat((item.price * item.qty).toFixed(2)),
    })),
    total: parseFloat(
      cart.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2)
    ),
  };
}

// Saves a scanned order to localStorage (admin side)
export function saveScannedOrder(order) {
  const existing = getScannedOrders();
  // Avoid duplicates if same QR is scanned twice
  if (existing.find((o) => o.orderId === order.orderId)) return false;
  const updated = [{ ...order, scannedAt: new Date().toISOString(), status: "pending" }, ...existing];
  localStorage.setItem("camion_orders", JSON.stringify(updated));
  return true;
}

// Gets all scanned orders from localStorage
export function getScannedOrders() {
  try {
    return JSON.parse(localStorage.getItem("camion_orders") || "[]");
  } catch {
    return [];
  }
}

// Updates order status (pending → done)
export function updateOrderStatus(orderId, status) {
  const orders = getScannedOrders();
  const updated = orders.map((o) => (o.orderId === orderId ? { ...o, status } : o));
  localStorage.setItem("camion_orders", JSON.stringify(updated));
}

// Clears all orders (end of day reset)
export function clearAllOrders() {
  localStorage.removeItem("camion_orders");
}

// Formats timestamp for display
export function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}


// Save completed order to customer's local history
export function saveCustomerOrder(order) {
  const existing = getCustomerOrders();
  const updated = [{ ...order, savedAt: new Date().toISOString() }, ...existing];
  localStorage.setItem("camion_customer_orders", JSON.stringify(updated.slice(0, 50))); // keep last 50
}

// Get customer's order history
export function getCustomerOrders() {
  try {
    return JSON.parse(localStorage.getItem("camion_customer_orders") || "[]");
  } catch {
    return [];
  }
}

// Clear customer history
export function clearCustomerOrders() {
  localStorage.removeItem("camion_customer_orders");
}