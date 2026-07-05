const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;
const API_URL = import.meta.env.VITE_API_URL || "";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function isPushSupported() {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

export async function registerAndSubscribe(orderNumber) {
  if (!isPushSupported()) {
    console.warn("Push not supported on this device");
    return false;
  }

  if (!VAPID_PUBLIC_KEY) {
    console.warn("VITE_VAPID_PUBLIC_KEY not set");
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.info("Push permission denied by user");
      return false;
    }

    const registration = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    // Save subscription tied to this order number
    await fetch(`${API_URL}/api/push-subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber, subscription }),
    });

    return true;
  } catch (err) {
    console.error("Push registration failed:", err);
    return false;
  }
}

export async function startStatusPolling(orderNumber, onReady, intervalMs = 3000) {
  const poll = async () => {
    try {
      const res = await fetch(`${API_URL}/api/order-status?number=${orderNumber}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.status === "ready") {
        onReady(orderNumber);
        return; // stop polling
      }
      // schedule next poll
      setTimeout(poll, intervalMs);
    } catch {
      // network error — retry
      setTimeout(poll, intervalMs * 2);
    }
  };

  setTimeout(poll, intervalMs);
}