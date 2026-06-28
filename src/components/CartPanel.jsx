import { X, Minus, Plus, Trash2 } from "lucide-react";

import OrderQRModal from "./OrderQRModal";
import { useState } from "react";

import OrderHistoryTab from "./OrderHistoryTab";
import { ShoppingBag, ClipboardList } from "lucide-react"; // add ClipboardList

export default function CartPanel({ open, onClose, cart, onInc, onDec, onRemove, onClearCart, onReorder }) {
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const [showQR, setShowQR] = useState(false);
  const [activeTab, setActiveTab] = useState("cart"); // "cart" | "history"


  const handleReorder = (items) => onReorder?.(items);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-char-soft z-50 shadow-2xl transition-transform duration-300 flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* <div className="flex items-center justify-between px-5 py-4 border-b border-cream/10">
          <h2 className="font-display text-xl font-semibold text-cream">Votre commande</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-cream/10"
            aria-label="Fermer le panier"
          >
            <X size={18} className="text-cream" />
          </button>
        </div> */}


<div className="border-b border-cream/10">
  {/* Close button row */}
  <div className="flex items-center justify-between px-5 pt-4 pb-2">
    <span className="font-display text-lg font-semibold text-cream">
      {activeTab === "cart" ? "Votre commande" : "Historique"}
    </span>
    <button
      onClick={onClose}
      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-cream/10"
      aria-label="Fermer"
    >
      <X size={18} className="text-cream" />
    </button>
  </div>

  {/* Tabs */}
  <div className="flex px-5 pb-0 gap-1">
    <button
      onClick={() => setActiveTab("cart")}
      className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-t-xl transition border-b-2 ${
        activeTab === "cart"
          ? "text-marigold border-marigold bg-marigold/5"
          : "text-mute/60 border-transparent hover:text-mute"
      }`}
    >
      <ShoppingBag size={14} />
      Panier
      {cart.length > 0 && (
        <span className="bg-chili text-cream text-[10px] font-mono font-bold rounded-full w-4 h-4 flex items-center justify-center">
          {cart.reduce((s, i) => s + i.qty, 0)}
        </span>
      )}
    </button>
    <button
      onClick={() => setActiveTab("history")}
      className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-t-xl transition border-b-2 ${
        activeTab === "history"
          ? "text-marigold border-marigold bg-marigold/5"
          : "text-mute/60 border-transparent hover:text-mute"
      }`}
    >
      <ClipboardList size={14} />
      Historique
    </button>
  </div>
</div>




        {/* <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {cart.length === 0 ? (
            <p className="text-mute/70 text-sm mt-8 text-center">
              Votre panier est vide. Ajoutez quelque chose de bon !
            </p>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-cream font-medium text-sm">{item.name}</p>
                  <p className="font-mono text-xs text-mute/70">{item.price.toFixed(2)}€</p>
                </div>
                <div className="flex items-center gap-2 bg-char rounded-full px-2 py-1">
                  <button onClick={() => onDec(item.id)} className="text-mute hover:text-marigold">
                    <Minus size={14} />
                  </button>
                  <span className="font-mono text-sm w-4 text-center text-cream">{item.qty}</span>
                  <button onClick={() => onInc(item.id)} className="text-mute hover:text-marigold">
                    <Plus size={14} />
                  </button>
                </div>
                <button onClick={() => onRemove(item.id)} className="text-mute/50 hover:text-chili">
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div> */}





{activeTab === "cart" ? (
  // < ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
<div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {cart.length === 0 ? (
            <p className="text-mute/70 text-sm mt-8 text-center">
              Votre panier est vide. Ajoutez quelque chose de bon !
            </p>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-cream font-medium text-sm">{item.name}</p>
                  <p className="font-mono text-xs text-mute/70">{item.price.toFixed(2)}€</p>
                </div>
                <div className="flex items-center gap-2 bg-char rounded-full px-2 py-1">
                  <button onClick={() => onDec(item.id)} className="text-mute hover:text-marigold">
                    <Minus size={14} />
                  </button>
                  <span className="font-mono text-sm w-4 text-center text-cream">{item.qty}</span>
                  <button onClick={() => onInc(item.id)} className="text-mute hover:text-marigold">
                    <Plus size={14} />
                  </button>
                </div>
                <button onClick={() => onRemove(item.id)} className="text-mute/50 hover:text-chili">
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>) : (

           <div className="relative flex-1 flex flex-col px-5 py-4 overflow-hidden">
    <OrderHistoryTab
      onReorder={handleReorder}
      onClose={onClose}
    />
  </div>

)}














        <div className="border-t border-cream/10 px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-mute text-sm">Total</span>
            <span className="font-mono text-lg font-semibold text-cream">{total.toFixed(2)}€</span>
          </div>
          {/* <button
            disabled={cart.length === 0}
            className="w-full bg-chili hover:bg-chili-dark disabled:bg-cream/10 disabled:text-mute/40 text-cream font-semibold py-3 rounded-full transition active:scale-95"
          >
            Commander
          </button> */}

          <button
  disabled={cart.length === 0}
  onClick={() => setShowQR(true)}
  className="w-full bg-chili hover:bg-chili-dark disabled:bg-cream/10 disabled:text-mute/40 text-cream font-semibold py-3 rounded-full transition active:scale-95"
>
  Commander
</button>

<OrderQRModal
  cart={cart}
  open={showQR}
  onClose={() => setShowQR(false)}
  onConfirmed={onClearCart}
/>
        </div>
      </aside>
    </>
  );
}
