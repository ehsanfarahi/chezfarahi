import { Sparkles } from "lucide-react";

export default function AiButton({ onClick }) {
  return (
    // <button
    //   onClick={onClick}
    //   className="fixed bottom-6 right-6 z-30 flex items-center gap-2 bg-marigold text-char font-semibold pl-4 pr-5 py-3 rounded-full shadow-lg shadow-black/40 hover:bg-marigold-light active:scale-95 transition"
    // >
    //   <Sparkles size={17} />
    //   Demander à l'IA
    // </button>


    <button className="group fixed bottom-6 right-6 z-30 flex items-center gap-2 bg-marigold text-char font-semibold rounded-full shadow-lg shadow-black/40 hover:bg-marigold-light active:scale-95 transition-all duration-300 h-14 w-14 hover:w-48 px-0 hover:px-5 overflow-hidden">
  <Sparkles size={20} className="shrink-0 ml-[14px] group-hover:ml-0" />
  <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
    Demander à l'IA
  </span>
</button>

// {/* <button className="fixed bottom-6 right-6 z-30 flex items-center gap-2 bg-chili text-cream font-semibold pl-4 pr-5 py-3 rounded-full shadow-lg shadow-chili/40 hover:bg-chili-dark active:scale-95 transition">
//   <span className="relative flex h-2 w-2">
//     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cream opacity-75" />
//     <span className="relative inline-flex rounded-full h-2 w-2 bg-cream" />
//   </span>
//   <Sparkles size={16} />
//   IA
// </button> */}

// {/* <button className="fixed bottom-6 right-6 z-30 flex items-center bg-cream text-char rounded-lg shadow-lg shadow-black/40 active:scale-95 transition overflow-hidden">
//   <span className="px-4 py-3 font-display font-semibold text-sm">Demander à l'IA</span>
//   <span className="ticket-notch relative w-0">
//     <span className="absolute inset-y-2 border-l-2 border-dashed border-char/20" />
//   </span>
//   <span className="px-3.5 py-3 bg-marigold flex items-center justify-center">
//     <Sparkles size={18} className="text-char" />
//   </span>
// </button> */}

// {/* <button className="fixed bottom-6 right-6 z-30 flex items-center gap-2 bg-marigold text-char font-semibold pl-4 pr-5 py-3 rounded-2xl rounded-br-sm shadow-lg shadow-black/40 hover:bg-marigold-light active:scale-95 transition">
//   <Sparkles size={17} />
//   Demander à l'IA
// </button> */}
  );
}
