import { Plus, Leaf } from "lucide-react";

// Logo img
import Logo from "../assets/logo.png";

// Components
import { Image } from "./index";

export default function TicketCard({ item, onAdd }) {
  return (
     <div className="relative flex bg-transparent text-char 
     shadow-lg shadow-black/30">
      {/* Left: info */}
      <div className="p-4 pr-5 bg-cream basis-4/6 rounded-tl-4xl rounded-bl-4xl">
        <div className="flex items-center gap-2 mb-1">
          {item.tag && (
            <span className="text-[10px] uppercase tracking-wider font-semibold bg-marigold/90 text-char px-2 py-0.5 rounded-full">
              {item.tag}
            </span>
          )}
          {item.veg && (
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-herb">
              <Leaf size={11} strokeWidth={2.5} /> Végé
            </span>
          )}
        </div>
        <h3 className="font-display text-lg font-semibold leading-tight">{item.name}</h3>
        <p className="text-sm text-char/70 mt-1 leading-snug">{item.desc}</p>
      </div>


      {/* Right: price + add */}
      <div className="relative flex basis-2/6 justify-center px-3 bg-cream rounded-tr-4xl rounded-br-4xl">
        <div className="flex items-center gap-2 absolute top-4 right-3">
          <span className="font-mono font-semibold text-base">{item.price.toFixed(2)}€</span>
        <button
          onClick={() => onAdd(item)}
          aria-label={`Ajouter ${item.name} au panier`}
          className="w-9 h-9 rounded-full bg-chili text-cream flex items-center justify-center hover:bg-chili-dark active:scale-95 transition"
        >
          <Plus size={18} strokeWidth={2.5} />
        </button>
        </div>
      </div>
       <Image src={item.img} alt="hot-dog" width="200" imgStyle="absolute -bottom-12 -right-8" />
    </div>
  );
}

















// import { Plus, Leaf } from "lucide-react";

// export default function TicketCard({ item, onAdd }) {
//   return (
//     <div className="relative flex bg-cream text-char rounded-lg shadow-lg shadow-black/30 overflow-hidden">
//       {/* Left: info */}
//       <div className="flex-1 p-4 pr-5">
//         <div className="flex items-center gap-2 mb-1">
//           {item.tag && (
//             <span className="text-[10px] uppercase tracking-wider font-semibold bg-marigold/90 text-char px-2 py-0.5 rounded-full">
//               {item.tag}
//             </span>
//           )}
//           {item.veg && (
//             <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-herb">
//               <Leaf size={11} strokeWidth={2.5} /> Végé
//             </span>
//           )}
//         </div>
//         <h3 className="font-display text-lg font-semibold leading-tight">{item.name}</h3>
//         <p className="text-sm text-char/70 mt-1 leading-snug">{item.desc}</p>
//       </div>

//       {/* Perforated divider */}
//       <div className="relative w-0">
//         <div className="ticket-notch absolute inset-y-0" />
//         <div className="absolute inset-y-2 border-l-2 border-dashed border-char/20" />
//       </div>

//       {/* Right: price + add */}
//       <div className="relative w-24 flex flex-col items-center justify-center gap-2 px-3 bg-char/[0.03]">
//         <span className="font-mono font-semibold text-base">{item.price.toFixed(2)}€</span>
//         <button
//           onClick={() => onAdd(item)}
//           aria-label={`Ajouter ${item.name} au panier`}
//           className="w-9 h-9 rounded-full bg-chili text-cream flex items-center justify-center hover:bg-chili-dark active:scale-95 transition"
//         >
//           <Plus size={18} strokeWidth={2.5} />
//         </button>
//       </div>
//     </div>
//   );
// }
