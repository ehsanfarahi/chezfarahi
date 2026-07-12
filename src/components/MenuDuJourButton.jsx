import { useState } from "react";
import { ChefHat } from "lucide-react";
import { useMenuDuJour } from "../hooks/useMenuDuJour";
import MenuDuJourModal from "./MenuDuJourModal";

export default function MenuDuJourButton({ onAdd }) {
  const { menuDuJour, loading } = useMenuDuJour();
  const [open, setOpen] = useState(false);

  // Only render when there is an active menu today
  if (loading || !menuDuJour) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full transition-all duration-300 active:scale-95"
        style={{
          background: "linear-gradient(135deg, #F2A93B 0%, #C8432A 100%)",
          padding: "0.75rem 1.5rem",
          boxShadow: "0 4px 24px rgba(242,169,59,0.35)",
        }}
      >
        {/* Shimmer sweep on hover */}
        <span
          className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
          }}
        />

        <ChefHat size={18} className="text-char shrink-0" />

        <span className="font-display font-bold text-char text-base leading-none">
          Plat du Jour
        </span>

        {/* Price badge */}
        <span
          className="font-mono font-black text-sm text-char rounded-full px-2 py-0.5"
          style={{ background: "rgba(27,20,17,0.15)" }}
        >
          {Number(menuDuJour.menuPrice).toFixed(2)}€
        </span>

        {/* Pulsing dot */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span
            className="absolute inline-flex h-full w-full rounded-full animate-ping opacity-75"
            style={{ background: "#1B1411" }}
          />
          <span
            className="relative inline-flex h-2 w-2 rounded-full"
            style={{ background: "#1B1411" }}
          />
        </span>
      </button>

      <MenuDuJourModal
        menu={menuDuJour}
        open={open}
        onClose={() => setOpen(false)}
        onAdd={(item) => {
          onAdd?.(item);
          setOpen(false);
        }}
      />
    </>
  );
}  