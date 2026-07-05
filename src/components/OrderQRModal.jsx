import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  X,
  CheckCircle,
  Clock,
  Bell,
  BellOff,
  ShoppingBag,
} from "lucide-react";
import { buildOrder, formatTime, saveCustomerOrder } from "../utils/orderUtils";
import {
  registerAndSubscribe,
  startStatusPolling,
  isPushSupported,
} from "../utils/pushUtils";


const API_URL = import.meta.env.VITE_API_URL || "";

export default function OrderQRModal({
  cart,
  open,
  onClose,
  onConfirmed,
  onOrderReady,
}) {
  const [order, setOrder] = useState(null);
  const [orderNumber, setOrderNumber] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pushStatus, setPushStatus] = useState("idle"); // idle | requesting | granted | denied
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && cart.length > 0) {
      createOrder();
    }
    if (!open) {
      setOrder(null);
      setOrderNumber(null);
      setError("");
      setPushStatus("idle");
    }
  }, [open]);

  async function createOrder() {
    setLoading(true);
    setError("");
    try {
      // 1. Get 3-digit order number from server
      const res = await fetch(`${API_URL}/api/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((i) => ({
            id: i.id,
            name: i.name,
            qty: i.qty,
            unitPrice: i.price,
            lineTotal: parseFloat((i.price * i.qty).toFixed(2)),
          })),
          total: parseFloat(
            cart.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2),
          ),
        }),
      });

      const { orderNumber: num } = await res.json();

      // 2. Build full order object
      const newOrder = { ...buildOrder(cart), orderNumber: num };

      setOrder(newOrder);
      setOrderNumber(num);

      // 3. Save to customer history
      saveCustomerOrder({ ...newOrder, orderNumber: num });

      // 4. Save pending order to localStorage for global watcher
      localStorage.setItem(
        "camion_pending_order",
        JSON.stringify({ orderNumber: num, status: "pending" }),
      );

      // 5. Start polling for status
      startStatusPolling(num, (readyNum) => {
        localStorage.setItem(
          "camion_pending_order",
          JSON.stringify({ orderNumber: readyNum, status: "ready" }),
        );
        onOrderReady?.(readyNum);
      });

      // 6. Request push notification permission
      requestPush(num);
    } catch (err) {
      setError("Impossible de créer la commande. Veuillez votre connexion.");
    } finally {
      setLoading(false);
    }
  }
  async function requestPush(num) {
    if (!isPushSupported()) return;
    setPushStatus("requesting");
    const success = await registerAndSubscribe(num);
    setPushStatus(success ? "granted" : "denied");
  }

  if (!open) return null;

  const qrValue = order ? JSON.stringify(order) : "";

  return (
    <>
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      {/* Backdrop */}
      <div className="fixed bottom-0 left-0 right-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-50" />

      {/* Modal */}
      <div className="relative w-full sm:w-auto sm:min-w-[380px] bg-char-soft rounded-t-3xl sm:rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cream/10">
          <h2 className="font-display text-lg font-semibold text-cream">
            Votre commande
          </h2>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-cream/10"
          >
            <X size={18} className="text-cream" />
          </button>
        </div>

        <div className="px-5 py-5">
          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center gap-4 py-8">
              <span className="text-5xl animate-bounce">⏳</span>
              <p className="text-mute/60 text-sm">
                Création de votre commande...
              </p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="bg-chili/15 border border-chili/30 rounded-2xl px-4 py-3 mb-4 text-chili text-sm">
              {error}
            </div>
          )}

          {/* Order ready*/}
          {order && orderNumber && (
            <>
              {/* Instruction */}
              <div className="bg-marigold/10 border border-marigold/30 rounded-2xl px-4 py-3 mb-5 flex items-start gap-3">
                <span className="text-2xl shrink-0">📱</span>
                <p className="text-sm text-mute/90 leading-snug">
                  Montrez ce QR code au comptoir. L'équipe le scannera et vous
                  serez notifié quand votre commande est prête.
                </p>
              </div>

              {/* BIG order number*/}
              <div className="flex flex-col items-center mb-5">
                <p className="text-xs text-mute/50 uppercase tracking-widest mb-1">
                  Numéro de commande
                </p>
                <div className="relative">
                  <p className="font-display font-black text-[5rem] text-marigold leading-none tracking-tight">
                    {orderNumber}
                  </p>
                  <div className="absolute inset-0 blur-2xl bg-marigold/15 -z-10 scale-150 rounded-full" />
                </div>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-2xl shadow-xl shadow-black/30">
                  <QRCodeSVG
                    value={qrValue}
                    size={180}
                    level="M"
                    fgColor="#1B1411"
                    bgColor="#FFFFFF"
                  />
                </div>
              </div>

              {/* Push notification status */}
              <div className="flex items-center justify-center gap-2 mb-4 text-xs">
                {pushStatus === "granted" && (
                  <span className="flex items-center gap-1.5 text-herb">
                    <Bell size={13} /> Vous serez notifié quand c'est prêt
                  </span>
                )}
                {pushStatus === "denied" && (
                  <span className="flex items-center gap-1.5 text-mute/50">
                    <BellOff size={13} />
                    Notifications désactivées - restez sur l'appli
                  </span>
                )}
                {pushStatus === "requesting" && (
                  <span className="flex items-center gap-1.5 text-mute/60 animate-pulse">
                    <Bell size={13} /> Activation des notifications...
                  </span>
                )}
                {pushStatus === "idle" && (
                  <span className="flex items-center gap-1.5 text-mute/50">
                    <Clock size={13} /> En attente de confirmation...
                  </span>
                )}
              </div>

              {/* Order summary */}
              <div className="bg-char rounded-2xl overflow-hidden divide-y divide-cream/5 mb-4">
                {cart.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-2.5"
                  >
                    <span className="text-sm text-cream">
                      {item.qty > 1 ? `${item.qty}× ` : ""}
                      {item.name}
                    </span>
                    <span className="font-mono text-sm text-mute/70">
                      {(item.price * item.qty).toFixed(2)}€
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between px-4 py-3 bg-marigold/10">
                  <span className="text-sm font-semibold text-cream">
                    Total
                  </span>
                  <span className="font-mono font-bold text-marigold">
                    {cart.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2)}€
                  </span>
                </div>
              </div>

              {/* Timestamp */}
              <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-mute/40">
                <Clock size={12} />
                Commandé à {formatTime(order.timestamp)}
              </div>

              {/* Done button */}
              <button
                onClick={() => {
                  onConfirmed?.();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 bg-herb/20 hover:bg-herb/30 border border-herb/40 text-herb font-semibold py-3 rounded-full transition"
              >
                <CheckCircle size={17} />
                Commande confirmée
              </button>
            </>
          )}
        </div>
      </div>
      {/* </div> */}
    </>
  );
}
