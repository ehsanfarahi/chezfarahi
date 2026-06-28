import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, CheckCircle, Clock, ShoppingBag } from "lucide-react";
import { buildOrder, formatTime, saveCustomerOrder } from "../utils/orderUtils";

// import { buildOrder, formatTime, saveCustomerOrder } from "../utils/orderUtils";

export default function OrderQRModal({ cart, open, onClose, onConfirmed }) {
  const [order, setOrder] = useState(null);

  // Build order once when modal opens
  // useEffect(() => {
  //   if (open && cart.length > 0) {
  //     setOrder(buildOrder(cart));
  //   }
  // }, [open]);

  useEffect(() => {
  if (open && cart.length > 0) {
    const newOrder = buildOrder(cart);
    setOrder(newOrder);
    saveCustomerOrder(newOrder); // ← add this line
  }
}, [open]);

  if (!open || !order) return null;

  const qrValue = JSON.stringify(order);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full sm:w-auto sm:min-w-[360px] bg-char-soft rounded-t-3xl sm:rounded-3xl z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cream/10">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-marigold" />
            <h2 className="font-display text-lg font-semibold text-cream">
              Votre commande
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-cream/10"
          >
            <X size={18} className="text-cream" />
          </button>
        </div>

        <div className="px-5 py-5">
          {/* Instruction */}
          <div className="bg-marigold/10 border border-marigold/30 rounded-2xl px-4 py-3 mb-5 flex items-start gap-3">
            <span className="text-2xl shrink-0">📱</span>
            <p className="text-sm text-mute/90 leading-snug">
              Montrez ce QR code au comptoir. Nous le scannons et votre commande est prise en charge instantanément.
            </p>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-xl shadow-black/30">
              <QRCodeSVG
                value={qrValue}
                size={200}
                level="M"
                includeMargin={false}
                fgColor="#1B1411"
                bgColor="#FFFFFF"
              />
            </div>

            {/* Order ID */}
            <div className="text-center">
              <p className="text-xs text-mute/50 uppercase tracking-wider">Numéro de commande</p>
              <p className="font-mono text-sm font-semibold text-marigold mt-0.5">
                {order.orderId}
              </p>
            </div>
          </div>

          {/* Order summary */}
          <div className="mt-5 bg-char rounded-2xl overflow-hidden divide-y divide-cream/5">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-sm text-cream">
                  {item.qty > 1 ? `${item.qty}× ` : ""}{item.name}
                </span>
                <span className="font-mono text-sm text-mute/70">
                  {item.lineTotal.toFixed(2)}€
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between px-4 py-3 bg-marigold/10">
              <span className="text-sm font-semibold text-cream">Total</span>
              <span className="font-mono font-bold text-marigold">
                {order.total.toFixed(2)}€
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
            className="w-full mt-4 bg-herb/20 hover:bg-herb/30 border border-herb/40 text-herb font-semibold py-3 rounded-full transition flex items-center justify-center gap-2"
          >
            <CheckCircle size={17} />
            Commande confirmée
          </button>
        </div>
      </div>
    </div>
  );
}
