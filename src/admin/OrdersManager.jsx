import { useState, useEffect, useRef, useCallback } from "react";
import {
<<<<<<< HEAD
  ScanLine,
  CheckCircle,
  Clock,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  RefreshCw,
  Volume2,
  MessageSquare,
=======
  ScanLine, CheckCircle, Clock, Trash2,
  ChevronDown, ChevronUp, X, RefreshCw,
  Volume2, MessageSquare, Package, AlertCircle,
>>>>>>> 393817f8858bbe4ffc92642f0f2f8cbadb6b6707
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function OrdersManager({ token }) {
  const [orders, setOrders]       = useState([]);
  const [scanning, setScanning]   = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter]       = useState("pending");
  const [announceNum, setAnnounceNum] = useState(null);
  const [markingReady, setMarkingReady] = useState(null);
  const [loadError, setLoadError] = useState("");
  const html5QrRef = useRef(null);
  const pollRef    = useRef(null);

  // ─── Fetch orders from Redis ────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        headers: { "x-admin-token": token },
      });
      if (!res.ok) throw new Error("Unauthorized");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
      setLoadError("");
    } catch (err) {
      setLoadError("Impossible de charger les commandes.");
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
    pollRef.current = setInterval(fetchOrders, 5000);
    return () => clearInterval(pollRef.current);
  }, [fetchOrders]);

  // ─── Scanner ────────────────────────────────────────────────────────────────
  const startScanner = async () => {
    const { Html5Qrcode } = await import("html5-qrcode");
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
        setScanResult({ type: "error", message: "Impossible d'accéder à la caméra." });
        setScanning(false);
      }
    }, 100);
  };

  const stopScanner = async () => {
    if (html5QrRef.current) {
      try { await html5QrRef.current.stop(); html5QrRef.current.clear(); } catch {}
    }
    setScanning(false);
  };

  const handleScanSuccess = async (text) => {
    await stopScanner();
    try {
      const scannedOrder = JSON.parse(text);
      if (!scannedOrder.orderId && !scannedOrder.orderNumber) {
        setScanResult({ type: "error", message: "QR invalide." });
        return;
      }
      const orderNum = scannedOrder.orderNumber;
      if (orderNum) {
        // Check if already in our list
        const existing = orders.find((o) => o.orderNumber === orderNum);
        if (existing) {
          setScanResult({ type: "duplicate", message: `Commande n°${orderNum} déjà enregistrée.` });
          setExpandedId(orderNum);
          setFilter("all");
          return;
        }
        // Fetch from Redis to confirm it exists
        const res = await fetch(`${API_URL}/api/order-status?number=${orderNum}`);
        if (res.ok) {
          setScanResult({ type: "success", message: `Commande n°${orderNum} enregistrée !` });
          setFilter("pending");
          setExpandedId(orderNum);
          fetchOrders();
        } else {
          setScanResult({ type: "error", message: "Commande introuvable dans le système." });
        }
      }
    } catch {
      setScanResult({ type: "error", message: "QR illisible." });
    }
  };

  // ─── Mark ready ─────────────────────────────────────────────────────────────
  const markReady = async (order) => {
    const { orderNumber } = order;
    setMarkingReady(orderNumber);
    try {
      await fetch(`${API_URL}/api/order-ready`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({ orderNumber }),
      });
      await fetchOrders();
      if (orderNumber) setAnnounceNum(orderNumber);
    } catch (err) {
      console.warn("Mark ready failed:", err);
    } finally {
      setMarkingReady(null);
    }
  };

  const markPending = async (orderNumber) => {
    await fetch(`${API_URL}/api/orders`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-token": token },
      body: JSON.stringify({ orderNumber, status: "pending" }),
    });
    fetchOrders();
  };

  const deleteOrder = async (orderNumber) => {
    await fetch(`${API_URL}/api/orders`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "x-admin-token": token },
      body: JSON.stringify({ orderNumber }),
    });
    fetchOrders();
  };

  const clearAll = async () => {
    if (!window.confirm("Effacer toutes les commandes du jour ?")) return;
    await Promise.all(orders.map((o) => deleteOrder(o.orderNumber)));
    fetchOrders();
  };

  // ─── Derived state ───────────────────────────────────────────────────────────
  const pending  = orders.filter((o) => o.status === "pending");
  const done     = orders.filter((o) => o.status === "ready");
  const displayed = filter === "pending" ? pending : filter === "done" ? done : orders;
  const revenue  = orders.reduce((s, o) => s + (o.total || 0), 0);

  return (
    <div className="text-cream max-w-3xl mx-auto">
      {announceNum && (
        <AnnounceOverlay orderNumber={announceNum} onClose={() => setAnnounceNum(null)} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-marigold text-xs font-semibold uppercase tracking-widest mb-1">Admin</p>
          <h1 className="font-display text-3xl font-bold">Commandes</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchOrders}
            className="w-9 h-9 flex items-center justify-center border border-cream/10 rounded-full hover:border-marigold/40 transition text-mute/50 hover:text-marigold">
            <RefreshCw size={14} />
          </button>
          {orders.length > 0 && (
            <button onClick={clearAll}
              className="flex items-center gap-1.5 text-xs text-mute/60 hover:text-chili border border-cream/10 hover:border-chili/40 px-3 py-2 rounded-full transition">
              <Trash2 size={13} /> Fin de journée
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {loadError && (
        <div className="bg-chili/15 border border-chili/30 rounded-2xl px-4 py-3 mb-4 flex items-center gap-2 text-chili text-sm">
          <AlertCircle size={16} /> {loadError}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "En attente", value: pending.length, color: "text-marigold" },
          { label: "Terminées",  value: done.length,    color: "text-herb" },
          { label: "Recettes",   value: `${revenue.toFixed(2)}€`, color: "text-cream" },
        ].map((s) => (
          <div key={s.label} className="bg-char-soft rounded-xl p-3 text-center border border-cream/5">
            <p className={`font-mono font-bold text-lg ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-mute/50 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Scanner */}
      {!scanning && (
        <button onClick={startScanner}
          className="w-full flex items-center justify-center gap-3 bg-marigold hover:bg-marigold-light text-char font-semibold py-4 rounded-2xl mb-5 transition active:scale-95 shadow-lg shadow-marigold/20">
          <ScanLine size={22} /> Scanner une commande
        </button>
      )}

      {scanning && (
        <div className="relative mb-5 rounded-2xl overflow-hidden bg-char-soft border border-cream/10">
          <div id="qr-reader-admin" className="w-full" />
          <button onClick={stopScanner}
            className="absolute top-3 right-3 w-9 h-9 bg-char/80 backdrop-blur rounded-full flex items-center justify-center">
            <X size={18} className="text-cream" />
          </button>
          <p className="text-center text-xs text-mute/60 py-3">Pointez la caméra vers le QR code du client</p>
        </div>
      )}

      {/* Scan feedback */}
      {scanResult && (
        <div className={`flex items-start gap-3 rounded-2xl px-4 py-3 mb-4 border ${
          scanResult.type === "success"   ? "bg-herb/15 border-herb/40 text-herb"
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

      {/* Filters */}
      {orders.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {[
            { id: "all",     label: `Toutes (${orders.length})` },
            { id: "pending", label: `En attente (${pending.length})` },
            { id: "done",    label: `Terminées (${done.length})` },
          ].map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`text-xs px-3 py-1.5 rounded-full border transition ${
                filter === f.id ? "bg-marigold text-char border-marigold" : "border-cream/15 text-mute hover:text-cream"
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Orders list */}
      <div className="space-y-3">
<<<<<<< HEAD
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
                onClick={() => setExpandedId(isExpanded ? null : order.orderId)}
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
                    {order.note && (
                      <span className="ml-2 inline-flex items-center gap-0.5 text-[10px] bg-marigold/15 text-marigold px-1.5 py-0.5 rounded-full">
                        <MessageSquare size={9} /> Note
                      </span>
                    )}
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
                  {isExpanded ? (
                    <ChevronUp size={14} className="text-mute/40" />
                  ) : (
                    <ChevronDown size={14} className="text-mute/40" />
                  )}
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="border-t border-cream/5 px-4 pb-4 pt-3">
                  {/* Customer note */}
                  {order.note && (
                    <div className="bg-marigold/8 border border-marigold/20 rounded-xl px-3 py-2.5 mb-3 flex items-start gap-2">
                      <MessageSquare
                        size={13}
                        className="text-marigold shrink-0 mt-0.5"
                      />
                      <div>
                        <p className="text-[10px] text-marigold/70 uppercase tracking-wider font-semibold mb-0.5">
                          Note du client
                        </p>
                        <p className="text-sm text-cream">{order.note}</p>
                      </div>
                    </div>
                  )}

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
=======
        {displayed.map((order) => (
          <OrderCard
            key={order.orderNumber}
            order={order}
            expanded={expandedId === order.orderNumber}
            onToggle={() => setExpandedId(expandedId === order.orderNumber ? null : order.orderNumber)}
            onMarkReady={() => markReady(order)}
            onMarkPending={() => markPending(order.orderNumber)}
            onDelete={() => deleteOrder(order.orderNumber)}
            onAnnounce={() => setAnnounceNum(order.orderNumber)}
            markingReady={markingReady === order.orderNumber}
          />
        ))}
>>>>>>> 393817f8858bbe4ffc92642f0f2f8cbadb6b6707
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

// ─── Order Card ───────────────────────────────────────────────────────────────
function OrderCard({ order, expanded, onToggle, onMarkReady, onMarkPending, onDelete, onAnnounce, markingReady }) {
  const isDone = order.status === "ready";
  const num    = order.orderNumber || "—";
  const time   = order.createdAt
    ? new Date(order.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    : "—";

  return (
    <div className={`bg-char-soft rounded-2xl overflow-hidden border transition ${
      isDone ? "border-herb/20 opacity-85" : "border-marigold/25"
    }`}>
      {/* Card header */}
      <div className="flex items-center gap-3 px-4 py-3.5 cursor-pointer" onClick={onToggle}>
        {/* Order number */}
        <div className={`font-display font-black text-3xl w-16 text-center shrink-0 leading-none ${
          isDone ? "text-herb" : "text-marigold"
        }`}>
          {num}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-cream">
            {order.items?.length || 0} article{(order.items?.length || 0) > 1 ? "s" : ""}
            <span className="font-mono text-marigold"> · {Number(order.total || 0).toFixed(2)}€</span>
            {order.note && (
              <span className="ml-2 inline-flex items-center gap-0.5 text-[10px] bg-marigold/15 text-marigold px-1.5 py-0.5 rounded-full">
                <MessageSquare size={9} /> Note
              </span>
            )}
          </p>
          <p className="text-[10px] text-mute/40 font-mono mt-0.5">
            <Clock size={9} className="inline mr-1" />{time}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isDone && (
            <button onClick={(e) => { e.stopPropagation(); onAnnounce(); }}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-cream/10 text-mute/50 hover:text-marigold transition"
              title="Annoncer">
              <Volume2 size={15} />
            </button>
          )}
          {expanded ? <ChevronUp size={14} className="text-mute/40" /> : <ChevronDown size={14} className="text-mute/40" />}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-cream/5 px-4 pb-4 pt-3">

          {/* Customer note */}
          {order.note && (
            <div className="bg-marigold/8 border border-marigold/20 rounded-xl px-3 py-2.5 mb-3 flex items-start gap-2">
              <MessageSquare size={14} className="text-marigold shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-marigold/70 font-semibold uppercase tracking-wider mb-0.5">Note du client</p>
                <p className="text-sm text-cream">{order.note}</p>
              </div>
            </div>
          )}

          {/* Preparation details */}
          <div className="mb-4">
            <p className="text-[10px] text-mute/50 uppercase tracking-widest font-semibold mb-2 flex items-center gap-1">
              <Package size={10} /> À préparer
            </p>
            <div className="space-y-2">
              {(order.items || []).map((item, i) => (
                <PrepItem key={i} item={item} />
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center pt-2 border-t border-cream/5 mb-4">
            <span className="text-sm font-semibold text-cream">Total</span>
            <span className="font-mono font-bold text-marigold">{Number(order.total || 0).toFixed(2)}€</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {isDone ? (
              <button onClick={onMarkPending}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs border border-cream/15 text-mute hover:text-cream py-2 rounded-full transition">
                <RefreshCw size={12} /> Remettre en attente
              </button>
            ) : (
              <button onClick={onMarkReady} disabled={markingReady}
                className="flex-1 flex items-center justify-center gap-1.5 text-sm bg-herb/20 hover:bg-herb/30 border border-herb/40 text-herb font-semibold py-3 rounded-full transition disabled:opacity-60">
                {markingReady
                  ? <><span className="animate-spin">⏳</span> Envoi...</>
                  : <><CheckCircle size={15} /> Commande {num} — Prête ✓</>
                }
              </button>
            )}
            <button onClick={onDelete}
              className="w-9 h-9 flex items-center justify-center border border-cream/10 hover:border-chili/40 text-mute/50 hover:text-chili rounded-full transition">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Preparation item component ───────────────────────────────────────────────
function PrepItem({ item }) {
  const [open, setOpen] = useState(false);
  const isCombo     = item.type === "combo";
  const isMDJ       = item.type === "menuDuJour";
  const hasDetails  = isCombo || isMDJ;

  return (
    <div className="bg-char rounded-xl overflow-hidden">
      <div
        className={`flex items-center justify-between px-3 py-2.5 ${hasDetails ? "cursor-pointer" : ""}`}
        onClick={() => hasDetails && setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-mono text-marigold/80 shrink-0">
            {item.qty > 1 ? `${item.qty}×` : "·"}
          </span>
          <div className="min-w-0">
            <p className="text-sm text-cream font-medium truncate">{item.name}</p>
            {(isCombo || isMDJ) && (
              <span className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full ${
                isCombo ? "bg-marigold/15 text-marigold/80" : "bg-herb/15 text-herb/80"
              }`}>
                {isCombo ? "Combo" : "Menu du Jour"}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-xs text-mute/50">
            {Number(item.lineTotal || 0).toFixed(2)}€
          </span>
          {hasDetails && (
            open
              ? <ChevronUp size={13} className="text-mute/40" />
              : <ChevronDown size={13} className="text-mute/40" />
          )}
        </div>
      </div>

      {/* Combo details */}
      {hasDetails && open && (
        <div className="border-t border-cream/5 px-3 pb-3 pt-2 bg-char/50">
          {isCombo && item.details && (
            <div className="space-y-1">
              <p className="text-[10px] text-mute/40 uppercase tracking-wider mb-1.5">Contenu du combo</p>
              {(item.details.items || []).map((ci, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="text-marigold/50">→</span>
                  <span className="text-mute/80">{ci.name}</span>
                </div>
              ))}
              {(item.details.beverages || []).map((bv, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="text-herb/50">→</span>
                  <span className="text-mute/80">{bv.name}</span>
                  <span className="text-[9px] bg-herb/15 text-herb/70 px-1 rounded">Boisson</span>
                </div>
              ))}
            </div>
          )}
          {isMDJ && item.details && (
            <div className="space-y-1">
              <p className="text-[10px] text-mute/40 uppercase tracking-wider mb-1.5">Contenu du menu du jour</p>
              {(item.details.items || []).map((mi, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="text-marigold/50">→</span>
                  <span className="text-mute/80">{mi.name}</span>
                </div>
              ))}
              {(item.details.extraItems || []).map((ei, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="text-marigold/50">→</span>
                  <span className="text-mute/80">{ei.name}</span>
                </div>
              ))}
              {item.details.beverage?.included && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-herb/50">→</span>
                  <span className="text-mute/80">{item.details.beverage.name || "Boisson au choix"}</span>
                  <span className="text-[9px] bg-herb/15 text-herb/70 px-1 rounded">Incluse</span>
                </div>
              )}
            </div>
          )}
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
      const tone = (freq, start, dur) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = freq; osc.type = "triangle";
        gain.gain.setValueAtTime(0.4, ctx.currentTime + start);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + start + dur);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + dur + 0.1);
      };
      tone(440, 0, 0.15); tone(550, 0.2, 0.15); tone(660, 0.4, 0.4);
    } catch {}
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-char/95 backdrop-blur-sm flex flex-col items-center justify-center text-center px-8">
      <button onClick={onClose} className="absolute top-5 right-5 w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center hover:bg-cream/20 transition">
        <X size={20} className="text-cream" />
      </button>
      <p className="text-mute/60 text-sm uppercase tracking-widest mb-2">Commande prête</p>
      <div className="relative my-4">
        <p className="font-display font-black text-[9rem] leading-none text-marigold tracking-tight">{orderNumber}</p>
        <div className="absolute inset-0 blur-3xl bg-marigold/20 -z-10 scale-150 rounded-full" />
      </div>
      <p className="font-display text-2xl font-bold text-cream mb-2">
        Numéro <span className="text-marigold">{orderNumber}</span> — Prête !
      </p>
      <p className="text-mute/60 text-sm mb-10">Annoncez ce numéro à vos clients</p>
      <button onClick={onClose} className="bg-marigold hover:bg-marigold-light text-char font-bold px-8 py-4 rounded-full text-lg transition active:scale-95">
        Fermer
      </button>
    </div>
  );
}



















// import { useState, useEffect, useRef } from "react";
// import { Html5Qrcode } from "html5-qrcode";
// import {
//   getScannedOrders,
//   saveScannedOrder,
//   updateOrderStatus,
//   clearAllOrders,
//   formatTime,
// } from "../utils/orderUtils";
// import {
//   ScanLine, CheckCircle, Clock, Trash2,
//   ChevronDown, ChevronUp, X, RefreshCw, Volume2,
// } from "lucide-react";

// const API_URL = import.meta.env.VITE_API_URL || "";

// export default function OrdersManager({ token }) {
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

//   // ─── Scanner ───────────────────────────────────────────────────────────────
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
//         setScanResult({
//           type: "error",
//           message: "Impossible d'accéder à la caméra.",
//         });
//         setScanning(false);
//       }
//     }, 100);
//   };

//   const stopScanner = async () => {
//     if (html5QrRef.current) {
//       try {
//         await html5QrRef.current.stop();
//         html5QrRef.current.clear();
//       } catch {}
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
//         setScanResult({
//           type: "success",
//           message: `Commande n°${order.orderNumber || "—"} enregistrée !`,
//           order,
//         });
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

//   // ─── Mark ready ────────────────────────────────────────────────────────────
//   const markReady = async (order) => {
//     const orderNumber = order.orderNumber;
//     setMarkingReady(order.orderId);

//     // 1. Update local status immediately
//     updateOrderStatus(order.orderId, "done");
//     refreshOrders();

//     // 2. Send push notification via server
//     if (orderNumber && token) {
//       try {
//         await fetch(`${API_URL}/api/order-ready`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             "x-admin-token": token,
//           },
//           body: JSON.stringify({ orderNumber }),
//         });
//       } catch (err) {
//         console.warn("Push notification failed:", err);
//       }
//     }

//     setMarkingReady(null);

//     // 3. Auto-open announce overlay
//     if (orderNumber) setAnnounceNumber(orderNumber);
//   };

//   const markPending = (id) => {
//     updateOrderStatus(id, "pending");
//     refreshOrders();
//   };

//   const deleteOrder = (id) => {
//     localStorage.setItem(
//       "camion_orders",
//       JSON.stringify(getScannedOrders().filter((o) => o.orderId !== id))
//     );
//     refreshOrders();
//   };

//   // ─── Derived state ─────────────────────────────────────────────────────────
//   const pending = orders.filter((o) => o.status === "pending");
//   const done = orders.filter((o) => o.status === "done");
//   const displayed =
//     filter === "pending" ? pending
//     : filter === "done" ? done
//     : orders;

//   const todayRevenue = orders
//     .filter(
//       (o) =>
//         (o.scannedAt || "").slice(0, 10) ===
//         new Date().toISOString().slice(0, 10)
//     )
//     .reduce((s, o) => s + o.total, 0);

//   return (
//     <div className="text-cream max-w-3xl mx-auto">

//       {/* Announce overlay */}
//       {announceNumber && (
//         <AnnounceOverlay
//           orderNumber={announceNumber}
//           onClose={() => setAnnounceNumber(null)}
//         />
//       )}

//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <p className="text-marigold text-xs font-semibold uppercase tracking-widest mb-1">
//             Admin
//           </p>
//           <h1 className="font-display text-3xl font-bold">Commandes</h1>
//         </div>
//         {orders.length > 0 && (
//           <button
//             onClick={() => {
//               if (window.confirm("Effacer toutes les commandes ?")) {
//                 clearAllOrders();
//                 refreshOrders();
//               }
//             }}
//             className="flex items-center gap-1.5 text-xs text-mute/60 hover:text-chili border border-cream/10 hover:border-chili/40 px-3 py-2 rounded-full transition"
//           >
//             <Trash2 size={13} /> Fin de journée
//           </button>
//         )}
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-3 gap-3 mb-6">
//         {[
//           { label: "En attente", value: pending.length, color: "text-marigold" },
//           { label: "Terminées", value: done.length, color: "text-herb" },
//           { label: "Recettes", value: `${todayRevenue.toFixed(2)}€`, color: "text-cream" },
//         ].map((s) => (
//           <div
//             key={s.label}
//             className="bg-char-soft rounded-xl p-3 text-center border border-cream/5"
//           >
//             <p className={`font-mono font-bold text-lg ${s.color}`}>
//               {s.value}
//             </p>
//             <p className="text-[10px] text-mute/50 mt-0.5">{s.label}</p>
//           </div>
//         ))}
//       </div>

//       {/* Scan button */}
//       {!scanning && (
//         <button
//           onClick={startScanner}
//           className="w-full flex items-center justify-center gap-3 bg-marigold hover:bg-marigold-light text-char font-semibold py-4 rounded-2xl mb-5 transition active:scale-95 shadow-lg shadow-marigold/20"
//         >
//           <ScanLine size={22} /> Scanner une commande
//         </button>
//       )}

//       {/* Scanner viewport */}
//       {scanning && (
//         <div className="relative mb-5 rounded-2xl overflow-hidden bg-char-soft border border-cream/10">
//           <div id="qr-reader-admin" className="w-full" />
//           <button
//             onClick={stopScanner}
//             className="absolute top-3 right-3 w-9 h-9 bg-char/80 backdrop-blur rounded-full flex items-center justify-center"
//           >
//             <X size={18} className="text-cream" />
//           </button>
//           <p className="text-center text-xs text-mute/60 py-3">
//             Pointez la caméra vers le QR code du client
//           </p>
//         </div>
//       )}

//       {/* Scan result */}
//       {scanResult && (
//         <div
//           className={`flex items-start gap-3 rounded-2xl px-4 py-3 mb-4 border ${
//             scanResult.type === "success"
//               ? "bg-herb/15 border-herb/40 text-herb"
//               : scanResult.type === "duplicate"
//               ? "bg-marigold/10 border-marigold/30 text-marigold"
//               : "bg-chili/15 border-chili/30 text-chili"
//           }`}
//         >
//           <span className="text-xl shrink-0">
//             {scanResult.type === "success" ? "✅"
//               : scanResult.type === "duplicate" ? "⚠️"
//               : "❌"}
//           </span>
//           <p className="text-sm font-medium flex-1">{scanResult.message}</p>
//           <button onClick={() => setScanResult(null)}>
//             <X size={15} className="opacity-60" />
//           </button>
//         </div>
//       )}

//       {/* Filter tabs */}
//       {orders.length > 0 && (
//         <div className="flex gap-2 mb-4 flex-wrap">
//           {[
//             { id: "all", label: `Toutes (${orders.length})` },
//             { id: "pending", label: `En attente (${pending.length})` },
//             { id: "done", label: `Terminées (${done.length})` },
//           ].map((f) => (
//             <button
//               key={f.id}
//               onClick={() => setFilter(f.id)}
//               className={`text-xs px-3 py-1.5 rounded-full border transition ${
//                 filter === f.id
//                   ? "bg-marigold text-char border-marigold"
//                   : "border-cream/15 text-mute hover:text-cream"
//               }`}
//             >
//               {f.label}
//             </button>
//           ))}
//         </div>
//       )}

//       {/* Orders list */}
//       <div className="space-y-3">
//         {displayed.map((order) => {
//           const isDone = order.status === "done";
//           const isExpanded = expandedId === order.orderId;
//           const displayNumber = order.orderNumber || "—";

//           return (
//             <div
//               key={order.orderId}
//               className={`bg-char-soft rounded-2xl overflow-hidden border transition ${
//                 isDone ? "border-herb/15 opacity-80" : "border-marigold/20"
//               }`}
//             >
//               {/* Card header */}
//               <div
//                 className="flex items-center gap-3 px-4 py-3.5 cursor-pointer"
//                 onClick={() =>
//                   setExpandedId(isExpanded ? null : order.orderId)
//                 }
//               >
//                 {/* Prominent 3-digit number */}
//                 <div
//                   className={`font-display font-black text-3xl w-16 text-center shrink-0 leading-none ${
//                     isDone ? "text-herb" : "text-marigold"
//                   }`}
//                 >
//                   {displayNumber}
//                 </div>

//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm font-semibold text-cream">
//                     {order.items?.length} article
//                     {order.items?.length > 1 ? "s" : ""}{" "}
//                     <span className="font-mono text-marigold">
//                       · {order.total.toFixed(2)}€
//                     </span>
//                   </p>
//                   <p className="text-[10px] text-mute/40 font-mono mt-0.5">
//                     {formatTime(order.scannedAt)}
//                   </p>
//                 </div>

//                 <div className="flex items-center gap-2 shrink-0">
//                   {/* Announce button */}
//                   {!isDone && (
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         setAnnounceNumber(displayNumber);
//                       }}
//                       title="Annoncer ce numéro"
//                       className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-cream/10 text-mute/50 hover:text-marigold transition"
//                     >
//                       <Volume2 size={15} />
//                     </button>
//                   )}
//                   {isExpanded
//                     ? <ChevronUp size={14} className="text-mute/40" />
//                     : <ChevronDown size={14} className="text-mute/40" />
//                   }
//                 </div>
//               </div>

//               {/* Expanded detail */}
//               {isExpanded && (
//                 <div className="border-t border-cream/5 px-4 pb-4 pt-3">
//                   <div className="space-y-1.5 mb-4">
//                     {order.items?.map((item, i) => (
//                       <div key={i} className="flex justify-between text-sm">
//                         <span className="text-mute/80">
//                           {item.qty > 1 ? `${item.qty}× ` : ""}
//                           {item.name}
//                         </span>
//                         <span className="font-mono text-xs text-mute/50">
//                           {item.lineTotal.toFixed(2)}€
//                         </span>
//                       </div>
//                     ))}
//                     <div className="flex justify-between pt-1.5 border-t border-cream/5">
//                       <span className="text-sm font-semibold text-cream">
//                         Total
//                       </span>
//                       <span className="font-mono font-bold text-marigold">
//                         {order.total.toFixed(2)}€
//                       </span>
//                     </div>
//                   </div>

//                   <div className="flex gap-2">
//                     {isDone ? (
//                       <button
//                         onClick={() => markPending(order.orderId)}
//                         className="flex-1 flex items-center justify-center gap-1.5 text-xs border border-cream/15 text-mute hover:text-cream py-2 rounded-full transition"
//                       >
//                         <RefreshCw size={12} /> Remettre en attente
//                       </button>
//                     ) : (
//                       <button
//                         onClick={() => markReady(order)}
//                         disabled={markingReady === order.orderId}
//                         className="flex-1 flex items-center justify-center gap-1.5 text-sm bg-herb/20 hover:bg-herb/30 border border-herb/40 text-herb font-semibold py-3 rounded-full transition disabled:opacity-60"
//                       >
//                         {markingReady === order.orderId ? (
//                           <span className="animate-spin">⏳</span>
//                         ) : (
//                           <CheckCircle size={15} />
//                         )}
//                         {markingReady === order.orderId
//                           ? "Envoi en cours..."
//                           : `Commande ${displayNumber} — Prête ✓`}
//                       </button>
//                     )}
//                     <button
//                       onClick={() => deleteOrder(order.orderId)}
//                       className="w-9 h-9 flex items-center justify-center border border-cream/10 hover:border-chili/40 text-mute/50 hover:text-chili rounded-full transition"
//                     >
//                       <Trash2 size={14} />
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>

//       {/* Empty state */}
//       {orders.length === 0 && !scanning && (
//         <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
//           <span className="text-5xl">📭</span>
//           <p className="font-display text-lg text-cream">
//             Aucune commande pour l'instant
//           </p>
//           <p className="text-sm text-mute/60">
//             Scannez le QR code d'un client pour commencer
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }

// // ─── Announce overlay ─────────────────────────────────────────────────────────
// function AnnounceOverlay({ orderNumber, onClose }) {
//   useEffect(() => {
//     try {
//       const ctx = new (window.AudioContext || window.webkitAudioContext)();
//       const playTone = (freq, start, dur) => {
//         const osc = ctx.createOscillator();
//         const gain = ctx.createGain();
//         osc.connect(gain);
//         gain.connect(ctx.destination);
//         osc.frequency.value = freq;
//         osc.type = "triangle";
//         gain.gain.setValueAtTime(0.4, ctx.currentTime + start);
//         gain.gain.linearRampToValueAtTime(0, ctx.currentTime + start + dur);
//         osc.start(ctx.currentTime + start);
//         osc.stop(ctx.currentTime + start + dur + 0.1);
//       };
//       playTone(440, 0, 0.15);
//       playTone(550, 0.2, 0.15);
//       playTone(660, 0.4, 0.4);
//     } catch {}
//   }, []);

//   return (
//     <div className="fixed inset-0 z-50 bg-char/95 backdrop-blur-sm flex flex-col items-center justify-center text-center px-8">
//       <button
//         onClick={onClose}
//         className="absolute top-5 right-5 w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center hover:bg-cream/20 transition"
//       >
//         <X size={20} className="text-cream" />
//       </button>

//       <p className="text-mute/60 text-sm uppercase tracking-widest mb-2">
//         Commande prête
//       </p>

//       {/* Giant number */}
//       <div className="relative my-4">
//         <p className="font-display font-black text-[9rem] leading-none text-marigold tracking-tight">
//           {orderNumber}
//         </p>
//         <div className="absolute inset-0 blur-3xl bg-marigold/20 -z-10 scale-150 rounded-full" />
//       </div>

//       <p className="font-display text-2xl font-bold text-cream mb-2">
//         Numéro <span className="text-marigold">{orderNumber}</span> — Prête !
//       </p>
//       <p className="text-mute/60 text-sm mb-10">
//         Annoncez ce numéro à vos clients
//       </p>

//       <button
//         onClick={onClose}
//         className="bg-marigold hover:bg-marigold-light text-char font-bold px-8 py-4 rounded-full text-lg transition active:scale-95"
//       >
//         Fermer
//       </button>
//     </div>
//   );
// }


