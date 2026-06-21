import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Share2, Minus, Plus, Flame, Leaf, Star, Check, ChevronDown } from "lucide-react";
import { getProductById } from "../data/menu";

export default function ProductDetail({ onAdd }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = getProductById(id);

  const [qty, setQty] = useState(1);
  const [favorited, setFavorited] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 180);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Swipe-right-to-go-back gesture (mobile)
  useEffect(() => {
    let startX = null;
    const onTouchStart = (e) => (startX = e.touches[0].clientX);
    const onTouchEnd = (e) => {
      if (startX === null) return;
      const deltaX = e.changedTouches[0].clientX - startX;
      if (startX < 40 && deltaX > 80) navigate(-1);
      startX = null;
    };
    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [navigate]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-char text-cream gap-4">
        <p className="text-mute">Produit introuvable.</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-marigold text-char font-semibold px-5 py-2.5 rounded-full"
        >
          Retour
        </button>
      </div>
    );
  }

  const total = (product.price * qty).toFixed(2);

  const handleAdd = () => {
    onAdd?.({ ...product, qty });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  return (
    <div className="min-h-screen bg-char text-cream pb-28">
      {/* Scroll-collapsing mini header, appears once hero is scrolled past */}
      <div
        className={`fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 py-3 transition-all duration-300 ${
          scrolled ? "bg-char/90 backdrop-blur border-b border-cream/10 opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-char-soft flex items-center justify-center"
          aria-label="Retour"
        >
          <ArrowLeft size={16} />
        </button>
        <span className="font-display font-semibold text-sm truncate max-w-[60%]">{product.name}</span>
        <span className="font-mono text-sm text-marigold">{product.price.toFixed(2)}€</span>
      </div>

      {/* Hero image: full width, ~36% viewport height, pinned to top */}
      <div ref={heroRef} className="relative w-full h-[36vh] sm:h-[40vh] overflow-hidden">
        {product.img ? (
          <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-marigold/30 via-char-soft to-chili/20 flex items-center justify-center">
            <span className="text-[5.5rem] sm:text-[7rem] drop-shadow-lg">{product.emoji}</span>
          </div> 
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-char via-transparent to-black/20 pointer-events-none" />

        {/* Top-left: go back */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-char/60 backdrop-blur-md flex items-center justify-center hover:bg-char/80 active:scale-95 transition"
          aria-label="Retour"
        >
          <ArrowLeft size={18} className="text-cream" />
        </button>

        {/* Top-right: favorite + share */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={() => setFavorited((f) => !f)}
            className="w-10 h-10 rounded-full bg-char/60 backdrop-blur-md flex items-center justify-center hover:bg-char/80 active:scale-95 transition"
            aria-label="Ajouter aux favoris"
          >
            <Heart
              size={18}
              className={favorited ? "fill-chili text-chili" : "text-cream"}
            />
          </button>
          <button
            className="w-10 h-10 rounded-full bg-char/60 backdrop-blur-md flex items-center justify-center hover:bg-char/80 active:scale-95 transition"
            aria-label="Partager"
          >
            <Share2 size={16} className="text-cream" />
          </button>
        </div>

        {/* Tags overlay, bottom-left of image */}
        <div className="absolute bottom-5 left-4 flex gap-2">
          {product.tag && (
            <span className="text-[10px] uppercase tracking-wider font-semibold bg-marigold text-char px-2.5 py-1 rounded-full">
              {product.tag}
            </span>
          )}
          {product.veg && (
            <span className="text-[10px] uppercase tracking-wider font-semibold bg-herb text-cream px-2.5 py-1 rounded-full flex items-center gap-1">
              <Leaf size={10} /> Végé
            </span>
          )}
        </div>
      </div>

      {/* Info card overlapping the image bottom edge */}
      <div className="relative -mt-6 bg-char-soft rounded-t-3xl">
        {/* Floating quantity stepper, straddling the seam between image and card */}
        <div className="absolute -top-6 right-4 flex items-center gap-3 bg-char border border-cream/10 rounded-full px-3 py-2 shadow-xl shadow-black/40">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-7 h-7 rounded-full bg-char-soft flex items-center justify-center hover:bg-cream/10 active:scale-90 transition"
            aria-label="Diminuer la quantité"
          >
            <Minus size={14} />
          </button>
          <span className="font-mono font-semibold text-sm w-4 text-center">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="w-7 h-7 rounded-full bg-marigold text-char flex items-center justify-center hover:bg-marigold-light active:scale-90 transition"
            aria-label="Augmenter la quantité"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="px-5 pt-7 pb-2">
          {/* Name (left) + price (right) */}
          <div className="flex items-start justify-between gap-4 pr-20">
            <div>
              <h1 className="font-display text-2xl font-bold leading-tight">{product.name}</h1>
              <div className="flex items-center gap-1.5 mt-1.5">
                <Star size={13} className="fill-marigold text-marigold" />
                <span className="text-sm font-medium">{product.rating}</span>
                <span className="text-xs text-mute/60">({product.reviews} avis)</span>
                {product.spicy > 0 && (
                  <span className="flex items-center ml-2">
                    {Array.from({ length: product.spicy }).map((_, i) => (
                      <Flame key={i} size={12} className="fill-chili text-chili -ml-0.5 first:ml-0" />
                    ))}
                  </span>
                )}
              </div>
            </div>
            <span className="font-mono text-xl font-semibold text-marigold shrink-0">
              {product.price.toFixed(2)}€
            </span>
          </div>

          {/* Description, expandable */}
          <div className="mt-4">
            <p className={`text-sm text-mute/90 leading-relaxed ${!showFullDesc && "line-clamp-2"}`}>
              {product.longDesc}
            </p>
            <button
              onClick={() => setShowFullDesc((s) => !s)}
              className="flex items-center gap-1 text-xs text-marigold mt-1.5 font-medium"
            >
              {showFullDesc ? "Voir moins" : "Lire plus"}
              <ChevronDown size={13} className={`transition-transform ${showFullDesc ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {/* Nutrition facts */}
        <div className="px-5 pt-4 pb-2">
          <h2 className="font-display text-base font-semibold mb-3">Informations nutritionnelles</h2>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(product.nutrition).map(([key, val]) => (
              <div key={key} className="bg-char rounded-xl px-2 py-3 text-center">
                <p className="font-mono font-semibold text-sm">{val}</p>
                <p className="text-[10px] uppercase tracking-wide text-mute/60 mt-0.5">
                  {{ calories: "Calories", protein: "Protéines", carbs: "Glucides", fat: "Lipides" }[key]}
                </p>
              </div>
            ))}
          </div>
          {product.allergens.length > 0 && (
            <p className="text-xs text-mute/60 mt-3">
              Allergènes : <span className="text-mute">{product.allergens.join(", ")}</span>
            </p>
          )}
        </div>

        {/* Promotion banner */}
        {product.promo && (
          <div className="mx-5 mt-4 mb-2 rounded-2xl bg-gradient-to-r from-chili to-chili-dark p-4 flex items-center gap-3 shadow-lg shadow-chili/20">
            <div className="w-9 h-9 rounded-full bg-cream/15 flex items-center justify-center shrink-0">
              <span className="text-lg">🔥</span>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-cream/80">Offre spéciale</p>
              <p className="text-sm font-semibold text-cream leading-snug">{product.promo}</p>
            </div>
          </div>
        )}

        <div className="h-4" />
      </div>

      {/* Sticky bottom checkout bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-char-soft border-t border-cream/10 px-5 py-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-mute/60">Total</p>
          <p className="font-mono text-lg font-semibold">{total}€</p>
        </div>
        <button
          onClick={handleAdd}
          className={`flex items-center justify-center gap-2 font-semibold px-7 py-3.5 rounded-full transition active:scale-95 ${
            justAdded ? "bg-herb text-cream" : "bg-chili hover:bg-chili-dark text-cream"
          }`}
        >
          {justAdded ? (
            <>
              <Check size={17} /> Ajouté !
            </>
          ) : (
            "Ajouter au panier"
          )}
        </button>
      </div>
    </div>
  );
}
