import { Sparkles } from "lucide-react";

export default function AiButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-30 flex items-center gap-2 bg-marigold text-char font-semibold pl-4 pr-5 py-3 rounded-full shadow-lg shadow-black/40 hover:bg-marigold-light active:scale-95 transition"
    >
      <Sparkles size={17} />
      Demander à l'IA
    </button>
  );
}
