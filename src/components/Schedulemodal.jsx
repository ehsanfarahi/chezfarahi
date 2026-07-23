import { X, MapPin, Clock, ChevronRight } from "lucide-react";

export default function ScheduleModal({ open, onClose, schedule }) {
  if (!open || !schedule) return null;

  const { schedule: days = [], scheduleWeeks = 2 } = schedule;

  // Group days into weeks
  const weeks = [];
  for (let w = 0; w < scheduleWeeks; w++) {
    weeks.push(days.slice(w * 7, (w + 1) * 7));
  }

  const weekLabel = (i) => {
    if (i === 0) return "Cette semaine";
    if (i === 1) return "Semaine prochaine";
    return `Dans ${i + 1} semaines`;
  };

  const openMaps = (location) => {
    if (!location) return;
    const url =
      location.mapsUrl ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.name)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed bottom-0 left-0 right-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-50">
        <div
          className="relative w-full sm:w-[460px] sm:max-h-[85vh] bg-char-soft rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-cream/10 shrink-0">
            <div>
              <h2 className="font-display text-lg font-bold text-cream">
                Planning des prochaines semaines
              </h2>
              <p className="text-xs text-mute/50 mt-0.5">
                {scheduleWeeks} semaine{scheduleWeeks > 1 ? "s" : ""} à venir
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-cream/10 transition"
            >
              <X size={18} className="text-cream" />
            </button>
          </div>

          {/* Schedule */}
          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-6">
            {weeks.map((week, wi) => (
              <div key={wi}>
                {/* Week header */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-marigold/80">
                    {weekLabel(wi)}
                  </span>
                  <div className="flex-1 h-px bg-marigold/15" />
                </div>

                {/* Days */}
                <div className="space-y-2">
                  {week.map((day, di) => (
                    <div
                      key={di}
                      className={`rounded-xl overflow-hidden ${
                        day.isToday
                          ? "ring-1 ring-marigold/50 bg-marigold/5"
                          : "bg-char/60"
                      }`}
                    >
                      <div className="flex items-center gap-3 px-4 py-3">

                        {/* Day + date */}
                        <div className="w-24 shrink-0">
                          <p className={`text-sm font-semibold capitalize ${
                            day.isToday ? "text-marigold" : "text-cream"
                          }`}>
                            {day.dayLabel}
                            {day.isToday && (
                              <span className="ml-1.5 text-[9px] bg-marigold text-char px-1.5 py-0.5 rounded-full font-bold uppercase align-middle">
                                Auj.
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-mute/50 mt-0.5">
                            {day.dateLabel}
                          </p>
                        </div>

                        {/* Hours + location or Fermé */}
                        {day.closed ? (
                          <div className="flex-1">
                            <span className="text-xs text-mute/35 italic">Fermé</span>
                          </div>
                        ) : (
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Clock size={11} className="text-marigold/60 shrink-0" />
                              <span className="text-xs font-mono text-cream/80">
                                {day.open} – {day.close}
                              </span>
                            </div>
                            {day.location && (
                              <button
                                onClick={() => openMaps(day.location)}
                                className="flex items-center gap-1.5 group/loc w-full text-left"
                              >
                                <MapPin size={11} className="text-chili/60 shrink-0" />
                                <span className="text-[11px] text-mute/60 group-hover/loc:text-marigold truncate transition">
                                  {day.location.name}
                                </span>
                                <ChevronRight size={10} className="text-mute/25 group-hover/loc:text-marigold shrink-0 transition" />
                              </button>
                            )}
                          </div>
                        )}

                        {/* Status dot */}
                        <div className={`w-2 h-2 rounded-full shrink-0 ${
                          day.closed
                            ? "bg-cream/15"
                            : day.isToday
                            ? "bg-herb animate-pulse"
                            : "bg-herb/40"
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-cream/8 shrink-0">
            <p className="text-[10px] text-mute/35 text-center">
              Horaires susceptibles de changer · Suivez-nous sur @chezfarahi
            </p>
          </div>
        </div>
      </div>
    </>
  );
}











// import { X, MapPin, Clock, ChevronRight } from "lucide-react";

// export default function ScheduleModal({ open, onClose, schedule }) {
//   if (!open || !schedule) return null;

//   const { schedule: days = [], scheduleWeeks = 2 } = schedule;

//   // Group days by week
//   const weeks = [];
//   for (let w = 0; w < scheduleWeeks; w++) {
//     weeks.push(days.slice(w * 7, (w + 1) * 7));
//   }

//   const weekLabel = (weekIndex) => {
//     if (weekIndex === 0) return "Cette semaine";
//     if (weekIndex === 1) return "Semaine prochaine";
//     return `Dans ${weekIndex + 1} semaines`;
//   };

//   const openMapsUrl = (location) => {
//     if (!location) return;
//     const url = location.mapsUrl ||
//       `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.name)}`;
//     window.open(url, "_blank", "noopener,noreferrer");
//   };

//   return (
//     <>
//       {/* Backdrop */}
//       <div
//         className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
//         onClick={onClose}
//       />

//       {/* Modal */}
//       <div className="fixed bottom-0 left-0 right-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-50">
//         <div
//           className="relative w-full sm:w-[460px] sm:max-h-[85vh] bg-char-soft rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col"
//           onClick={(e) => e.stopPropagation()}
//         >
//           {/* Header */}
//           <div className="flex items-center justify-between px-5 py-4 border-b border-cream/10 shrink-0">
//             <div>
//               <h2 className="font-display text-lg font-bold text-cream">
//                 Planning des prochaines semaines
//               </h2>
//               <p className="text-xs text-mute/50 mt-0.5">
//                 {scheduleWeeks} semaine{scheduleWeeks > 1 ? "s" : ""} à venir
//               </p>
//             </div>
//             <button
//               onClick={onClose}
//               className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-cream/10 transition"
//             >
//               <X size={18} className="text-cream" />
//             </button>
//           </div>

//           {/* Schedule content */}
//           <div className="overflow-y-auto flex-1 px-5 py-4 space-y-6">
//             {weeks.map((week, wi) => (
//               <div key={wi}>
//                 {/* Week label */}
//                 <div className="flex items-center gap-2 mb-3">
//                   <span className="text-[10px] font-bold uppercase tracking-widest text-marigold/80">
//                     {weekLabel(wi)}
//                   </span>
//                   <div className="flex-1 h-px bg-marigold/15" />
//                 </div>

//                 {/* Days */}
//                 <div className="space-y-2">
//                   {week.map((day, di) => (
//                     <div
//                       key={di}
//                       className={`rounded-xl overflow-hidden transition ${
//                         day.isToday
//                           ? "ring-1 ring-marigold/50 bg-marigold/5"
//                           : "bg-char/60"
//                       }`}
//                     >
//                       <div className="flex items-center gap-3 px-4 py-3">
//                         {/* Day + date */}
//                         <div className="w-24 shrink-0">
//                           <p className={`text-sm font-semibold capitalize ${
//                             day.isToday ? "text-marigold" : "text-cream"
//                           }`}>
//                             {day.dayLabel}
//                             {day.isToday && (
//                               <span className="ml-1.5 text-[9px] bg-marigold text-char px-1.5 py-0.5 rounded-full font-bold uppercase">
//                                 Aujourd'hui
//                               </span>
//                             )}
//                           </p>
//                           <p className="text-[11px] text-mute/50 mt-0.5">{day.dateLabel}</p>
//                         </div>

//                         {day.closed ? (
//                           <div className="flex-1">
//                             <span className="text-xs text-mute/40 italic">Fermé</span>
//                           </div>
//                         ) : (
//                           <div className="flex-1 min-w-0">
//                             {/* Hours */}
//                             <div className="flex items-center gap-1.5 mb-1">
//                               <Clock size={11} className="text-marigold/70 shrink-0" />
//                               <span className="text-xs font-mono text-cream/80">
//                                 {day.open} – {day.close}
//                               </span>
//                             </div>

//                             {/* Location */}
//                             {day.location && (
//                               <button
//                                 onClick={() => openMapsUrl(day.location)}
//                                 className="flex items-center gap-1.5 group/loc text-left w-full"
//                               >
//                                 <MapPin size={11} className="text-chili/70 shrink-0" />
//                                 <span className="text-[11px] text-mute/70 group-hover/loc:text-marigold truncate transition">
//                                   {day.location.name}
//                                 </span>
//                                 <ChevronRight size={10} className="text-mute/30 group-hover/loc:text-marigold shrink-0 transition" />
//                               </button>
//                             )}
//                           </div>
//                         )}

//                         {/* Status dot */}
//                         <div className={`w-2 h-2 rounded-full shrink-0 ${
//                           day.closed ? "bg-cream/15" : day.isToday ? "bg-herb animate-pulse" : "bg-herb/40"
//                         }`} />
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Footer note */}
//           <div className="px-5 py-3 border-t border-cream/8 shrink-0">
//             <p className="text-[10px] text-mute/35 text-center">
//               Horaires susceptibles de changer · Suivez-nous sur @chezfarahi
//             </p>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }