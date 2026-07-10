import { useState } from "react";
import { X, Check, Minus, Plus, Leaf, Star, Clock } from "lucide-react";

export default function MenuDuJourModal({ menu, open, onClose, onAdd }) {
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  if (!open || !menu) return null;

  const savings = (menu.totalOriginal - menu.menuPrice).toFixed(2);
  const savingsPct = Math.round((1 - menu.menuPrice / menu.totalOriginal) * 100);
  const total = (menu.menuPrice * qty).toFixed(2);

  const allItems = [
    ...(menu.items || []),
    ...(menu.extraItems || []).map((e) => ({ name: e.name, originalPrice: e.price })),
    ...(menu.beverage?.included ? [{ name: menu.beverage.name || "Boisson au choix", originalPrice: menu.beverage.price }] : []),
  ];

  const handleAdd = () => {
    onAdd({
      id: `mdj-${menu.date || Date.now()}`,
      name: `${menu.title || "Menu du Jour"} · ${menu.subtitle || ""}`.trim().replace(/·\s*$/, ""),
      price: menu.menuPrice,
      qty,
      desc: allItems.map((i) => i.name).join(", "),
      isMenuDuJour: true,
    });
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      onClose();
    }, 1200);
  };

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal — bottom sheet mobile, centered desktop */}
      <div className="fixed bottom-0 left-0 right-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-50">
        <div
          className="relative w-full sm:w-[420px] sm:max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-black/60"
          style={{ background: "#1e1512" }}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-cream/10 flex items-center justify-center hover:bg-cream/20 transition"
          >
            <X size={16} className="text-cream" />
          </button>

          {/* Header — chalkboard style */}
          <div
            className="relative px-6 pt-8 pb-6 text-center overflow-hidden"
            style={{
              background: "linear-gradient(160deg, #2a1f18 0%, #1e1512 100%)",
              borderBottom: "1px solid rgba(242,169,59,0.15)",
            }}
          >
            {/* Decorative corner dots */}
            {[
              "top-4 left-4", "top-4 right-12", "top-4 left-12",
            ].map((pos) => (
              <span key={pos} className={`absolute ${pos} w-1 h-1 rounded-full bg-marigold/30`} />
            ))}

            {/* Savings stamp */}
            {savingsPct > 0 && (
              <div
                className="absolute top-5 left-5 w-14 h-14 rounded-full flex flex-col items-center justify-center border-2 border-chili/60"
                style={{ background: "rgba(200,67,42,0.12)" }}
              >
                <span className="font-display font-black text-chili text-base leading-none">
                  -{savingsPct}%
                </span>
                <span className="text-[8px] text-chili/70 uppercase tracking-wide font-bold">
                  remise
                </span>
              </div>
            )}

            {/* Chef emoji + eyebrow */}
            <div className="text-4xl mb-2">
              {menu.image ? (
                <img
                  src={menu.image}
                  alt={menu.title}
                  className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-marigold/30"
                />
              ) : (
                <span>{menu.emoji || "👨‍🍳"}</span>
              )}
            </div>

            <p
              className="text-[10px] font-bold uppercase tracking-[0.22em] mb-1"
              style={{ color: "rgba(242,169,59,0.6)" }}
            >
              {today}
            </p>

            {/* Title */}
            <h2
              className="font-display font-black leading-none mb-1"
              style={{
                fontSize: "2.4rem",
                color: "#FAF6F0",
                letterSpacing: "-0.02em",
              }}
            >
              {menu.title || "Menu du Jour"}
            </h2>

            {menu.subtitle && (
              <p className="text-sm font-medium" style={{ color: "rgba(242,169,59,0.75)" }}>
                {menu.subtitle}
              </p>
            )}

            {menu.validUntil && (
              <div
                className="inline-flex items-center gap-1 mt-2 text-[11px] px-2.5 py-1 rounded-full"
                style={{
                  background: "rgba(232,223,211,0.06)",
                  color: "rgba(232,223,211,0.45)",
                }}
              >
                <Clock size={10} />
                Valable jusqu'à {menu.validUntil}
              </div>
            )}

            {/* Decorative divider — double line with diamond */}
            <div className="flex items-center gap-2 mt-5">
              <div className="flex-1 h-px" style={{ background: "rgba(242,169,59,0.2)" }} />
              <span style={{ color: "rgba(242,169,59,0.4)", fontSize: "0.5rem" }}>◆</span>
              <div className="flex-1 h-px" style={{ background: "rgba(242,169,59,0.2)" }} />
            </div>
          </div>

          {/* Description */}
          {menu.description && (
            <p
              className="text-center text-xs italic px-6 pt-4"
              style={{ color: "rgba(232,223,211,0.5)" }}
            >
              "{menu.description}"
            </p>
          )}

          {/* Items list — menu card style */}
          <div className="px-6 py-4 space-y-1">
            {allItems.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2.5"
                style={{ borderBottom: "1px dashed rgba(232,223,211,0.08)" }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: "rgba(242,169,59,0.5)" }}
                  />
                  <span className="text-sm" style={{ color: "#FAF6F0" }}>
                    {item.name}
                  </span>
                  {item.veg && (
                    <Leaf size={11} className="text-herb shrink-0" />
                  )}
                </div>
                {item.originalPrice > 0 && (
                  <span
                    className="font-mono text-xs line-through"
                    style={{ color: "rgba(232,223,211,0.3)" }}
                  >
                    {item.originalPrice.toFixed(2)}€
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Decorative divider */}
          <div className="flex items-center gap-2 px-6">
            <div className="flex-1 h-px" style={{ background: "rgba(242,169,59,0.15)" }} />
            <span style={{ color: "rgba(242,169,59,0.3)", fontSize: "0.5rem" }}>◆</span>
            <div className="flex-1 h-px" style={{ background: "rgba(242,169,59,0.15)" }} />
          </div>

          {/* Pricing section */}
          <div className="px-6 py-4 text-center">
            {menu.totalOriginal > menu.menuPrice && (
              <p
                className="font-mono text-sm line-through mb-1"
                style={{ color: "rgba(232,223,211,0.35)" }}
              >
                Valeur totale : {menu.totalOriginal.toFixed(2)}€
              </p>
            )}

            <div className="flex items-center justify-center gap-3 mb-1">
              <span
                className="font-display font-black"
                style={{ fontSize: "3rem", color: "#F2A93B", lineHeight: 1 }}
              >
                {menu.menuPrice.toFixed(2)}€
              </span>
            </div>

            {savings > 0 && (
              <div
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{
                  background: "rgba(92,122,94,0.15)",
                  border: "1px solid rgba(92,122,94,0.35)",
                  color: "#5C7A5E",
                }}
              >
                <Star size={11} className="fill-herb" />
                Vous économisez {savings}€ avec ce menu
              </div>
            )}
          </div>

          {/* Qty + Add to cart */}
          <div
            className="px-6 pb-6 pt-2"
            style={{ borderTop: "1px solid rgba(232,223,211,0.08)" }}
          >
            <div className="flex items-center gap-3 mb-3">
              {/* Qty stepper */}
              <div
                className="flex items-center gap-3 px-3 py-2 rounded-full"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-cream/10 transition active:scale-90 text-cream"
                >
                  <Minus size={14} />
                </button>
                <span className="font-mono font-semibold text-sm text-cream w-4 text-center">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="w-7 h-7 rounded-full flex items-center justify-center bg-marigold text-char hover:bg-marigold-light transition active:scale-90"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Add button */}
              <button
                onClick={handleAdd}
                className={`flex-1 flex items-center justify-center gap-2 font-semibold py-3.5 rounded-full transition active:scale-95 ${
                  justAdded
                    ? "bg-herb text-cream"
                    : "bg-chili hover:bg-chili-dark text-cream"
                }`}
              >
                {justAdded ? (
                  <><Check size={16} /> Ajouté !</>
                ) : (
                  <>Ajouter — {total}€</>
                )}
              </button>
            </div>

            <p className="text-center text-[10px]" style={{ color: "rgba(232,223,211,0.3)" }}>
              Menu disponible aujourd'hui seulement · Non modifiable
            </p>
          </div>
        </div>
      </div>
    </>
  );
}