import { useEffect, useState } from "react";
import { CheckCircle, X } from "lucide-react";

export default function OrderReadyBanner({ orderNumber, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (orderNumber) {
      setVisible(true);
      // Play a chime sound if supported
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const playTone = (freq, start, duration) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = freq;
          osc.type = "sine";
          gain.gain.setValueAtTime(0, ctx.currentTime + start);
          gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + start + 0.05);
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + start + duration);
          osc.start(ctx.currentTime + start);
          osc.stop(ctx.currentTime + start + duration + 0.1);
        };
        playTone(523, 0, 0.3);    // C5
        playTone(659, 0.35, 0.3); // E5
        playTone(784, 0.7, 0.5);  // G5
      } catch {
        // Audio context not available — silent is fine
      }
    }
  }, [orderNumber]);

  if (!orderNumber || !visible) return null;

  const handleClose = () => {
    setVisible(false);
    // Clear from localStorage
    localStorage.removeItem("camion_pending_order");
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-char/95 backdrop-blur-sm">
      {/* Close */}
      <button
        onClick={handleClose}
        className="absolute top-5 right-5 w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center hover:bg-cream/20 transition"
      >
        <X size={20} className="text-cream" />
      </button>

      <div className="flex flex-col items-center text-center px-8 max-w-sm">
        {/* Animated checkmark */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-herb/20 border-2 border-herb flex items-center justify-center animate-pulse">
            <CheckCircle size={52} className="text-herb fill-herb/30" />
          </div>
        </div>

        <p className="text-mute/70 text-sm uppercase tracking-widest mb-2">
          Commande prête !
        </p>

        {/* Big order number */}
        <div className="relative mb-4">
          <p className="font-display text-[6rem] font-black text-marigold leading-none tracking-tight">
            {orderNumber}
          </p>
          <div className="absolute inset-0 blur-3xl bg-marigold/20 -z-10 scale-150" />
        </div>

        <p className="font-display text-2xl font-bold text-cream mb-3">
          Votre commande est prête !
        </p>

        <p className="text-mute/70 text-sm leading-relaxed mb-8">
          Présentez-vous au comptoir avec votre numéro{" "}
          <span className="text-marigold font-bold">{orderNumber}</span> pour récupérer votre commande.
        </p>

        <button
          onClick={handleClose}
          className="bg-marigold hover:bg-marigold-light text-char font-bold px-8 py-4 rounded-full text-lg transition active:scale-95"
        >
          J'arrive ! 🚶
        </button>
      </div>
    </div>
  );
}