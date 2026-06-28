import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  getCustomerOrders,
  clearCustomerOrders,
  formatTime,
} from "../utils/orderUtils";
import {
  ShoppingBag,
  RotateCw,
  QrCode,
  ChevronDown,
  ChevronUp,
  Trash2,
  X,
  Clock,
  PackageOpen,
} from "lucide-react";

export default function OrderHistoryTab({ onReorder, onClose }) {
  const [orders, setOrders] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [qrOrder, setQrOrder] = useState(null); // order whose QR is being shown

  useEffect(() => {
    setOrders(getCustomerOrders());
  }, []);

  const handleClear = () => {
    if (window.confirm("Effacer tout votre historique de commandes ?")) {
      clearCustomerOrders();
      setOrders([]);
    }
  };

  const handleReorder = (order) => {
    // Convert order items back to cart-compatible shape
    const cartItems = order.items.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.unitPrice,
      qty: item.qty,
      desc: "",
    }));
    onReorder(cartItems);
    onClose();
  };

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center px-4">
        <span className="text-5xl">📋</span>
        <p className="font-display text-base text-cream font-semibold">
          Aucune commande passée
        </p>
        <p className="text-xs text-mute/60 leading-relaxed">
          Vos prochaines commandes apparaîtront ici. Vous pourrez les réafficher ou les recommander en un tap.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* QR re-show overlay */}
      {qrOrder && (
        <div className="absolute inset-0 z-10 bg-char-soft flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-cream/10">
            <h3 className="font-display font-semibold text-cream">
              QR — {qrOrder.orderId}
            </h3>
            <button
              onClick={() => setQrOrder(null)}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-cream/10"
            >
              <X size={18} className="text-cream" />
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-5">
            <div className="bg-white p-4 rounded-2xl shadow-xl shadow-black/30">
              <QRCodeSVG
                value={JSON.stringify(qrOrder)}
                size={200}
                level="M"
                fgColor="#1B1411"
                bgColor="#FFFFFF"
              />
            </div>
            <p className="text-xs text-mute/60 text-center max-w-xs leading-relaxed">
              Montrez ce QR code au comptoir pour que votre commande soit reprise.
            </p>
            <div className="text-center">
              <p className="text-xs text-mute/50 uppercase tracking-wider">Total</p>
              <p className="font-mono font-bold text-marigold text-lg">
                {qrOrder.total.toFixed(2)}€
              </p>
            </div>
          </div>
        </div>
      )}

      {/* History list */}
      <div className="flex items-center justify-between px-1 mb-3">
        <p className="text-xs text-mute/60">
          {orders.length} commande{orders.length > 1 ? "s" : ""}
        </p>
        <button
          onClick={handleClear}
          className="text-xs text-mute/40 hover:text-chili flex items-center gap-1 transition"
        >
          <Trash2 size={12} /> Tout effacer
        </button>
      </div>

      <div className="space-y-3 overflow-y-auto flex-1 pr-0.5">
        {orders.map((order) => (
          <div
            key={order.orderId}
            className="bg-char rounded-2xl overflow-hidden border border-cream/5"
          >
            {/* Order header */}
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer"
              onClick={() =>
                setExpandedId(expandedId === order.orderId ? null : order.orderId)
              }
            >
              <div>
                <p className="font-mono text-[10px] text-mute/40">{order.orderId}</p>
                <p className="text-sm font-medium text-cream mt-0.5">
                  {order.items.length} article{order.items.length > 1 ? "s" : ""}
                  <span className="text-mute/50 mx-1">·</span>
                  <span className="font-mono text-marigold font-semibold">
                    {order.total.toFixed(2)}€
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-mute/40 flex items-center gap-1">
                  <Clock size={10} />
                  {formatTime(order.savedAt || order.timestamp)}
                </span>
                {expandedId === order.orderId ? (
                  <ChevronUp size={14} className="text-mute/40" />
                ) : (
                  <ChevronDown size={14} className="text-mute/40" />
                )}
              </div>
            </div>

            {/* Expanded detail */}
            {expandedId === order.orderId && (
              <div className="border-t border-cream/5 px-4 pb-4 pt-3">
                {/* Items breakdown */}
                <div className="space-y-1.5 mb-4">
                  {order.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-mute/80">
                        {item.qty > 1 ? `${item.qty}× ` : ""}
                        {item.name}
                      </span>
                      <span className="font-mono text-xs text-mute/50">
                        {item.lineTotal.toFixed(2)}€
                      </span>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Re-show QR */}
                  <button
                    onClick={() => setQrOrder(order)}
                    className="flex items-center justify-center gap-1.5 text-xs border border-cream/15 text-mute hover:text-cream hover:border-cream/30 py-2.5 rounded-full transition"
                  >
                    <QrCode size={13} />
                    Revoir le QR
                  </button>

                  {/* Reorder */}
                  <button
                    onClick={() => handleReorder(order)}
                    className="flex items-center justify-center gap-1.5 text-xs bg-marigold hover:bg-marigold-light text-char font-semibold py-2.5 rounded-full transition active:scale-95"
                  >
                    <RotateCw size={13} />
                    Recommander
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
