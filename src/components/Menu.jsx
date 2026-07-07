import { useState } from "react";
// import { categories, menuItems } from "../data/menu";
import TicketCard from "./TicketCard";

import { useMenuData } from "../hooks/useMenuData"

export default function Menu({ onAdd }) {
  const { menuItems, loading } = useMenuData();
  const categories = [...new Set(menuItems.map((i) => i.category))];
  const [active, setActive] = useState("Tous");
  const filtered =
    active === "Tous" ? menuItems : menuItems.filter((i) => i.category === active);

      if (loading) return (
    <div className="flex justify-center py-12">
      <span className="text-4xl animate-bounce">🍟</span>
    </div>
  );

  return (
    <section id="menu" className="max-w-5xl mx-auto px-4 pb-16">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl font-semibold text-cream">Le Menu</h2>
      </div>


      {/* <div>
        <p className="flex flex-col font-semibold text-xsm mb-10"><span>Bonjour !</span><span>Qu'avez-vous envie</span><span>de manger aujourd'hui ?</span></p>
      </div> */}

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

      <div className="grid sm:grid-cols-2 gap-10 max-sm:gap-12">
        {filtered.map((item) => (
          <TicketCard img={item.img} key={item.id} item={item} onAdd={onAdd} />
        ))}
      </div>
    </section>
  );
}
