import { ShoppingBag, MapPin } from "lucide-react";

// Import logo
import logo from "../assets/logo.png" 

// Import components
import { Image, Languages } from "./index";

export default function Navbar({ cartCount, onCartClick, language, dispatch }) {
  return (
    <header className="sticky top-0 z-30 bg-char/90 backdrop-blur border-b border-cream/10">
      <div className="max-w-3xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Image src={logo} alt="logo" imgStyle="pt-1 w-18 h-18 -ml-2" />
          <div className="flex flex-col leading-tight">
            <span className=" text-2xl font-bold text-marigold font-bebas"><span className="text-cream font-poppins">Chez</span>Farahi</span>
            <span className="text-[11.85px] text-mute/80 font-montserrat">
              <span>Good Food,</span>
              <span> Good Mood</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* <span className="hidden sm:flex items-center gap-1 text-xs text-mute/80">
            <MapPin size={14} /> Haguenau, Place du Marché
          </span> */}
          <Languages language={language} dispatch={dispatch} />
          <button
            onClick={onCartClick}
            className="relative w-10 h-10 rounded-full bg-char-soft flex items-center justify-center hover:bg-marigold/20 transition"
            aria-label="Voir le panier"
          >
            <ShoppingBag size={18} className="text-cream" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-chili text-cream text-[10px] font-mono font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
