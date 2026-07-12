import { Clock, MapPin, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

import MenuDuJourButton from "./MenuDuJourButton";

// Translation
import { useTranslation } from "react-i18next"; 

export default function Hero({ onAdd }) {
  const { t } = useTranslation();

  const navigate = useNavigate();

  return (
    <section className="relative max-w-5xl mx-auto px-4 pt-10 pb-8">
      <div className="absolute right-0 top-0 bottom-0 w-xl bg-[url('/images/all-foods.png')] bg-no-repeat bg-contain opacity-75 max-sm:hidden"></div>

      <div className="max-w-[60%] max-sm:max-w-full">
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
          {t("hero.title_line1")}{" "}
          <span className="text-marigold">{t("hero.title_highlight")}</span>{" "}
          {t("hero.title_line2")}
        </h1>
        <p className="mt-4 text-mute/90 text-base sm:text-lg max-w-lg">
          {t("hero.subtitle")}
        </p>

        <div className="mt-32 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-char-soft border border-cream/10 rounded-full px-4 py-2 text-sm text-mute">
            <MapPin size={15} className="text-marigold" />
            Halle aux Houblons, Haguenau
          </div>
          <div className="flex items-center gap-2 bg-char-soft border border-cream/10 rounded-full px-4 py-2 text-sm text-mute">
            <Clock size={15} className="text-marigold" />
            07h00 – 12h00
          </div>
        </div>

        {/* <p onClick={() => navigate(`../Admin`)} className="mt-6">
          Open Admin for Test
        </p> */}

        <div className="flex flex-wrap items-center gap-3 mt-7">
          <a
          href="#menu"
          className="mt-7 inline-flex items-center gap-2 bg-chili hover:bg-chili-dark text-cream font-semibold px-6 py-3 rounded-full transition active:scale-95"
        >
          <Sparkles size={16} />
          {t("hero.cta")}
        </a>
        <div className="absolute bottom-8 right-3"><MenuDuJourButton onAdd={onAdd} /></div>
        </div>
      </div>
    </section>
  );
}
