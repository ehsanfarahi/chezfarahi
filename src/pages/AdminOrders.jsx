import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  getScannedOrders,
  saveScannedOrder,
  updateOrderStatus,
  clearAllOrders,
  formatTime,
} from "../utils/orderUtils";
import {
  ScanLine,
  CheckCircle,
  Clock,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null); // { type: "success"|"duplicate"|"error", message }
  const [expandedId, setExpandedId] = useState(null);
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);

  useEffect(() => {
    setOrders(getScannedOrders());
  }, []);

  const refreshOrders = () => setOrders(getScannedOrders());

  // Start QR scanner
  const startScanner = async () => {
    setScanning(true);
    setScanResult(null);
    setTimeout(async () => {
      try {
        html5QrRef.current = new Html5Qrcode("qr-reader");
        await html5QrRef.current.start(
          { facingMode: "environment" }, // rear camera
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => handleScanSuccess(decodedText),
          () => {} // ignore ongoing errors
        );
      } catch (err) {
        console.error("Scanner error:", err);
        setScanResult({ type: "error", message: "Impossible d'accéder à la caméra." });
        setScanning(false);
      }
    }, 100);
  };

  const stopScanner = async () => {
    if (html5QrRef.current) {
      try {
        await html5QrRef.current.stop();
        html5QrRef.current.clear();
      } catch {}
    }
    setScanning(false);
  };

  const handleScanSuccess = async (decodedText) => {
    await stopScanner();
    try {
      const order = JSON.parse(decodedText);
      // Validate it looks like one of our orders
      if (!order.orderId || !order.items || !order.total) {
        setScanResult({ type: "error", message: "QR invalide — ce n'est pas une commande Le Camion Doré." });
        return;
      }
      const saved = saveScannedOrder(order);
      if (saved) {
        setScanResult({ type: "success", message: `Commande ${order.orderId} enregistrée !`, order });
        refreshOrders();
        setExpandedId(order.orderId); // auto-expand the new order
      } else {
        setScanResult({ type: "duplicate", message: "Cette commande a déjà été scannée." });
      }
    } catch {
      setScanResult({ type: "error", message: "QR illisible — demandez au client de rouvrir son panier." });
    }
  };

  const markDone = (orderId) => {
    updateOrderStatus(orderId, "done");
    refreshOrders();
  };

  const markPending = (orderId) => {
    updateOrderStatus(orderId, "pending");
    refreshOrders();
  };

  const deleteOrder = (orderId) => {
    const updated = getScannedOrders().filter((o) => o.orderId !== orderId);
    localStorage.setItem("camion_orders", JSON.stringify(updated));
    refreshOrders();
  };

  const handleClearAll = () => {
    if (window.confirm("Effacer toutes les commandes ? (fin de journée)")) {
      clearAllOrders();
      refreshOrders();
    }
  };

  const pending = orders.filter((o) => o.status === "pending");
  const done = orders.filter((o) => o.status === "done");

  return (
    <div className="min-h-screen bg-char text-cream px-4 py-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-marigold text-xs font-semibold uppercase tracking-wider mb-1">
            Admin
          </p>
          <h1 className="font-display text-2xl font-bold">Commandes</h1>
        </div>
        {orders.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 text-xs text-mute/60 hover:text-chili border border-cream/10 hover:border-chili/40 px-3 py-2 rounded-full transition"
          >
            <Trash2 size={13} /> Fin de journée
          </button>
        )}
      </div>

      {/* Scanner button */}
      {!scanning && (
        <button
          onClick={startScanner}
          className="w-full flex items-center justify-center gap-3 bg-marigold hover:bg-marigold-light text-char font-semibold py-4 rounded-2xl mb-6 transition active:scale-95 shadow-lg shadow-marigold/20"
        >
          <ScanLine size={22} />
          Scanner une commande
        </button>
      )}

      {/* Scanner viewport */}
      {scanning && (
        <div className="relative mb-6 rounded-2xl overflow-hidden bg-char-soft">
          <div id="qr-reader" className="w-full" />
          <button
            onClick={stopScanner}
            className="absolute top-3 right-3 w-9 h-9 bg-char/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-char"
          >
            <X size={18} className="text-cream" />
          </button>
          <p className="text-center text-xs text-mute/60 py-3">
            Pointez la caméra vers le QR code du client
          </p>
        </div>
      )}

      {/* Scan result feedback */}
      {scanResult && (
        <div
          className={`flex items-start gap-3 rounded-2xl px-4 py-3 mb-5 border ${
            scanResult.type === "success"
              ? "bg-herb/15 border-herb/40 text-herb"
              : scanResult.type === "duplicate"
              ? "bg-marigold/10 border-marigold/30 text-marigold"
              : "bg-chili/15 border-chili/30 text-chili"
          }`}
        >
          <span className="text-xl shrink-0">
            {scanResult.type === "success" ? "✅" : scanResult.type === "duplicate" ? "⚠️" : "❌"}
          </span>
          <div>
            <p className="text-sm font-semibold">{scanResult.message}</p>
            {scanResult.type === "success" && scanResult.order && (
              <p className="text-xs mt-0.5 opacity-80">
                {scanResult.order.items.length} article{scanResult.order.items.length > 1 ? "s" : ""} · {scanResult.order.total.toFixed(2)}€
              </p>
            )}
          </div>
          <button onClick={() => setScanResult(null)} className="ml-auto shrink-0 opacity-60 hover:opacity-100">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Pending orders */}
      {pending.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-marigold" />
            <h2 className="font-display font-semibold text-marigold text-sm uppercase tracking-wider">
              En attente ({pending.length})
            </h2>
          </div>
          <div className="space-y-3">
            {pending.map((order) => (
              <OrderCard
                key={order.orderId}
                order={order}
                expanded={expandedId === order.orderId}
                onToggle={() => setExpandedId(expandedId === order.orderId ? null : order.orderId)}
                onMarkDone={() => markDone(order.orderId)}
                onMarkPending={() => markPending(order.orderId)}
                onDelete={() => deleteOrder(order.orderId)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Done orders */}
      {done.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={14} className="text-herb" />
            <h2 className="font-display font-semibold text-herb text-sm uppercase tracking-wider">
              Terminées ({done.length})
            </h2>
          </div>
          <div className="space-y-3 opacity-70">
            {done.map((order) => (
              <OrderCard
                key={order.orderId}
                order={order}
                expanded={expandedId === order.orderId}
                onToggle={() => setExpandedId(expandedId === order.orderId ? null : order.orderId)}
                onMarkDone={() => markDone(order.orderId)}
                onMarkPending={() => markPending(order.orderId)}
                onDelete={() => deleteOrder(order.orderId)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {orders.length === 0 && !scanning && (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <span className="text-5xl">📭</span>
          <p className="font-display text-lg text-cream">Aucune commande pour l'instant</p>
          <p className="text-sm text-mute/60">Scannez le QR code d'un client pour commencer</p>
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, expanded, onToggle, onMarkDone, onMarkPending, onDelete }) {
  const isDone = order.status === "done";

  return (
    <div className={`bg-char-soft rounded-2xl overflow-hidden border transition ${
      isDone ? "border-herb/20" : "border-marigold/20"
    }`}>
      {/* Card header - always visible */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${isDone ? "bg-herb" : "bg-marigold animate-pulse"}`} />
          <div>
            <p className="font-mono text-xs text-mute/50">{order.orderId}</p>
            <p className="text-sm font-semibold text-cream">
              {order.items.length} article{order.items.length > 1 ? "s" : ""} ·{" "}
              <span className="text-marigold font-mono">{order.total.toFixed(2)}€</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-mute/50">{formatTime(order.scannedAt)}</span>
          {expanded ? <ChevronUp size={15} className="text-mute/50" /> : <ChevronDown size={15} className="text-mute/50" />}
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-cream/5 px-4 py-3 space-y-3">
          {/* Items */}
          <div className="space-y-1.5">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-mute">
                  {item.qty > 1 ? `${item.qty}× ` : ""}{item.name}
                </span>
                <span className="font-mono text-mute/70">{item.lineTotal.toFixed(2)}€</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-1.5 border-t border-cream/5">
              <span className="text-sm font-semibold text-cream">Total</span>
              <span className="font-mono font-bold text-marigold">{order.total.toFixed(2)}€</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            {isDone ? (
              <button
                onClick={onMarkPending}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs border border-cream/15 text-mute hover:text-cream py-2 rounded-full transition"
              >
                <RefreshCw size={12} /> Remettre en attente
              </button>
            ) : (
              <button
                onClick={onMarkDone}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-herb/20 hover:bg-herb/30 border border-herb/40 text-herb font-semibold py-2 rounded-full transition"
              >
                <CheckCircle size={13} /> Marquer comme prête
              </button>
            )}
            <button
              onClick={onDelete}
              className="w-9 h-9 flex items-center justify-center border border-cream/10 hover:border-chili/40 text-mute/50 hover:text-chili rounded-full transition"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
