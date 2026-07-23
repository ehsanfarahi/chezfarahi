import { useState } from "react";
import { Clock, MapPin, Sparkles, ChefHat } from "lucide-react";
import { useSchedule } from "../hooks/useSchedule";
import ScheduleModal from "./Schedulemodal";
import MenuDuJourButton from "./MenuDuJourButton";


import { useNavigate } from "react-router-dom";

// Translation
import { useTranslation } from "react-i18next"; 

export default function Hero({ onAdd }) {
  const {schedule, loading} = useSchedule();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const { t } = useTranslation();

  const navigate = useNavigate();

   const openMaps = (location) => {
    if (!location) return;
    const url =
      location.mapsUrl ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        location.name
      )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Derived display values
  const isOpen      = schedule?.status === "open";
  const todayLoc    = schedule?.todayLocation;
  const todayHours  = schedule?.todayHours;
  const nextOpening = schedule?.nextOpening;

  // Status pill text
 const statusText = loading
    ? "Chargement..."
    : isOpen
    ? `Ouvert maintenant · ferme à ${todayHours?.close || "—"}`
    : nextOpening
    ? `Fermé · ouvre ${nextOpening.day} à ${nextOpening.open}`
    : "Fermé";

  // Location to show
  const displayLocation = isOpen ? todayLoc : nextOpening?.location || null;
  const locationLabel   = isOpen
    ? todayLoc?.name || ""
    : nextOpening?.location?.name
    ? `${nextOpening.day} · ${nextOpening.location.name}`
    : "";

  // Time label (clickable -> opens schedule)
  const timeLabel = isOpen
    ? `${todayHours?.open || ""} – ${todayHours?.close || ""}`
    : nextOpening
    ? `${nextOpening.day} · ${nextOpening.open}`
    : "";

  return (
    <section className="relative max-w-5xl mx-auto px-4 pt-10 pb-8">
      <div className="absolute right-0 top-0 bottom-0 w-xl bg-[url('/images/all-foods.png')] bg-no-repeat bg-contain opacity-75 max-sm:hidden"></div>

      <div className="max-w-[60%] max-sm:max-w-full">
        <div className="flex items-center gap-2 mb-4">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOpen ? "bg-herb" : "bg-mute/40"}`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isOpen ? "bg-herb" : "bg-mute/40"}`} />
          </span>
          <span className={`text-sm font-medium ${isOpen ? "text-mute" : "text-mute/60"}`}>
            {/* {t("hero.status")} */}
            {t(statusText)}
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

        <div className="mt-32 flex gap-3">
          {locationLabel ? (
            <button onClick={() => openMaps(displayLocation)} className="flex items-center gap-2 bg-char-soft border border-cream/10 hover:border-marigold/30 rounded-full px-4 py-2 text-sm text-mute hover:text-cream transition group truncate">
            <MapPin size={15} className="text-marigold group-hover:scale-110 transition-transform" />
            {locationLabel}
          </button>
          ) : (
            <div className="flex items-center gap-2 bg-char-soft border border-cream/10 rounded-full px-4 py-2 text-sm text-mute/50">
            <MapPin size={15} className="text-mute/30" />
            Emplacement à venir
            </div>
          )}
          
          {timeLabel ? (
            <button onClick={() => setScheduleOpen(true)} className="flex items-center gap-2 bg-char-soft border border-cream/10 hover:border-marigold/30 rounded-full px-4 py-2 text-sm text-mute hover:text-cream transition group whitespace-nowrap">
            <Clock size={15} className="text-marigold group-hover:scale-110 transition-transform" />
            {timeLabel}
          </button>
          ) : (
            <button onClick={() => setScheduleOpen(true)} className="flex items-center gap-2 bg-char-soft border border-cream/10 hover:border-marigold/30 rounded-full px-4 py-2 text-sm text-mute/50 hover:text-cream transition whitespace-nowrap">
            <Clock size={15} className="text-mute/30" />
            Voir le planning
          </button>
          )}
        </div>

        <p onClick={() => navigate(`../Admin`)} className="mt-6">
          Open Admin for Test
        </p>

        <div className="mt-2 max-sm:grid max-sm:grid-rows-2"> 
          <a
            href="#menu"
            className="mt-7 inline-flex items-center gap-2 bg-chili hover:bg-chili-dark text-cream font-semibold px-6 py-3 rounded-full transition active:scale-95"
          >
           <span className="flex items-center gap-2 max-sm:mx-auto">
             <Sparkles size={16} />
            {t("hero.cta")}
           </span>
          </a>
          <div className="absolute bottom-8 right-3 max-sm:relative max-sm:-bottom-3 max-sm:right-0">
            <MenuDuJourButton onAdd={onAdd} />
          </div>
        </div>
      </div>
      {/* Schedule modal */}
      <ScheduleModal open={scheduleOpen} onClose={() => setScheduleOpen(false)} schedule={schedule} />
    </section>
  );
}
