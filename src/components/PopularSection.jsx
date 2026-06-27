import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus, Star } from "lucide-react";
import { popularCombos, calcComboPrice } from "../data/combos";

export default function PopularSection({ onAdd, menuItems }) {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "next" ? 300 : -300, behavior: "smooth" });
    setTimeout(updateScrollState, 350);
  };

  // Don't render until menu data is loaded (avoids flash of €0.00)
  if (!menuItems || menuItems.length === 0) return null;

  return (
    <section className="max-w-3xl mx-auto px-8 pb-14 mt-8">
      <div className="flex items-start justify-between mb-5">
        <div className="-ml-3.5">
          <p className="text-marigold text-xs font-semibold uppercase tracking-[0.18em] mb-1">
            Notre sélection
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-cream tracking-tight">
            NOS PLATS POPULAIRES
          </h2>
        </div>
        <div className="hidden md:flex items-center gap-2 mt-1 shrink-0">
          <button
            onClick={() => scroll("prev")}
            disabled={!canScrollLeft}
            className="w-9 h-9 rounded-full border border-cream/15 flex items-center justify-center text-mute hover:bg-cream/10 hover:text-cream disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            onClick={() => scroll("next")}
            disabled={!canScrollRight}
            className="w-9 h-9 rounded-full border border-cream/15 flex items-center justify-center text-mute hover:bg-cream/10 hover:text-cream disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-none snap-x snap-mandatory"
      >
        {popularCombos.map((combo) => {
          const pricing = calcComboPrice(combo, menuItems);
          return (
            <ComboCard
              key={combo.id}
              combo={combo}
              pricing={pricing}
              onAdd={onAdd}
              navigate={navigate}
            />
          );
        })}
      </div>
    </section>
  );
}

function ComboCard({ combo, pricing, onAdd, navigate }) {
  const [pressed, setPressed] = useState(false);

  const handleAdd = (e) => {
    e.stopPropagation();
    setPressed(true);
    onAdd({ id: combo.id, name: combo.name, price: pricing.discounted, desc: combo.name, qty: 1 });
    setTimeout(() => setPressed(false), 700);
  };

  return (
    <div
      onClick={() => navigate(`/combo/${combo.linkTo}`)}
      className="group relative flex-none w-56 sm:w-64 bg-char-soft rounded-2xl overflow-hidden cursor-pointer shadow-lg shadow-black/30 hover:shadow-xl hover:shadow-black/50 hover:-translate-y-1 transition-all duration-300 snap-start"
    >
      {/* Savings badge */}
      {pricing.savings > 0 && (
        <div className="absolute top-3 left-3 z-10 bg-chili text-cream text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
          Économisez {pricing.savings.toFixed(2)}€
        </div>
      )}

      {/* Tag badge */}
      <div className="absolute top-3 right-3 z-10 bg-char/70 backdrop-blur-sm text-cream text-[10px] font-semibold px-2 py-0.5 rounded-full">
        {combo.tag}
      </div>

      {/* Image */}
      <div className="relative w-full h-36 sm:h-40 bg-gradient-to-br from-marigold/25 via-char to-chili/15 flex items-center justify-center overflow-hidden">
        <span className="text-6xl sm:text-7xl drop-shadow-lg group-hover:scale-110 transition-transform duration-500">
          {combo.emoji}
        </span>
        <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-char-soft to-transparent pointer-events-none" />
      </div>

      {/* Content */}
      <div className="px-3.5 pt-2 pb-4">
        <div className="flex items-center gap-1 mb-1.5">
          <Star size={11} className="fill-marigold text-marigold" />
          <span className="text-xs font-medium text-cream">{combo.rating}</span>
          <span className="text-[10px] text-mute/50">({combo.reviews})</span>
        </div>

        <h3 className="font-display font-semibold text-cream text-base leading-tight mb-1">
          {combo.name}
        </h3>

        {/* Includes chips */}
        <div className="flex flex-wrap gap-1 mb-3">
          {combo.itemRefs.map(({ id, qty }) => (
            <span key={id} className="text-[10px] bg-char text-mute/70 px-1.5 py-0.5 rounded-md">
              {qty > 1 ? `${qty}× ` : ""}{id}
            </span>
          ))}
        </div>

        {/* Price row */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono font-bold text-marigold text-base">
              {pricing.discounted.toFixed(2)}€
            </span>
            {pricing.savings > 0 && (
              <span className="font-mono text-[10px] text-mute/40 line-through">
                {pricing.original.toFixed(2)}€
              </span>
            )}
          </div>
          <button
            onClick={handleAdd}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition active:scale-90 ${
              pressed ? "bg-herb text-cream scale-90" : "bg-chili hover:bg-chili-dark text-cream"
            }`}
          >
            <Plus size={17} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}