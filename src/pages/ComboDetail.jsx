import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Share2, Minus, Plus, Star, Check, Tag } from "lucide-react";
// import { popularCombos, calcComboPrice } from "../data/combos";
import { useMenuData } from "../hooks/useMenuData";

import { useCombosData } from "../hooks/useCombosData";
import { calcComboPrice } from "../utils/comboUtils";

export default function ComboDetail({ onAdd }) {
  const { id } = useParams();
  const navigate = useNavigate();
  // const { menuItems } = useMenuData();
  const [qty, setQty] = useState(1);
  const [favorited, setFavorited] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  // const combo = popularCombos.find((c) => c.id === id);

  const { getComboById, loading: combosLoading } = useCombosData();
const { menuItems, loading: menuLoading } = useMenuData();

const combo = getComboById(id);
const loading = combosLoading || menuLoading;

  // if (!combo || menuItems.length === 0) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-char text-mute">
  //       Chargement...
  //     </div>
  //   );
  // }

  if (loading) {
  return (
    <div className="min-h-screen bg-char flex flex-col items-center justify-center gap-3">
      <span className="text-5xl animate-bounce">🥟</span>
      <p className="text-mute/50 text-sm">Chargement...</p>
    </div>
  );
}

if (!combo) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-char text-cream gap-4">
      <p className="text-mute">Combo introuvable.</p>
      <button onClick={() => navigate(-1)}
        className="bg-marigold text-char font-semibold px-5 py-2.5 rounded-full">
        Retour
      </button>
    </div>
  );
}

  const pricing = calcComboPrice(combo, menuItems);
  const total = (pricing.discounted * qty).toFixed(2);
  const totalOriginal = (pricing.original * qty).toFixed(2);

  const handleAdd = () => {
    onAdd?.({ id: combo.id, name: combo.name, price: pricing.discounted, qty, comboDetails: {
    items: combo.items,       // [{ name, originalPrice, comboPrice }]
    beverages: combo.beverages || [],
  } });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  return (
    <div className="min-h-screen max-w-5xl mx-auto bg-char text-cream pb-28">
      {/* Hero */}
      <div className="relative w-full h-[36vh] sm:h-[40vh] overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-marigold/30 via-char-soft to-chili/20 flex items-center justify-center">
          {combo.image ? <span><img src={combo.image} /></span> : <span className="text-[6rem] drop-shadow-lg">{combo.emoji}</span>}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-char via-transparent to-black/20 pointer-events-none" />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-char/60 backdrop-blur-md flex items-center justify-center hover:bg-char/80 active:scale-95 transition"
        >
          <ArrowLeft size={18} className="text-cream" />
        </button>

        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={() => setFavorited((f) => !f)}
            className="w-10 h-10 rounded-full bg-char/60 backdrop-blur-md flex items-center justify-center"
          >
            <Heart size={18} className={favorited ? "fill-chili text-chili" : "text-cream"} />
          </button>
          <button className="w-10 h-10 rounded-full bg-char/60 backdrop-blur-md flex items-center justify-center">
            <Share2 size={16} className="text-cream" />
          </button>
        </div>

        <div className="absolute bottom-3 left-4 z-10">
          <span className="text-[10px] uppercase tracking-wider font-semibold bg-marigold text-char px-2.5 py-1 rounded-full">
            {combo.tag}
          </span>
        </div>
      </div>

      {/* Info card */}
      <div className="relative -mt-6 bg-char-soft rounded-t-3xl">
        {/* Quantity stepper */}
        <div className="absolute -top-6 right-4 flex items-center gap-3 bg-char border border-cream/10 rounded-full px-3 py-2 shadow-xl">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-7 h-7 rounded-full bg-char-soft flex items-center justify-center hover:bg-cream/10 active:scale-90 transition"
          >
            <Minus size={14} />
          </button>
          <span className="font-mono font-semibold text-sm w-4 text-center">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="w-7 h-7 rounded-full bg-marigold text-char flex items-center justify-center hover:bg-marigold-light active:scale-90 transition"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="px-5 pt-7 pb-4">
          {/* Name + price */}
          <div className="flex items-start justify-between gap-4 pr-20">
            <div>
              <h1 className="font-display text-2xl font-bold leading-tight">{combo.name}</h1>
              <div className="flex items-center gap-1.5 mt-1.5">
                <Star size={13} className="fill-marigold text-marigold" />
                <span className="text-sm font-medium">{combo.rating}</span>
                <span className="text-xs text-mute/60">({combo.reviews} avis)</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="font-mono text-xl font-semibold text-marigold">
                {pricing.discounted.toFixed(2)}€
              </p>
              {pricing.savings > 0 && (
                <p className="font-mono text-xs text-mute/40 line-through">
                  {pricing.original.toFixed(2)}€
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Price breakdown */}
        <div className="px-5 pb-4">
          <h2 className="font-display text-base font-semibold mb-3 flex items-center gap-2">
            <Tag size={15} className="text-marigold" />
            Détail des prix
          </h2>
          <div className="bg-char rounded-2xl overflow-hidden divide-y divide-cream/5">
            {pricing.breakdown.map((line, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3">
                <div className="flex-1">
                  <p className="text-sm text-cream font-medium">
                    {line.qty > 1 ? `${line.qty}× ` : ""}{line.name}
                  </p>
                  {line.unitDiscount > 0 && (
                    <p className="text-[11px] text-herb mt-0.5">
                      Promotion: -{line.unitDiscount.toFixed(2)}€ par unité
                    </p>
                  )}
                </div>
                <div className="text-right ml-4">
                  <p className="font-mono text-sm font-semibold text-cream">
                    {line.lineDiscounted.toFixed(2)}€
                  </p>
                  {line.unitDiscount > 0 && (
                    <p className="font-mono text-[10px] text-mute/40 line-through">
                      {line.lineOriginal.toFixed(2)}€
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Total row */}
            <div className="flex items-center justify-between px-4 py-3 bg-marigold/10">
              <p className="text-sm font-semibold text-cream">Total combo</p>
              <div className="text-right">
                <p className="font-mono font-bold text-marigold">
                  {pricing.discounted.toFixed(2)}€
                </p>
                {pricing.savings > 0 && (
                  <p className="font-mono text-[10px] text-mute/40 line-through">
                    {pricing.original.toFixed(2)}€
                  </p>
                )}
              </div>
            </div>
          </div>

          {pricing.savings > 0 && (
            <div className="mt-3 flex items-center gap-2 bg-herb/15 border border-herb/30 rounded-xl px-4 py-2.5">
              <span className="text-herb text-lg">🎉</span>
              <p className="text-sm text-herb font-medium">
                Vous économisez <span className="font-bold">{pricing.savings.toFixed(2)}€</span> avec ce combo !
              </p>
            </div>
          )}
        </div>

        <div className="h-4" />
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed max-w-5xl mx-auto bottom-0 inset-x-0 z-40 bg-char-soft border-t border-cream/10 px-5 py-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-mute/60">Total ({qty} combo{qty > 1 ? "s" : ""})</p>
          <div className="flex items-baseline gap-1.5">
            <p className="font-mono text-lg font-semibold">{total}€</p>
            {pricing.savings > 0 && (
              <p className="font-mono text-xs text-mute/40 line-through">{totalOriginal}€</p>
            )}
          </div>
        </div>
        <button
          onClick={handleAdd}
          className={`flex items-center justify-center gap-2 font-semibold px-7 py-3.5 rounded-full transition active:scale-95 ${
            justAdded ? "bg-herb text-cream" : "bg-chili hover:bg-chili-dark text-cream"
          }`}
        >
          {justAdded ? <><Check size={17} /> Ajouté !</> : "Ajouter au panier"}
        </button>
      </div>
    </div>
  );
}