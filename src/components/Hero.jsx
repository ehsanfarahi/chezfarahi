import { Clock, MapPin, Sparkles } from "lucide-react";

// Translation
import { useTranslation } from "react-i18next"; 

export default function Hero() {
  const { t } = useTranslation();
  return (
    <section className="relative max-w-3xl mx-auto px-4 pt-10 pb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-herb opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-herb" />
        </span>
        <span className="text-sm font-medium text-mute">
          {t("hero.status")}
        </span>
      </div>

      <h1 className="font-display text-4xl sm:text-5xl font-bold leading-[1.05] text-cream">
        {t("hero.title_line1")} <span className="text-marigold">qualité,</span> tout simplement.
      </h1>
      <p className="mt-4 text-mute/90 text-base sm:text-lg max-w-lg">
        Samosas faits maison, sandwichs grillés à la minute, hot-dogs et frites
        fraîches. Commandez maintenant, récupérez sur place.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-char-soft border border-cream/10 rounded-full px-4 py-2 text-sm text-mute">
          <MapPin size={15} className="text-marigold" />
          Halle aux Houblons, Haguenau
        </div>
        <div className="flex items-center gap-2 bg-char-soft border border-cream/10 rounded-full px-4 py-2 text-sm text-mute">
          <Clock size={15} className="text-marigold" />
          07h00 – 12h00
        </div>
      </div>

      <a
        href="#menu"
        className="mt-7 inline-flex items-center gap-2 bg-chili hover:bg-chili-dark text-cream font-semibold px-6 py-3 rounded-full transition active:scale-95"
      >
        <Sparkles size={16} />
        Voir le menu du jour
      </a>
    </section>
  );
}
