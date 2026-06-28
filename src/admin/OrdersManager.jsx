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
  Filter,
} from "lucide-react";

export default function OrdersManager() {
  const [orders, setOrders] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState("all"); // all | pending | done
  const html5QrRef = useRef(null);

  useEffect(() => {
    setOrders(getScannedOrders());
    const interval = setInterval(() => setOrders(getScannedOrders()), 3000);
    return () => clearInterval(interval);
  }, []);

  const refreshOrders = () => setOrders(getScannedOrders());

  const startScanner = async () => {
    setScanning(true);
    setScanResult(null);
    setTimeout(async () => {
      try {
        html5QrRef.current = new Html5Qrcode("qr-reader-admin");
        await html5QrRef.current.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (text) => handleScanSuccess(text),
          () => {}
        );
      } catch (err) {
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

  const handleScanSuccess = async (text) => {
    await stopScanner();
    try {
      const order = JSON.parse(text);
      if (!order.orderId || !order.items || !order.total) {
        setScanResult({ type: "error", message: "QR invalide." });
        return;
      }
      const saved = saveScannedOrder(order);
      if (saved) {
        setScanResult({ type: "success", message: `Commande ${order.orderId} ajoutée !`, order });
        refreshOrders();
        setExpandedId(order.orderId);
        setFilter("pending");
      } else {
        setScanResult({ type: "duplicate", message: "Commande déjà scannée." });
      }
    } catch {
      setScanResult({ type: "error", message: "QR illisible — demandez au client de réafficher." });
    }
  };

  const markDone = (id) => { updateOrderStatus(id, "done"); refreshOrders(); };
  const markPending = (id) => { updateOrderStatus(id, "pending"); refreshOrders(); };
  const deleteOrder = (id) => {
    const updated = getScannedOrders().filter((o) => o.orderId !== id);
    localStorage.setItem("camion_orders", JSON.stringify(updated));
    refreshOrders();
  };

  const handleClearAll = () => {
    if (window.confirm("Effacer toutes les commandes ?")) {
      clearAllOrders();
      refreshOrders();
    }
  };

  const pending = orders.filter((o) => o.status === "pending");
  const done = orders.filter((o) => o.status === "done");
  const displayed = filter === "pending" ? pending : filter === "done" ? done : orders;

  const todayRevenue = orders
    .filter((o) => (o.scannedAt || "").slice(0, 10) === new Date().toISOString().slice(0, 10))
    .reduce((s, o) => s + o.total, 0);

  return (
    <div className="text-cream max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-marigold text-xs font-semibold uppercase tracking-widest mb-1">Admin</p>
          <h1 className="font-display text-3xl font-bold">Commandes</h1>
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

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "En attente", value: pending.length, color: "text-marigold" },
          { label: "Terminées", value: done.length, color: "text-herb" },
          { label: "Recettes", value: `${todayRevenue.toFixed(2)}€`, color: "text-cream" },
        ].map((s) => (
          <div key={s.label} className="bg-char-soft rounded-xl p-3 text-center border border-cream/5">
            <p className={`font-mono font-bold text-lg ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-mute/50 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Scan button */}
      {!scanning && (
        <button
          onClick={startScanner}
          className="w-full flex items-center justify-center gap-3 bg-marigold hover:bg-marigold-light text-char font-semibold py-4 rounded-2xl mb-5 transition active:scale-95 shadow-lg shadow-marigold/20"
        >
          <ScanLine size={22} /> Scanner une commande
        </button>
      )}

      {/* Scanner */}
      {scanning && (
        <div className="relative mb-5 rounded-2xl overflow-hidden bg-char-soft border border-cream/10">
          <div id="qr-reader-admin" className="w-full" />
          <button
            onClick={stopScanner}
            className="absolute top-3 right-3 w-9 h-9 bg-char/80 backdrop-blur rounded-full flex items-center justify-center"
          >
            <X size={18} className="text-cream" />
          </button>
          <p className="text-center text-xs text-mute/60 py-3">
            Pointez la caméra vers le QR code du client
          </p>
        </div>
      )}

      {/* Scan result */}
      {scanResult && (
        <div className={`flex items-start gap-3 rounded-2xl px-4 py-3 mb-4 border ${
          scanResult.type === "success" ? "bg-herb/15 border-herb/40 text-herb"
          : scanResult.type === "duplicate" ? "bg-marigold/10 border-marigold/30 text-marigold"
          : "bg-chili/15 border-chili/30 text-chili"
        }`}>
          <span className="text-xl shrink-0">
            {scanResult.type === "success" ? "✅" : scanResult.type === "duplicate" ? "⚠️" : "❌"}
          </span>
          <p className="text-sm font-medium flex-1">{scanResult.message}</p>
          <button onClick={() => setScanResult(null)}><X size={15} className="opacity-60" /></button>
        </div>
      )}

      {/* Filter tabs */}
      {orders.length > 0 && (
        <div className="flex gap-2 mb-4">
          {[
            { id: "all", label: `Toutes (${orders.length})` },
            { id: "pending", label: `En attente (${pending.length})` },
            { id: "done", label: `Terminées (${done.length})` },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`text-xs px-3 py-1.5 rounded-full border transition ${
                filter === f.id
                  ? "bg-marigold text-char border-marigold"
                  : "border-cream/15 text-mute hover:text-cream"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Orders list */}
      <div className="space-y-3">
        {displayed.map((order) => {
          const isDone = order.status === "done";
          const isExpanded = expandedId === order.orderId;
          return (
            <div
              key={order.orderId}
              className={`bg-char-soft rounded-2xl overflow-hidden border transition ${
                isDone ? "border-herb/15 opacity-75" : "border-marigold/20"
              }`}
            >
              <div
                className="flex items-center justify-between px-4 py-3.5 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : order.orderId)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    isDone ? "bg-herb" : "bg-marigold animate-pulse"
                  }`} />
                  <div>
                    <p className="font-mono text-[10px] text-mute/40">{order.orderId}</p>
                    <p className="text-sm font-semibold text-cream">
                      {order.items?.length} article{order.items?.length > 1 ? "s" : ""}{" "}
                      <span className="text-marigold font-mono">· {order.total.toFixed(2)}€</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-mute/40">{formatTime(order.scannedAt)}</span>
                  {isExpanded ? <ChevronUp size={14} className="text-mute/40" /> : <ChevronDown size={14} className="text-mute/40" />}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-cream/5 px-4 pb-4 pt-3">
                  <div className="space-y-1.5 mb-4">
                    {order.items?.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-mute/80">
                          {item.qty > 1 ? `${item.qty}× ` : ""}{item.name}
                        </span>
                        <span className="font-mono text-xs text-mute/50">
                          {item.lineTotal.toFixed(2)}€
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-1.5 border-t border-cream/5">
                      <span className="text-sm font-semibold text-cream">Total</span>
                      <span className="font-mono font-bold text-marigold">{order.total.toFixed(2)}€</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {isDone ? (
                      <button
                        onClick={() => markPending(order.orderId)}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs border border-cream/15 text-mute hover:text-cream py-2 rounded-full transition"
                      >
                        <RefreshCw size={12} /> Remettre en attente
                      </button>
                    ) : (
                      <button
                        onClick={() => markDone(order.orderId)}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-herb/20 hover:bg-herb/30 border border-herb/40 text-herb font-semibold py-2.5 rounded-full transition"
                      >
                        <CheckCircle size={13} /> Marquer comme prête ✓
                      </button>
                    )}
                    <button
                      onClick={() => deleteOrder(order.orderId)}
                      className="w-9 h-9 flex items-center justify-center border border-cream/10 hover:border-chili/40 text-mute/50 hover:text-chili rounded-full transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {orders.length === 0 && !scanning && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <span className="text-5xl">📭</span>
          <p className="font-display text-lg text-cream">Aucune commande pour l'instant</p>
          <p className="text-sm text-mute/60">Scannez le QR code d'un client pour commencer</p>
        </div>
      )}
    </div>
  );
}
