import { useState } from "react";
import { categories, menuItems } from "../data/menu";
import TicketCard from "./TicketCard";

export default function Menu({ onAdd }) {
  const [active, setActive] = useState("Tous");
  const filtered =
    active === "Tous" ? menuItems : menuItems.filter((i) => i.category === active);

  return (
    <section id="menu" className="max-w-3xl mx-auto px-4 pb-16">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl font-semibold text-cream">Le Menu</h2>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-none">
        {["Tous", ...categories].map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition ${
              active === cat
                ? "bg-marigold text-char border-marigold"
                : "bg-transparent text-mute border-cream/15 hover:border-cream/30"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-2">
        {filtered.map((item) => (
          <TicketCard key={item.id} item={item} onAdd={onAdd} />
        ))}
      </div>
    </section>
  );
}
