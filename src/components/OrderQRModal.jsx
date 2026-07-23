import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  X, Clock, Bell, BellOff, CheckCircle,
  MessageSquare, User, ChevronDown,
} from "lucide-react";
import { buildOrder, saveCustomerOrder, formatTime } from "../utils/orderUtils";
import { registerAndSubscribe, startStatusPolling, isPushSupported } from "../utils/pushUtils";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function OrderQRModal({
  cart, open, onClose, onConfirmed, onOrderReady,
  collectCustomerInfo = false,
}) {
  const [orderNumber, setOrderNumber] = useState(null);
  const [orderDate,   setOrderDate]   = useState(null);
  const [qrPayload,   setQrPayload]   = useState(null);
  const [uniqueRef,   setUniqueRef]   = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [pushStatus,  setPushStatus]  = useState("idle");
  const [error,       setError]       = useState("");
  const [note,        setNote]        = useState("");
  const [showNote,    setShowNote]    = useState(false);
  const [customerName,  setCustomerName]  = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [showInfo,    setShowInfo]    = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    if (open && cart.length > 0) createOrder();
    if (!open) resetState();
  }, [open]);

  function resetState() {
    setOrderNumber(null); setOrderDate(null);
    setQrPayload(null); setUniqueRef(null);
    setError(""); setPushStatus("idle");
    setNote(""); setShowNote(false);
    setCustomerName(""); setCustomerPhone("");
    setShowInfo(false); setShowSummary(false);
  }

  async function createOrder() {
    setLoading(true);
    setError("");
    try {
      const items = cart.map((i) => ({
        id:        i.id,
        name:      i.name,
        qty:       i.qty,
        unitPrice: i.price,
        lineTotal: parseFloat((i.price * i.qty).toFixed(2)),
        type:      i.isCombo ? "combo" : i.isMenuDuJour ? "menuDuJour" : "regular",
        details:   i.comboDetails || i.menuDuJourDetails || null,
      }));
      const total = parseFloat(
        cart.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2)
      );

      const res = await fetch(`${API_URL}/api/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, total, note, customerName, customerPhone }),
      });
      if (!res.ok) throw new Error("Server error");

      const { orderNumber: num, qrPayload: qr, uniqueRef: ref } = await res.json();
      const today = new Date().toISOString().slice(0, 10);

      setOrderNumber(num);
      setOrderDate(today);
      setQrPayload(qr);
      setUniqueRef(ref);

      saveCustomerOrder({ ...buildOrder(cart), orderNumber: num, uniqueRef: ref });

      localStorage.setItem(
        "camion_pending_order",
        JSON.stringify({ orderNumber: num, date: today, status: "pending" })
      );

      // Poll for order ready
      startStatusPolling(num, (readyNum) => {
        saveNotificationToStorage({
          id:          `notif-${readyNum}-${Date.now()}`,
          orderNumber: readyNum,
          date:        today,
          message:     `Votre commande n°${readyNum} est prête ! Venez la récupérer.`,
          timestamp:   new Date().toISOString(),
          read:        false,
        });
        localStorage.setItem(
          "camion_pending_order",
          JSON.stringify({ orderNumber: readyNum, date: today, status: "ready" })
        );
        onOrderReady?.(readyNum);
      });

      // Request push
      if (isPushSupported()) {
        setPushStatus("requesting");
        const ok = await registerAndSubscribe(num, today);
        setPushStatus(ok ? "granted" : "denied");
      }
    } catch {
      setError("Impossible de créer la commande. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  }

  function saveNotificationToStorage(notif) {
    try {
      const existing = JSON.parse(localStorage.getItem("camion_notifications") || "[]");
      localStorage.setItem(
        "camion_notifications",
        JSON.stringify([notif, ...existing].slice(0, 20))
      );
    } catch {}
  }

  if (!open) return null;

  const totalDisplay = cart.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2);

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" onClick={onClose} />

      <div className="fixed bottom-0 left-0 right-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-50">
        <div className="relative w-full sm:w-auto sm:min-w-[380px] sm:max-w-md bg-char-soft rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[95vh] overflow-y-auto">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-cream/10 sticky top-0 bg-char-soft z-10">
            <h2 className="font-display text-lg font-semibold text-cream">
              {loading ? "Création..." : orderNumber ? `Commande n°${orderNumber}` : "Votre commande"}
            </h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-cream/10">
              <X size={18} className="text-cream" />
            </button>
          </div>

          <div className="px-5 py-5">

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center gap-4 py-10">
                <span className="text-5xl animate-bounce">🥟</span>
                <p className="text-mute/60 text-sm">Création de votre commande...</p>
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="bg-chili/15 border border-chili/30 rounded-2xl px-4 py-3 text-chili text-sm mb-4">
                {error}
              </div>
            )}

            {/* Pre-order extras (shown before submitting) */}
            {!orderNumber && !loading && !error && (
              <div className="space-y-3 mb-4">
                {/* Note */}
                <button
                  onClick={() => setShowNote((s) => !s)}
                  className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-full border transition w-full ${
                    showNote
                      ? "bg-marigold/10 border-marigold/40 text-marigold"
                      : "border-cream/15 text-mute hover:text-cream hover:border-cream/30"
                  }`}
                >
                  <MessageSquare size={15} />
                  {showNote ? "Masquer la note" : "Ajouter une note pour la cuisine"}
                </button>
                {showNote && (
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ex: sans piment, allergie noix, sauce en plus..."
                    rows={3}
                    maxLength={200}
                    className="w-full bg-char border border-cream/15 focus:border-marigold/50 rounded-2xl px-4 py-3 text-sm text-cream placeholder-mute/40 resize-none outline-none transition"
                  />
                )}

                {/* Optional customer info */}
                {collectCustomerInfo && (
                  <>
                    <button
                      onClick={() => setShowInfo((s) => !s)}
                      className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-full border transition w-full ${
                        showInfo
                          ? "bg-marigold/10 border-marigold/40 text-marigold"
                          : "border-cream/15 text-mute hover:text-cream hover:border-cream/30"
                      }`}
                    >
                      <User size={15} />
                      {showInfo ? "Masquer les infos" : "Ajouter mon nom (optionnel)"}
                    </button>
                    {showInfo && (
                      <div className="space-y-2">
                        <input
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Votre prénom (optionnel)"
                          className="w-full bg-char border border-cream/15 focus:border-marigold/50 rounded-2xl px-4 py-2.5 text-sm text-cream placeholder-mute/40 outline-none transition"
                        />
                        <input
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="Téléphone (optionnel)"
                          type="tel"
                          className="w-full bg-char border border-cream/15 focus:border-marigold/50 rounded-2xl px-4 py-2.5 text-sm text-cream placeholder-mute/40 outline-none transition"
                        />
                        <p className="text-[10px] text-mute/35 text-center">
                          Ces informations sont optionnelles et uniquement utilisées pour identifier votre commande
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Order created */}
            {!loading && qrPayload && orderNumber && (
              <>
                {/* Instruction */}
                <div className="bg-marigold/10 border border-marigold/30 rounded-2xl px-4 py-3 mb-5 flex items-start gap-3">
                  <span className="text-2xl shrink-0">📱</span>
                  <p className="text-sm text-mute/90 leading-snug">
                    Montrez ce QR code au comptoir. Vous serez notifié dès que votre commande est prête.
                  </p>
                </div>

                {/* Customer note display */}
                {note && (
                  <div className="bg-marigold/8 border border-marigold/20 rounded-xl px-3 py-2.5 mb-4 flex items-start gap-2">
                    <MessageSquare size={13} className="text-marigold shrink-0 mt-0.5" />
                    <p className="text-xs text-mute/80 italic">"{note}"</p>
                  </div>
                )}

                {/* Big 3-digit order number */}
                <div className="flex flex-col items-center mb-5">
                  <p className="text-xs text-mute/50 uppercase tracking-widest mb-1">
                    Numéro de commande
                  </p>
                  <div className="relative">
                    <p className="font-display font-black text-[5.5rem] text-marigold leading-none tracking-tight">
                      {orderNumber}
                    </p>
                    <div className="absolute inset-0 blur-2xl bg-marigold/15 -z-10 scale-150 rounded-full" />
                  </div>
                  {uniqueRef && (
                    <p className="text-[10px] text-mute/35 font-mono mt-1">
                      Réf: {uniqueRef}
                    </p>
                  )}
                </div>

                {/* QR Code — tiny because it only encodes the order reference */}
                <div className="flex justify-center mb-5">
                  <div className="bg-white p-4 rounded-2xl shadow-xl shadow-black/30">
                    <QRCodeSVG
                      value={qrPayload}
                      size={180}
                      level="L"
                      fgColor="#1B1411"
                      bgColor="#FFFFFF"
                    />
                  </div>
                  <p className="sr-only">QR code: {qrPayload}</p>
                </div>

                {/* Push status */}
                <div className="flex items-center justify-center gap-2 mb-4 text-xs min-h-[20px]">
                  {pushStatus === "granted" && (
                    <span className="flex items-center gap-1.5 text-herb">
                      <Bell size={13} /> Vous serez notifié quand votre commande est prête
                    </span>
                  )}
                  {pushStatus === "denied" && (
                    <span className="flex items-center gap-1.5 text-mute/50">
                      <BellOff size={13} /> Restez sur l'appli pour voir l'état de votre commande
                    </span>
                  )}
                  {pushStatus === "requesting" && (
                    <span className="flex items-center gap-1.5 text-mute/60 animate-pulse">
                      <Bell size={13} /> Activation des notifications...
                    </span>
                  )}
                  {pushStatus === "idle" && (
                    <span className="flex items-center gap-1.5 text-mute/50">
                      <Clock size={13} /> En attente de préparation...
                    </span>
                  )}
                </div>

                {/* Collapsible order summary */}
                <div className="mb-4">
                  <button
                    onClick={() => setShowSummary((s) => !s)}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-char rounded-t-2xl text-sm text-mute/60 hover:text-cream transition"
                  >
                    <span>Récapitulatif ({cart.length} article{cart.length > 1 ? "s" : ""})</span>
                    <ChevronDown size={14} className={`transition-transform ${showSummary ? "rotate-180" : ""}`} />
                  </button>
                  {showSummary && (
                    <div className="bg-char rounded-b-2xl divide-y divide-cream/5">
                      {cart.map((item, i) => (
                        <div key={i} className="flex items-center justify-between px-4 py-2.5">
                          <span className="text-sm text-cream">
                            {item.qty > 1 ? `${item.qty}× ` : ""}{item.name}
                          </span>
                          <span className="font-mono text-sm text-mute/70">
                            {(item.price * item.qty).toFixed(2)}€
                          </span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between px-4 py-3 bg-marigold/10 rounded-b-2xl">
                        <span className="text-sm font-semibold text-cream">Total</span>
                        <span className="font-mono font-bold text-marigold">{totalDisplay}€</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm */}
                <button
                  onClick={() => { onConfirmed?.(); onClose(); }}
                  className="w-full flex items-center justify-center gap-2 bg-herb/20 hover:bg-herb/30 border border-herb/40 text-herb font-semibold py-3 rounded-full transition"
                >
                  <CheckCircle size={17} /> Commande confirmée
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}


















// import { useEffect, useState } from "react";
// import { QRCodeSVG } from "qrcode.react";
// import { X, Clock, Bell, BellOff, CheckCircle } from "lucide-react";
// import { buildOrder, saveCustomerOrder, formatTime } from "../utils/orderUtils";
// import {
//   registerAndSubscribe,
//   startStatusPolling,
//   isPushSupported,
// } from "../utils/pushUtils";

// const API_URL = import.meta.env.VITE_API_URL || "";

// export default function OrderQRModal({
//   cart,
//   open,
//   onClose,
//   onConfirmed,
//   onOrderReady,
// }) {
//   const [order, setOrder] = useState(null);
//   const [orderNumber, setOrderNumber] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [pushStatus, setPushStatus] = useState("idle");
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (open && cart.length > 0) {
//       createOrder();
//     }
//     if (!open) {
//       setOrder(null);
//       setOrderNumber(null);
//       setError("");
//       setPushStatus("idle");
//     }
//   }, [open]);

//   async function createOrder() {
//     setLoading(true);
//     setError("");
//     try {
//       // Step 1 — get 3-digit number from server
//       const res = await fetch(`${API_URL}/api/order`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           items: cart.map((i) => ({
//             id: i.id,
//             name: i.name,
//             qty: i.qty,
//             unitPrice: i.price,
//             lineTotal: parseFloat((i.price * i.qty).toFixed(2)),
//           })),
//           total: parseFloat(
//             cart.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2)
//           ),
//         }),
//       });

//       if (!res.ok) throw new Error("Server error");
//       const { orderNumber: num } = await res.json();

//       // Step 2 — build full order object
//       const newOrder = { ...buildOrder(cart), orderNumber: num };
//       setOrder(newOrder);
//       setOrderNumber(num);

//       // Step 3 — save to customer history
//       saveCustomerOrder({ ...newOrder, orderNumber: num });

//       // Step 4 — save to localStorage for global watcher
//       localStorage.setItem(
//         "camion_pending_order",
//         JSON.stringify({ orderNumber: num, status: "pending" })
//       );

//       // Step 5 — start polling every 3 seconds
//       startStatusPolling(num, (readyNum) => {
//         localStorage.setItem(
//           "camion_pending_order",
//           JSON.stringify({ orderNumber: readyNum, status: "ready" })
//         );
//         onOrderReady?.(readyNum);
//       });

//       // Step 6 — request push permission
//       requestPush(num);
//     } catch {
//       setError("Impossible de créer la commande. Vérifiez votre connexion.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function requestPush(num) {
//     if (!isPushSupported()) return;
//     setPushStatus("requesting");
//     const success = await registerAndSubscribe(num);
//     setPushStatus(success ? "granted" : "denied");
//   }

//   if (!open) return null;

//   const qrValue = order ? JSON.stringify(order) : "";

//   return (
//     <>
//       {/* Backdrop */}
//       <div
//         className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
//         onClick={onClose}
//       />

//       {/* Modal — slides up from bottom on mobile, centered on desktop */}
//       <div className="fixed bottom-0 left-0 right-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-50">
//         <div className="relative w-full sm:w-auto sm:min-w-[380px] bg-char-soft rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[95vh] overflow-y-auto">

//           {/* Header */}
//           <div className="flex items-center justify-between px-5 py-4 border-b border-cream/10 sticky top-0 bg-char-soft z-10">
//             <h2 className="font-display text-lg font-semibold text-cream">
//               Votre commande
//             </h2>
//             <button
//               onClick={onClose}
//               className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-cream/10"
//             >
//               <X size={18} className="text-cream" />
//             </button>
//           </div>

//           <div className="px-5 py-5">

//             {/* Loading */}
//             {loading && (
//               <div className="flex flex-col items-center gap-4 py-10">
//                 <span className="text-5xl animate-bounce">🥟</span>
//                 <p className="text-mute/60 text-sm">
//                   Création de votre commande...
//                 </p>
//               </div>
//             )}

//             {/* Error */}
//             {error && !loading && (
//               <div className="bg-chili/15 border border-chili/30 rounded-2xl px-4 py-3 text-chili text-sm">
//                 {error}
//               </div>
//             )}

//             {/* Order ready */}
//             {!loading && order && orderNumber && (
//               <>
//                 {/* Instruction */}
//                 <div className="bg-marigold/10 border border-marigold/30 rounded-2xl px-4 py-3 mb-5 flex items-start gap-3">
//                   <span className="text-2xl shrink-0">📱</span>
//                   <p className="text-sm text-mute/90 leading-snug">
//                     Montrez ce QR code au comptoir. Nous le scannerons et vous
//                     serez notifié dès que votre commande est prête.
//                   </p>
//                 </div>

//                 {/* Big 3-digit order number */}
//                 <div className="flex flex-col items-center mb-5">
//                   <p className="text-xs text-mute/50 uppercase tracking-widest mb-1">
//                     Numéro de commande
//                   </p>
//                   <div className="relative">
//                     <p className="font-display font-black text-[5.5rem] text-marigold leading-none tracking-tight">
//                       {orderNumber}
//                     </p>
//                     <div className="absolute inset-0 blur-2xl bg-marigold/15 -z-10 scale-150 rounded-full" />
//                   </div>
//                 </div>

//                 {/* QR Code */}
//                 <div className="flex justify-center mb-5">
//                   <div className="bg-white p-4 rounded-2xl shadow-xl shadow-black/30">
//                     <QRCodeSVG
//                       value={qrValue}
//                       size={180}
//                       level="M"
//                       fgColor="#1B1411"
//                       bgColor="#FFFFFF"
//                     />
//                   </div>
//                 </div>

//                 {/* Push notification status */}
//                 <div className="flex items-center justify-center gap-2 mb-4 text-xs min-h-[20px]">
//                   {pushStatus === "granted" && (
//                     <span className="flex items-center gap-1.5 text-herb">
//                       <Bell size={13} />
//                       Vous serez notifié quand votre commande est prête
//                     </span>
//                   )}
//                   {pushStatus === "denied" && (
//                     <span className="flex items-center gap-1.5 text-mute/50">
//                       <BellOff size={13} />
//                       Notifications désactivées — restez sur l'appli
//                     </span>
//                   )}
//                   {pushStatus === "requesting" && (
//                     <span className="flex items-center gap-1.5 text-mute/60 animate-pulse">
//                       <Bell size={13} />
//                       Activation des notifications...
//                     </span>
//                   )}
//                   {pushStatus === "idle" && (
//                     <span className="flex items-center gap-1.5 text-mute/50">
//                       <Clock size={13} />
//                       En attente de confirmation...
//                     </span>
//                   )}
//                 </div>

//                 {/* Order summary */}
//                 <div className="bg-char rounded-2xl overflow-hidden divide-y divide-cream/5 mb-4">
//                   {cart.map((item, i) => (
//                     <div
//                       key={i}
//                       className="flex items-center justify-between px-4 py-2.5"
//                     >
//                       <span className="text-sm text-cream">
//                         {item.qty > 1 ? `${item.qty}× ` : ""}
//                         {item.name}
//                       </span>
//                       <span className="font-mono text-sm text-mute/70">
//                         {(item.price * item.qty).toFixed(2)}€
//                       </span>
//                     </div>
//                   ))}
//                   <div className="flex items-center justify-between px-4 py-3 bg-marigold/10">
//                     <span className="text-sm font-semibold text-cream">
//                       Total
//                     </span>
//                     <span className="font-mono font-bold text-marigold">
//                       {cart.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2)}€
//                     </span>
//                   </div>
//                 </div>

//                 {/* Timestamp */}
//                 <div className="flex items-center justify-center gap-1.5 mb-4 text-xs text-mute/40">
//                   <Clock size={12} />
//                   Commandé à {formatTime(order.timestamp)}
//                 </div>

//                 {/* Confirm button */}
//                 <button
//                   onClick={() => {
//                     onConfirmed?.();
//                     onClose();
//                   }}
//                   className="w-full flex items-center justify-center gap-2 bg-herb/20 hover:bg-herb/30 border border-herb/40 text-herb font-semibold py-3 rounded-full transition"
//                 >
//                   <CheckCircle size={17} />
//                   Commande confirmée
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }