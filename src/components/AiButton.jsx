import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

// Translation
import { useTranslation } from "react-i18next"; 

export default function AiButton({ onClick }) {
  const [introDone, setIntroDone] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIntroDone(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);
  return (
    // <button
    //   onClick={onClick}
    //   className="fixed bottom-6 right-6 z-30 flex items-center gap-2 bg-marigold text-char font-semibold pl-4 pr-5 py-3 rounded-full shadow-lg shadow-black/40 hover:bg-marigold-light active:scale-95 transition"
    // >
    //   <Sparkles size={17} />
    //   Demander à l'IA
    // </button>


//     <button className="group fixed bottom-6 right-6 z-30 flex items-center gap-2 bg-marigold text-char font-semibold rounded-full shadow-lg shadow-black/40 hover:bg-marigold-light active:scale-95 transition-all duration-300 h-14 w-14 hover:w-48 px-0 hover:px-5 overflow-hidden">
//   <Sparkles size={20} className="shrink-0 ml-[14px] group-hover:ml-0" />
//   <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
//     Demander à l'IA
//   </span>
// </button>

// {/* <button
//       onClick={onClick}
//       className={`group fixed bottom-6 right-6 z-30 flex items-center gap-2 bg-marigold text-char font-semibold rounded-full shadow-lg shadow-black/40 hover:bg-marigold-light active:scale-95 transition-all duration-300 h-14 overflow-hidden ${
//         introDone ? "w-14 px-0 hover:w-48 hover:px-5" : "w-48 px-5"
//       }`}
//     >
//       <Sparkles
//         size={20}
//         className={`shrink-0 transition-all duration-300 ${
//           introDone ? "ml-[14px] group-hover:ml-0" : "ml-0"
//         }`}
//       />
//       <span
//         className={`whitespace-nowrap transition-opacity duration-200 ${
//           introDone ? "opacity-0 group-hover:opacity-100" : "opacity-100"
//         }`}
//       >
//         Demander à l'IA
//       </span>
//     </button> */}

<button
      onClick={onClick}
      className={`group fixed bottom-6 right-6 z-30 flex items-center gap-2 bg-marigold text-char font-semibold rounded-full shadow-lg shadow-black/40 hover:bg-marigold-light active:scale-95 transition-all duration-300 h-14 overflow-hidden ${
        introDone ? "w-14 px-0 hover:w-auto hover:px-5 animate-gentle-pulse" : "w-48 px-5"
      }`}
    >
      {/* shimmer sweep, only during intro */}
      {!introDone && (
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer pointer-events-none" />
      )}

      <Sparkles
        size={20}
        className={`relative shrink-0 transition-all duration-300 ${
          introDone ? "ml-[14px] group-hover:ml-0" : "ml-0"
        } ${!introDone ? "animate-pulse" : ""}`}
      />
      <span
        className={`relative whitespace-nowrap transition-opacity duration-200 ${
          introDone ? "opacity-0 group-hover:opacity-100" : "opacity-100"
        }`}
      >
        {t("ai.button")}
      </span>
    </button>

// <button className="fixed bottom-6 right-6 z-30 flex items-center gap-2 bg-chili text-cream font-semibold pl-4 pr-5 py-3 rounded-full shadow-lg shadow-chili/40 hover:bg-chili-dark active:scale-95 transition">
//   <span className="relative flex h-2 w-2">
//     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cream opacity-75" />
//     <span className="relative inline-flex rounded-full h-2 w-2 bg-cream" />
//   </span>
//   <Sparkles size={16} />
//   IA
// </button>


// {/* <button className="fixed bottom-6 right-6 z-30 flex items-center gap-2 bg-marigold text-char font-semibold pl-4 pr-5 py-3 rounded-2xl rounded-br-sm shadow-lg shadow-black/40 hover:bg-marigold-light active:scale-95 transition">
//   <Sparkles size={17} />
//   Demander à l'IA
// </button>  */}
  );
}
