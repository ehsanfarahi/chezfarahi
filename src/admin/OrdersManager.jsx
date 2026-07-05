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
  ScanLine, CheckCircle, Clock, Trash2,
  ChevronDown, ChevronUp, X, RefreshCw, Volume2,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function OrdersManager({ token }) {
  const [orders, setOrders] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [announceNumber, setAnnounceNumber] = useState(null);
  const [markingReady, setMarkingReady] = useState(null);
  const html5QrRef = useRef(null);

  useEffect(() => {
    setOrders(getScannedOrders());
    const interval = setInterval(() => setOrders(getScannedOrders()), 3000);
    return () => clearInterval(interval);
  }, []);

  const refreshOrders = () => setOrders(getScannedOrders());

  // ─── Scanner ───────────────────────────────────────────────────────────────
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
      } catch {
        setScanResult({
          type: "error",
          message: "Impossible d'accéder à la caméra.",
        });
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
        setScanResult({
          type: "success",
          message: `Commande n°${order.orderNumber || "—"} enregistrée !`,
          order,
        });
        refreshOrders();
        setExpandedId(order.orderId);
        setFilter("pending");
      } else {
        setScanResult({ type: "duplicate", message: "Commande déjà scannée." });
      }
    } catch {
      setScanResult({ type: "error", message: "QR illisible." });
    }
  };

  // ─── Mark ready ────────────────────────────────────────────────────────────
  const markReady = async (order) => {
    const orderNumber = order.orderNumber;
    setMarkingReady(order.orderId);

    // 1. Update local status immediately
    updateOrderStatus(order.orderId, "done");
    refreshOrders();

    // 2. Send push notification via server
    if (orderNumber && token) {
      try {
        await fetch(`${API_URL}/api/order-ready`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-token": token,
          },
          body: JSON.stringify({ orderNumber }),
        });
      } catch (err) {
        console.warn("Push notification failed:", err);
      }
    }

    setMarkingReady(null);

    // 3. Auto-open announce overlay
    if (orderNumber) setAnnounceNumber(orderNumber);
  };

  const markPending = (id) => {
    updateOrderStatus(id, "pending");
    refreshOrders();
  };

  const deleteOrder = (id) => {
    localStorage.setItem(
      "camion_orders",
      JSON.stringify(getScannedOrders().filter((o) => o.orderId !== id))
    );
    refreshOrders();
  };

  // ─── Derived state ─────────────────────────────────────────────────────────
  const pending = orders.filter((o) => o.status === "pending");
  const done = orders.filter((o) => o.status === "done");
  const displayed =
    filter === "pending" ? pending
    : filter === "done" ? done
    : orders;

  const todayRevenue = orders
    .filter(
      (o) =>
        (o.scannedAt || "").slice(0, 10) ===
        new Date().toISOString().slice(0, 10)
    )
    .reduce((s, o) => s + o.total, 0);

  return (
    <div className="text-cream max-w-3xl mx-auto">

      {/* Announce overlay */}
      {announceNumber && (
        <AnnounceOverlay
          orderNumber={announceNumber}
          onClose={() => setAnnounceNumber(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-marigold text-xs font-semibold uppercase tracking-widest mb-1">
            Admin
          </p>
          <h1 className="font-display text-3xl font-bold">Commandes</h1>
        </div>
        {orders.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm("Effacer toutes les commandes ?")) {
                clearAllOrders();
                refreshOrders();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-mute/60 hover:text-chili border border-cream/10 hover:border-chili/40 px-3 py-2 rounded-full transition"
          >
            <Trash2 size={13} /> Fin de journée
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "En attente", value: pending.length, color: "text-marigold" },
          { label: "Terminées", value: done.length, color: "text-herb" },
          { label: "Recettes", value: `${todayRevenue.toFixed(2)}€`, color: "text-cream" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-char-soft rounded-xl p-3 text-center border border-cream/5"
          >
            <p className={`font-mono font-bold text-lg ${s.color}`}>
              {s.value}
            </p>
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

      {/* Scanner viewport */}
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
        <div
          className={`flex items-start gap-3 rounded-2xl px-4 py-3 mb-4 border ${
            scanResult.type === "success"
              ? "bg-herb/15 border-herb/40 text-herb"
              : scanResult.type === "duplicate"
              ? "bg-marigold/10 border-marigold/30 text-marigold"
              : "bg-chili/15 border-chili/30 text-chili"
          }`}
        >
          <span className="text-xl shrink-0">
            {scanResult.type === "success" ? "✅"
              : scanResult.type === "duplicate" ? "⚠️"
              : "❌"}
          </span>
          <p className="text-sm font-medium flex-1">{scanResult.message}</p>
          <button onClick={() => setScanResult(null)}>
            <X size={15} className="opacity-60" />
          </button>
        </div>
      )}

      {/* Filter tabs */}
      {orders.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
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
          const displayNumber = order.orderNumber || "—";

          return (
            <div
              key={order.orderId}
              className={`bg-char-soft rounded-2xl overflow-hidden border transition ${
                isDone ? "border-herb/15 opacity-80" : "border-marigold/20"
              }`}
            >
              {/* Card header */}
              <div
                className="flex items-center gap-3 px-4 py-3.5 cursor-pointer"
                onClick={() =>
                  setExpandedId(isExpanded ? null : order.orderId)
                }
              >
                {/* Prominent 3-digit number */}
                <div
                  className={`font-display font-black text-3xl w-16 text-center shrink-0 leading-none ${
                    isDone ? "text-herb" : "text-marigold"
                  }`}
                >
                  {displayNumber}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-cream">
                    {order.items?.length} article
                    {order.items?.length > 1 ? "s" : ""}{" "}
                    <span className="font-mono text-marigold">
                      · {order.total.toFixed(2)}€
                    </span>
                  </p>
                  <p className="text-[10px] text-mute/40 font-mono mt-0.5">
                    {formatTime(order.scannedAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Announce button */}
                  {!isDone && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAnnounceNumber(displayNumber);
                      }}
                      title="Annoncer ce numéro"
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-cream/10 text-mute/50 hover:text-marigold transition"
                    >
                      <Volume2 size={15} />
                    </button>
                  )}
                  {isExpanded
                    ? <ChevronUp size={14} className="text-mute/40" />
                    : <ChevronDown size={14} className="text-mute/40" />
                  }
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="border-t border-cream/5 px-4 pb-4 pt-3">
                  <div className="space-y-1.5 mb-4">
                    {order.items?.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-mute/80">
                          {item.qty > 1 ? `${item.qty}× ` : ""}
                          {item.name}
                        </span>
                        <span className="font-mono text-xs text-mute/50">
                          {item.lineTotal.toFixed(2)}€
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-1.5 border-t border-cream/5">
                      <span className="text-sm font-semibold text-cream">
                        Total
                      </span>
                      <span className="font-mono font-bold text-marigold">
                        {order.total.toFixed(2)}€
                      </span>
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
                        onClick={() => markReady(order)}
                        disabled={markingReady === order.orderId}
                        className="flex-1 flex items-center justify-center gap-1.5 text-sm bg-herb/20 hover:bg-herb/30 border border-herb/40 text-herb font-semibold py-3 rounded-full transition disabled:opacity-60"
                      >
                        {markingReady === order.orderId ? (
                          <span className="animate-spin">⏳</span>
                        ) : (
                          <CheckCircle size={15} />
                        )}
                        {markingReady === order.orderId
                          ? "Envoi en cours..."
                          : `Commande ${displayNumber} — Prête ✓`}
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

      {/* Empty state */}
      {orders.length === 0 && !scanning && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <span className="text-5xl">📭</span>
          <p className="font-display text-lg text-cream">
            Aucune commande pour l'instant
          </p>
          <p className="text-sm text-mute/60">
            Scannez le QR code d'un client pour commencer
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Announce overlay ─────────────────────────────────────────────────────────
function AnnounceOverlay({ orderNumber, onClose }) {
  useEffect(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const playTone = (freq, start, dur) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = "triangle";
        gain.gain.setValueAtTime(0.4, ctx.currentTime + start);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + start + dur);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + dur + 0.1);
      };
      playTone(440, 0, 0.15);
      playTone(550, 0.2, 0.15);
      playTone(660, 0.4, 0.4);
    } catch {}
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-char/95 backdrop-blur-sm flex flex-col items-center justify-center text-center px-8">
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center hover:bg-cream/20 transition"
      >
        <X size={20} className="text-cream" />
      </button>

      <p className="text-mute/60 text-sm uppercase tracking-widest mb-2">
        Commande prête
      </p>

      {/* Giant number */}
      <div className="relative my-4">
        <p className="font-display font-black text-[9rem] leading-none text-marigold tracking-tight">
          {orderNumber}
        </p>
        <div className="absolute inset-0 blur-3xl bg-marigold/20 -z-10 scale-150 rounded-full" />
      </div>

      <p className="font-display text-2xl font-bold text-cream mb-2">
        Numéro <span className="text-marigold">{orderNumber}</span> — Prête !
      </p>
      <p className="text-mute/60 text-sm mb-10">
        Annoncez ce numéro à vos clients
      </p>

      <button
        onClick={onClose}
        className="bg-marigold hover:bg-marigold-light text-char font-bold px-8 py-4 rounded-full text-lg transition active:scale-95"
      >
        Fermer
      </button>
    </div>
  );
}











// import { useState, useEffect, useRef } from "react";
// import { Html5Qrcode } from "html5-qrcode";
// import {
//   getScannedOrders, saveScannedOrder, updateOrderStatus,
//   clearAllOrders, formatTime,
// } from "../utils/orderUtils";
// import { ScanLine, CheckCircle, Clock, Trash2, ChevronDown, ChevronUp, X, RefreshCw, Volume2, } from "lucide-react";

// const API_URL = import.meta.env.VITE_API_URL || "";

// export default function OrdersManager({token}) {
//   const [orders, setOrders] = useState([]);
//   const [scanning, setScanning] = useState(false);
//   const [scanResult, setScanResult] = useState(null);
//   const [expandedId, setExpandedId] = useState(null);
//   const [filter, setFilter] = useState("all");
//   const [announceNumber, setAnnounceNumber] = useState(null);
//   const [markingReady, setMarkingReady] = useState(null);
//   const html5QrRef = useRef(null);

//   useEffect(() => {
//     setOrders(getScannedOrders());
//     const interval = setInterval(() => setOrders(getScannedOrders()), 3000);
//     return () => clearInterval(interval);
//   }, []);

//   const refreshOrders = () => setOrders(getScannedOrders());

//   const startScanner = async () => {
//     setScanning(true);
//     setScanResult(null);
//     setTimeout(async () => {
//       try {
//         html5QrRef.current = new Html5Qrcode("qr-reader-admin");
//         await html5QrRef.current.start(
//           { facingMode: "environment" },
//           { fps: 10, qrbox: { width: 250, height: 250 } },
//           (text) => handleScanSuccess(text),
//           () => {}
//         );
//       } catch {
//         setScanResult({ type: "error", message: "Impossible d'accéder à la caméra." });
//         setScanning(false);
//       }
//     }, 100);
//   };

//   const stopScanner = async () => {
//     if (html5QrRef.current) {
//       try { await html5QrRef.current.stop(); html5QrRef.current.clear(); } catch {}
//     }
//     setScanning(false);
//   };

//   const handleScanSuccess = async (text) => {
//     await stopScanner();
//     try {
//       const order = JSON.parse(text);
//       if (!order.orderId || !order.items || !order.total) {
//         setScanResult({ type: "error", message: "QR invalide." });
//         return;
//       }
//       const saved = saveScannedOrder(order);
//       if (saved) {
//         setScanResult({ type: "success", message: `Commande nO${order.orderNumber || order.orderId.slice(-4)} enregistrée !`, order });
//         refreshOrders();
//         setExpandedId(order.orderId);
//         setFilter("pending");
//       } else {
//         setScanResult({ type: "duplicate", message: "Commande déjà scannée." });
//       }
//     } catch {
//       setScanResult({ type: "error", message: "QR illisible." });
//     }
//   };

//   const markReady = async (order) => {
//     const orderNumber = order.orderNumber;
//     setMarkingReady(order.orderId);  

//     // Update local state
//     updateOrderStatus(order.orderId, "done");
//     refreshOrders();

//     // Send push notification if order has a 3-digit number
//     if(orderNumber && token) {
//       try {
//         await fetch(`${API_URL}/api/order-ready`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json", "x-admin-token": token
//           },
//           body: JSON.stringify({ orderNumber }),
//         });
//       } catch (err) {
//         console.warn("Push notification failed", err);
//       }
//     }

//     setMarkingReady(null);
//     // Auto-show announce overlay
//     if(orderNumber) setAnnounceNumber(orderNumber);
//   };

//   // const markDone = (id) => { updateOrderStatus(id, "done"); refreshOrders(); };
//   const markPending = (id) => { updateOrderStatus(id, "pending"); refreshOrders(); };
//   const deleteOrder = (id) => {
//     localStorage.setItem("camion_orders", JSON.stringify(getScannedOrders().filter((o) => o.orderId !== id)));
//     refreshOrders();
//   };

//   const pending = orders.filter((o) => o.status === "pending");
//   const done = orders.filter((o) => o.status === "done");
//   const displayed = filter === "pending" ? pending : filter === "done" ? done : orders;
//   const todayRevenue = orders
//     .filter((o) => (o.scannedAt || "").slice(0, 10) === new Date().toISOString().slice(0, 10))
//     .reduce((s, o) => s + o.total, 0);

//   return (
//     <div className="text-cream max-w-3xl mx-auto">
//       {announceNumber && (
//         <AnnounceOverlay orderNumber={announceNumber} onClose={() => setAnnounceNumber(null)} />
//       )}
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <p className="text-marigold text-xs font-semibold uppercase tracking-widest mb-1">Admin</p>
//           <h1 className="font-display text-3xl font-bold">Commandes</h1>
//         </div>
//         {orders.length > 0 && (
//           <button
//             onClick={() => { if (window.confirm("Effacer toutes les commandes ?")) { clearAllOrders(); refreshOrders(); } }}
//             className="flex items-center gap-1.5 text-xs text-mute/60 hover:text-chili border border-cream/10 hover:border-chili/40 px-3 py-2 rounded-full transition"
//           >
//             <Trash2 size={13} /> Fin de journée
//           </button>
//         )}
//       </div>

//       <div className="grid grid-cols-3 gap-3 mb-6">
//         {[
//           { label: "En attente", value: pending.length, color: "text-marigold" },
//           { label: "Terminées", value: done.length, color: "text-herb" },
//           { label: "Recettes", value: `${todayRevenue.toFixed(2)}€`, color: "text-cream" },
//         ].map((s) => (
//           <div key={s.label} className="bg-char-soft rounded-xl p-3 text-center border border-cream/5">
//             <p className={`font-mono font-bold text-lg ${s.color}`}>{s.value}</p>
//             <p className="text-[10px] text-mute/50 mt-0.5">{s.label}</p>
//           </div>
//         ))}
//       </div>

//       {!scanning && (
//         <button onClick={startScanner} className="w-full flex items-center justify-center gap-3 bg-marigold hover:bg-marigold-light text-char font-semibold py-4 rounded-2xl mb-5 transition active:scale-95 shadow-lg shadow-marigold/20">
//           <ScanLine size={22} /> Scanner une commande
//         </button>
//       )}

//       {scanning && (
//         <div className="relative mb-5 rounded-2xl overflow-hidden bg-char-soft border border-cream/10">
//           <div id="qr-reader-admin" className="w-full" />
//           <button onClick={stopScanner} className="absolute top-3 right-3 w-9 h-9 bg-char/80 backdrop-blur rounded-full flex items-center justify-center">
//             <X size={18} className="text-cream" />
//           </button>
//           <p className="text-center text-xs text-mute/60 py-3">Pointez la caméra vers le QR code du client</p>
//         </div>
//       )}

//       {scanResult && (
//         <div className={`flex items-start gap-3 rounded-2xl px-4 py-3 mb-4 border ${
//           scanResult.type === "success" ? "bg-herb/15 border-herb/40 text-herb"
//           : scanResult.type === "duplicate" ? "bg-marigold/10 border-marigold/30 text-marigold"
//           : "bg-chili/15 border-chili/30 text-chili"
//         }`}>
//           <span className="text-xl shrink-0">{scanResult.type === "success" ? "✅" : scanResult.type === "duplicate" ? "⚠️" : "❌"}</span>
//           <p className="text-sm font-medium flex-1">{scanResult.message}</p>
//           <button onClick={() => setScanResult(null)}><X size={15} className="opacity-60" /></button>
//         </div>
//       )}

//       {orders.length > 0 && (
//         <div className="flex gap-2 mb-4">
//           {[
//             { id: "all", label: `Toutes (${orders.length})` },
//             { id: "pending", label: `En attente (${pending.length})` },
//             { id: "done", label: `Terminées (${done.length})` },
//           ].map((f) => (
//             <button key={f.id} onClick={() => setFilter(f.id)}
//               className={`text-xs px-3 py-1.5 rounded-full border transition ${
//                 filter === f.id ? "bg-marigold text-char border-marigold" : "border-cream/15 text-mute hover:text-cream"
//               }`}
//             >{f.label}</button>
//           ))}
//         </div>
//       )}

//       <div className="space-y-3">
//         {displayed.map((order) => {
//           const isDone = order.status === "done";
//           const isExpanded = expandedId === order.orderId;
//           const displayNumber = order.orderNumber || "_";

//           return (
//             <div key={order.orderId} className={`bg-char-soft rounded-2xl overflow-hidden border transition ${isDone ? "border-herb/15 opacity-80" : "border-marigold/20"}`}>
//               <div className="flex items-center gap-3 px-4 py-3.5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : order.orderId)}>
//                 <div className={`font-display font-black text-2xl w-14 text-center shrink-0 ${isDone ? "text-herb" : "text-marigold"}`}>
//                   {displayNumber}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm font-semibold text-cream">{order.items?.length} article{order.items?.length > 1 ? "s" : ""} {" "} <span className="font-nono text-marigold">.{order.total.toFixed(2)}€</span></p>
//                   <p className="text-[10px] text-mute/40 font-mono mt-0.5">{formatTime(order.scannedAt)}</p>
//                 </div>
//                 <div className="flex items-center gap-1.5 shrink-0">{!isDone && (
//                   <button onClick={(e) => {e.stopPropagation(); setAnnounceNumber(displayNumber);}} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-cream/10 text-mute/50 hover:text-marigold transition" title="Annoncer ce numéro"><Volume2 size={15} /></button>
//                 )}
//                 {
//                   isExpanded ? <ChevronUp size={14} className="text-mute/40" /> : <ChevronDown size={14} className="text-mute/40" />
//                 }
//                 </div>
//                 </div>
               
              
//               {isExpanded && (
//                 <div className="border-t border-cream/5 px-4 pb-4 pt-3">
//                   <div className="space-y-1.5 mb-4">
//                     {order.items?.map((item, i) => (
//                       <div key={i} className="flex justify-between text-sm">
//                         <span className="text-mute/80">{item.qty > 1 ? `${item.qty}× ` : ""}{item.name}</span>
//                         <span className="font-mono text-xs text-mute/50">{item.lineTotal.toFixed(2)}€</span>
//                       </div>
//                     ))}
//                     <div className="flex justify-between pt-1.5 border-t border-cream/5">
//                       <span className="text-sm font-semibold text-cream">Total</span>
//                       <span className="font-mono font-bold text-marigold">{order.total.toFixed(2)}€</span>
//                     </div>
//                   </div>
//                   <div className="flex gap-2">
//                     {isDone ? (
//                       <button onClick={() => markPending(order.orderId)} className="flex-1 flex items-center justify-center gap-1.5 text-xs border border-cream/15 text-mute hover:text-cream py-2 rounded-full transition">
//                         <RefreshCw size={12} /> Remettre en attente
//                       </button>
//                     ) : (
//                       <button onClick={() => markDone(order.orderId)} className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-herb/20 hover:bg-herb/30 border border-herb/40 text-herb font-semibold py-3 rounded-full transition disabled:opacity-60">
//                       {markingReady === order.orderId ? <span className="animate-spin">🔄</span> : <CheckCircle size={15} />}
//                         { markingReady === order.orderId ? "Envoi..." : `Commande ${displayNumber} - prête` }
//                       </button>
//                     )}
//                     <button onClick={() => deleteOrder(order.orderId)} className="w-9 h-9 flex items-center justify-center border border-cream/10 hover:border-chili/40 text-mute/50 hover:text-chili rounded-full transition">
//                       <Trash2 size={14} />
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>

//       {orders.length === 0 && !scanning && (
//         <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
//           <span className="text-5xl">📭</span>
//           <p className="font-display text-lg text-cream">Aucune commande pour l'instant</p>
//           <p className="text-sm text-mute/60">Scannez le QR code d'un client pour commencer</p>
//         </div>
//       )}
//     </div>
//   );
// }

// // ---------- Announce overlay -----------------
// function AnnounceOverlay({ orderNumber, onClose }) {
//   // Play a call-out chime
//   useEffect(() => {
//    try {
//     const ctx = new (window.AudioContext || window.webkitAudioContext)();
//     const playTone = (freq, start, dur) => {
//       const osc = ctx.createOscillator();
//       const gain = ctx.createGain();
//       osc.connect(gain);
//       gain.connect(ctx.destination);
//       osc.frequency.value = freq;
//       osc.type = "triangle";
//       gain.gain.setValueAtTime(0.4, ctx.currentTime + start);
//       gain.gain.linearRampToValueAtTime(0, ctx.currentTime + start + dur)
//       osc.start(ctx.currentTime + start);
//       osc.stop(ctx.currentTime + start + dur + 0.1);
//     };
//     playTone(440, 0, 0.15);
//     playTone(550, 0.2, 0.15);
//     playTone(660, 0.4, 0.15);
//    } catch {}
//   }, []);

//   return (
//     <div className="fixed inset-0 z-50 bg-char/95 backdrop-blur-sm flex flex-col items-center justify-center text-center px-8">
//       <button onClick={onClose} className="absolute top-5 right-5 w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center hover:bg-cream/20 transition">
//         <X size={20} className="text-cream" />
//       </button>

//       <p className="text-mute/60 text-sm uppercase tracking-widest mb-2">Commande prête</p>
//       <div className="relative my-4">
//         <p className="font-display font-black text-[9rem] leading-none text-marigold tracking-tight">{orderNumber}</p>
//         <div claassName="absolute inset-0 blur-3xl bg-marigold/20 -z-10 scale-150 rounded-full" />
//       </div>
//      <p className="font-display text-2xl font-bold text-cream mb-2">Numéro <span className="text-marigold">{orderNumber}</span> - Préte !</p>
//      <p className="text-mute/60 text-sm mb-10">Annoncez à vos clients</p>

//      <button onClick={onClose} className="bg-marigold hover:bg-marigold-light text-char font-bold px-8 py-4 rounded-full text-lg transition active:scale-95">Fermer</button>
//     </div>
//   );
// } 
