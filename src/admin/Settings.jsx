import { useState, useEffect } from "react";
import { Plus, Trash2, Save, Clock, MapPin, Star, FileText, Calendar } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function Settings({ token }) {
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/admin`, { headers: { "x-admin-token": token } })
      .then((r) => r.json())
      .then((d) => {
        const locations = (d.locations || []).map((l, i) => ({
          id:      l.id      || `loc-${i + 1}`,
          name:    l.name    || "",
          days:    l.days    || "",
          mapsUrl: l.mapsUrl || "",
        }));
        const hours = (d.hours || []).map((h) => ({
          ...h,
          locationId: h.locationId || "",
        }));
        setData({
          ...d,
          locations,
          hours,
          scheduleWeeks: d.scheduleWeeks || 2,
        });
      })
      .catch(() => setSaveMsg("Erreur de chargement."));
  }, []);

  const updateField = (path, value) => {
    setData((prev) => {
      const next = structuredClone(prev);
      let obj = next;
      for (let i = 0; i < path.length - 1; i++) obj = obj[path[i]];
      obj[path[path.length - 1]] = value;
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch(`${API_URL}/api/admin`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setSaveMsg("Paramètres enregistrés ✓");
      setTimeout(() => setSaveMsg(""), 2500);
    } catch {
      setSaveMsg("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  const addLocation = () => {
    const newLoc = { id: `loc-${Date.now()}`, name: "", days: "", mapsUrl: "" };
    updateField(["locations"], [...(data.locations || []), newLoc]);
  };

  const removeLocation = (idx) => {
    const removedId = data.locations[idx]?.id;
    const updated = data.locations.filter((_, i) => i !== idx);
    const updatedHours = data.hours.map((h) =>
      h.locationId === removedId ? { ...h, locationId: "" } : h
    );
    setData((prev) => ({ ...prev, locations: updated, hours: updatedHours }));
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-mute/50">
        <span className="text-4xl animate-pulse">⚙️</span>
      </div>
    );
  }

  return (
    <div className="text-cream max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-marigold text-xs font-semibold uppercase tracking-widest mb-1">
            Admin
          </p>
          <h1 className="font-display text-3xl font-bold">Paramètres</h1>
        </div>
        <div className="flex items-center gap-3">
          {saveMsg && (
            <span className={`text-xs font-medium ${
              saveMsg.includes("Erreur") ? "text-chili" : "text-herb"
            }`}>
              {saveMsg}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-chili hover:bg-chili-dark text-cream font-semibold px-5 py-2.5 rounded-full transition disabled:opacity-50"
          >
            <Save size={15} />
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>

      {/* Business name */}
      <Section icon={<FileText size={16} />} title="Nom du commerce">
        <input
          value={data.businessName || ""}
          onChange={(e) => updateField(["businessName"], e.target.value)}
          className="admin-input w-full"
        />
      </Section>

      {/* Locations */}
      <Section
        icon={<MapPin size={16} />}
        title="Emplacements"
        onAdd={addLocation}
      >
        <div className="space-y-4">
          {(data.locations || []).length === 0 && (
            <p className="text-xs text-mute/40 italic">
              Aucun emplacement. Cliquez sur "+ Ajouter".
            </p>
          )}
          {(data.locations || []).map((loc, idx) => (
            <div key={loc.id || idx} className="bg-char rounded-xl p-3 space-y-2">
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0 space-y-2">
                  <div>
                    <p className="text-[10px] text-mute/50 mb-1 uppercase tracking-wider">
                      Nom affiché
                    </p>
                    <input
                      value={loc.name}
                      onChange={(e) =>
                        updateField(["locations", idx, "name"], e.target.value)
                      }
                      placeholder="Ex: Place du Marché, Haguenau"
                      className="admin-input w-full"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] text-mute/50 mb-1 uppercase tracking-wider">
                      Lien Google Maps (optionnel)
                    </p>
                    <input
                      value={loc.mapsUrl || ""}
                      onChange={(e) =>
                        updateField(["locations", idx, "mapsUrl"], e.target.value)
                      }
                      placeholder="https://maps.google.com/?q=..."
                      className="admin-input w-full text-xs"
                    />
                  </div>
                  {!loc.mapsUrl && loc.name && (
                    <p className="text-[10px] text-mute/35">
                      Lien auto-généré depuis le nom ci-dessus
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeLocation(idx)}
                  className="text-mute/40 hover:text-chili mt-1 shrink-0"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Hours with location per day */}
      <Section icon={<Clock size={16} />} title="Horaires d'ouverture">
        <div className="space-y-2">
          {(data.hours || []).map((h, idx) => (
            <div
              key={idx}
              className={`rounded-xl p-3 ${h.closed ? "bg-char/40" : "bg-char"}`}
            >
              {/* Day + closed toggle */}
              <div className="flex items-center gap-3 mb-2">
                <span className={`w-24 shrink-0 text-sm font-medium ${
                  h.closed ? "text-mute/40" : "text-cream"
                }`}>
                  {h.day}
                </span>
                <label className="flex items-center gap-1.5 text-xs text-mute cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!h.closed}
                    onChange={(e) =>
                      updateField(["hours", idx, "closed"], e.target.checked)
                    }
                    className="accent-chili"
                  />
                  Fermé
                </label>
              </div>

              {!h.closed && (
                <div className="space-y-2">
                  {/* Time inputs */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <p className="text-[10px] text-mute/50 mb-1">Ouverture</p>
                      <input
                        type="time"
                        value={h.open || ""}
                        onChange={(e) =>
                          updateField(["hours", idx, "open"], e.target.value)
                        }
                        className="admin-input w-full"
                      />
                    </div>
                    <div className="pt-5 text-mute/30 text-sm">→</div>
                    <div className="flex-1">
                      <p className="text-[10px] text-mute/50 mb-1">Fermeture</p>
                      <input
                        type="time"
                        value={h.close || ""}
                        onChange={(e) =>
                          updateField(["hours", idx, "close"], e.target.value)
                        }
                        className="admin-input w-full"
                      />
                    </div>
                  </div>

                  {/* Location selector */}
                  <div>
                    <p className="text-[10px] text-mute/50 mb-1">
                      Emplacement ce jour-là
                    </p>
                    {(data.locations || []).length === 0 ? (
                      <p className="text-[11px] text-mute/35 italic">
                        Ajoutez d'abord un emplacement ci-dessus.
                      </p>
                    ) : (
                      <select
                        value={h.locationId || ""}
                        onChange={(e) =>
                          updateField(["hours", idx, "locationId"], e.target.value)
                        }
                        className="admin-input w-full text-sm"
                      >
                        <option value="">— Aucun emplacement —</option>
                        {(data.locations || []).map((loc) => (
                          <option key={loc.id} value={loc.id}>
                            {loc.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Schedule weeks */}
      <Section
        icon={<Calendar size={16} />}
        title="Planning affiché aux clients"
      >
        <p className="text-sm text-mute/70 mb-4">
          Nombre de semaines visibles dans le popup de planning quand un client
          clique sur l'horaire dans le héro.
        </p>
        <div className="flex items-center gap-3">
          {[1, 2, 3, 4].map((w) => (
            <button
              key={w}
              onClick={() => updateField(["scheduleWeeks"], w)}
              className={`w-14 h-14 rounded-2xl font-display font-bold text-xl transition ${
                data.scheduleWeeks === w
                  ? "bg-marigold text-char shadow-lg shadow-marigold/20"
                  : "bg-char text-mute/60 hover:bg-char-soft hover:text-cream border border-cream/10"
              }`}
            >
              {w}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-mute/40 mt-2">
          {data.scheduleWeeks} semaine{data.scheduleWeeks > 1 ? "s" : ""} ·{" "}
          {data.scheduleWeeks * 7} jours affichés
        </p>
      </Section>

      {/* AI recommendations */}
      <Section
        icon={<Star size={16} />}
        title="Recommandations IA"
        onAdd={() =>
          updateField(["recommendations"], [...(data.recommendations || []), ""])
        }
      >
        <div className="space-y-2">
          {(data.recommendations || []).length === 0 && (
            <p className="text-xs text-mute/40 italic">
              Aucune recommandation. Cliquez sur "+ Ajouter".
            </p>
          )}
          {(data.recommendations || []).map((rec, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                value={rec}
                onChange={(e) =>
                  updateField(["recommendations", idx], e.target.value)
                }
                placeholder="Conseil de la maison..."
                className="admin-input flex-1"
              />
              <button
                onClick={() =>
                  updateField(
                    ["recommendations"],
                    data.recommendations.filter((_, i) => i !== idx)
                  )
                }
                className="text-mute/40 hover:text-chili shrink-0"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </Section>

      {/* Extra AI notes */}
      <Section icon={<FileText size={16} />} title="Notes pour l'assistant IA">
        <textarea
          value={data.extraNotes || ""}
          onChange={(e) => updateField(["extraNotes"], e.target.value)}
          rows={4}
          placeholder="Informations supplémentaires que l'IA doit connaître..."
          className="admin-input w-full resize-none"
        />
      </Section>

      {/* Save at bottom */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 bg-chili hover:bg-chili-dark text-cream font-semibold py-4 rounded-2xl transition disabled:opacity-50 mb-8"
      >
        {saving ? <span className="animate-spin">⏳</span> : <Save size={18} />}
        {saving ? "Enregistrement..." : "Enregistrer tous les paramètres"}
      </button>
    </div>
  );
}

function Section({ icon, title, children, onAdd }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold text-marigold">
          {icon} {title}
        </h2>
        {onAdd && (
          <button
            onClick={onAdd}
            className="flex items-center gap-1 text-xs text-mute hover:text-cream transition"
          >
            <Plus size={13} /> Ajouter
          </button>
        )}
      </div>
      <div className="bg-char-soft rounded-2xl p-4 border border-cream/5">
        {children}
      </div>
    </div>
  );
}

















// import { useState, useEffect } from "react";
// import { Plus, Trash2, Save, Clock, MapPin, Star, FileText, Calendar } from "lucide-react";

// const API_URL = import.meta.env.VITE_API_URL || "";

// // French days in order matching the hours array
// const DAYS_ORDER = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

// export default function Settings({ token }) {
//   const [data, setData] = useState(null);
//   const [saving, setSaving] = useState(false);
//   const [saveMsg, setSaveMsg] = useState("");

//   // useEffect(() => {
//   //   fetch(`${API_URL}/api/admin`, { headers: { "x-admin-token": token } })
//   //     .then((r) => r.json())
//   //     .then(setData)
//   //     .catch(() => setSaveMsg("Erreur de chargement."));
//   // }, []);

//   useEffect(() => {
//     fetch(`${API_URL}/api/admin`, { headers: { "x-admin-token": token } })
//       .then((r) => r.json())
//       .then((d) => {
//         // Ensure locations have IDs and hours have locationId
//         const locations = (d.locations || []).map((l, i) => ({
//           id: l.id || `loc-${i + 1}`, 
//           name: l.name || "",
//           days: l.days || "",
//           mapsUrl: l.mapsUrl || "",
//         }));
//         const hours = (d.hours || []).map((h) => ({
//           ...h,
//           locationId: h.locationId || "",
//         }));
//         setData({ ...d, locations, hours, scheduleWeeks: d.scheduleWeeks || 2 });
//       })
//       .catch(() => setSaveMsg("Erreur de chargement."));
//   }, []);

//   const updateField = (path, value) => {
//     setData((prev) => {
//       const next = structuredClone(prev);
//       let obj = next;
//       for (let i = 0; i < path.length - 1; i++) obj = obj[path[i]];
//       obj[path[path.length - 1]] = value;
//       return next;
//     });
//   };

//   const handleSave = async () => {
//     setSaving(true);
//     setSaveMsg("");
//     try {
//       const res = await fetch(`${API_URL}/api/admin`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json", "x-admin-token": token },
//         body: JSON.stringify(data),
//       });
//       if (!res.ok) throw new Error();
//       setSaveMsg("Paramètres enregistrés ✓");
//       setTimeout(() => setSaveMsg(""), 2500);
//     } catch {
//       setSaveMsg("Erreur lors de la sauvegarde.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const addLocation = () => {
//     const newLoc = { id: `loc-${Date.now()}`, name: "", days: "", mapsUrl: ""};
//     updateField(["locations"], [...(data.locations || []), newLoc])
//   }

//   const removeLocation = (idx) => {
//     const updated = data.locations.filter((_, i) => i !== idx)
//     // Clear locationId refs pointing to removed location
//     const removedId = data.locations[idx]?.id;
//     const updatedHours = data.hours.map((h) => h.locationId === removedId ? {...h, locationId: ""} : h)
//     setData((prev) => ({ ...prev, locations: updated, hours: updatedHours}))
//   }

//   if (!data) {
//     return (
//       <div className="flex items-center justify-center h-64 text-mute/50">
//         <span className="text-4xl animate-pulse">⚙️</span>
//       </div>
//     );
//   }

//   return (
//     <div className="text-cream max-w-2xl mx-auto">
//       <div className="flex items-center justify-between mb-8">
//         <div>
//           <p className="text-marigold text-xs font-semibold uppercase tracking-widest mb-1">Admin</p>
//           <h1 className="font-display text-3xl font-bold">Paramètres</h1>
//         </div>
//         <div className="flex items-center gap-3">
//           {saveMsg && (
//             <span className={`text-xs font-medium ${saveMsg.includes("Erreur") ? "text-chili" : "text-herb"}`}>
//               {saveMsg}
//             </span>
//           )}
//           <button onClick={handleSave} disabled={saving}
//             className="flex items-center gap-2 bg-chili hover:bg-chili-dark text-cream font-semibold px-5 py-2.5 rounded-full transition disabled:opacity-50"
//           >
//             <Save size={15} />
//             {saving ? "Enregistrement..." : "Enregistrer"}
//           </button>
//         </div>
//       </div>

//       <Section icon={<FileText size={16} />} title="Nom du commerce">
//         <input value={data.businessName} onChange={(e) => updateField(["businessName"], e.target.value)} className="admin-input w-full" />
//       </Section>

//       {/* Locations - with maps URL */}
//       <Section icon={<MapPin size={16} />} title="Emplacements" onAdd={addLocation}>
//       <div className="space-y-4">
//         {(data.locations || []).length === 0 && (
//           <p className="text-xs text-mute/40 italic">Aucun emplacement. Cliquez sur "+ Ajouter".</p>
//         )}
//         {(data.locations || []).map((loc, idx) => (
//           <div key={loc.id || idx} className="bg-char rounded-xl p-3 space-y-2">
//             <div className="flex items-center gap-2">
//               <div className="flex-1 min-w-0 space-y-2">
                
//                 <p className="text-[10px] text-mute/50 mb-1 uppercase tracking-wider">Nom affiché (adresse courte)</p>
//                 <input value={loc.name} onChange={(e) => updateField(["locations", idx, "name"], e.target.value)} placeholder="Ex: Place du Marché, Haguenau" className="admin-input w-full" />
//               </div>
//               <button onClick={() => removeLocation(idx)} className="text-mute/40 hover:text-chili shrink-0 mt-4">
//                 <Trash2 size={15} />
//               </button>
//             </div>
//             <div>
//               <p className="text-[10px] text-mute/50 mb-1 uppercase tracking-wider">
//               Lien Google Maps (optionnel - sinon généré automatiquement)
//               </p>
//               <input value={loc.mapsUrl || ""} onChange={(e) => updateField(["locations", idx, "mapsUrl"], e.target.value)} placeholder="https://maps.google.com/?q=..." className="admin-input w-full text-xs" />
//             </div>
//             {!loc.mapsUrl && loc.name && (
//               <p className="text-[10px] text-mute/40">
//                 Lien auto-généré :{" "}
//                 <span className="text-marigold/60">
//                 maps,google.com/?q={encodeURIComponent(loc.name).slice(0, 40)}...
//                 </span>
//               </p>
//             )}
//           </div>
//         ))}
//         {(data.locations || []).length === 0 && (
//           <p className="text-xs text-mute/40 italic">
//             Aucun emplacement. Cliquez sur "+ Ajouter".
//           </p>
//         )}
//       </div>
//       </Section>

//       <Section icon={<Clock size={16} />} title="Horaires d'ouverture">
//         <div className="space-y-1">
//           {(data.hours || []).map((h, idx) => (
//             <div key={idx} className={`rounded-xl p-3 ${h.closed ? "bg-char/40" : "bg-char"}`}>
//             <div className="flex items-center gap-3 mb-2">
//               <span className={`w-24 text-sm shrink-0 font-medium ${h.closed ? "text-mute/40" : "text=cream"}`}>{h.day}</span>
//               <label className="flex items-center gap-1.5 text-xs text-mute cursor-pointer">
//                 <input type="checkbox" checked={h.closed} onChange={(e) => updateField(["hours", idx, "closed"], e.target.checked)} className="accent-chili" />
//                 Fermé
//               </label>
//             </div>
//             {!h.closed && (
//                 <div className="grid grid-cols-1 gap-2 ml-0">
//                   {/* Time range */}
//                   <div className="flex items-center gap-2">
//                     <div className="flex-1">
//                       <p className="text-[10px] text-mute/50 mb-1">Ouverture</p>
//                       <input type="time" value={h.open || ""} onChange={(e) => updateField(["hours", idx, "open"], e.target.value)} className="admin-input w-full" />
//                     </div>
//                     <div className="pt-4 text-mute/30 text-sm">→</div>
//                     <div className="flex-1">
//                       <p className="text-[10px] text-mute/50 mb-1">Fermeture</p>
//                   <input type="time" value={h.close || ""} onChange={(e) => updateField(["hours", idx, "close"], e.target.value)} className="admin-input w-full" />
//                     </div>
//                   </div>

//                   {/* Location selector */}
//                   <div>
//                     <p className="text-[10px] text-mute/50 mb-1">Emplacement ce jour-là</p>
//                     <select value={h.locationId || ""} onChange={(e) => updateField(["hours", idx, "locationId"], e.target.value)} className="admin-input w-full text-sm">
//                       <option value="">- Aucun emplacement -</option>
//                       {(data.locations || []).map((loc) => (
//                         <option key={loc.id} value={loc.id}>{loc.name}</option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       </Section>

//       {/* Schedule weeks */}
//       <Section icon={<Calendar size={16} />} title="Planning affiché aux clients">
//       <div>
//         <p className="text-sm text-mute/70 mb-3">
//         Nombre de semaines à afficher dans le popup de planning (visible aux clients quand ils cliquent sur l'horaire dans le héro).
//         </p>
//         <div className="flex items-center gap-3">
//           {[1, 2, 3, 4].map((w) => (
//             <button key={w} onClick={() => updateField(["scheduleWeeks"], w)} className={`w-14 h-14 rounded-2xl font-display font-bold text-xl transition ${data.scheduleWeeks === w ? "bg-marigold text-char shadow-lg shadow-marigold/20" : "bg-char text-mute/60 hover:bg-char-soft hover:text-cream border border-cream/10"}`}>{w}</button>
//           ))}
//         </div>
//         <p className="text-[11px] text-mute/40 mt-2">
//         {data.scheduleWeeks} semaine{data.scheduleWeeks > 1 ? "s" : ""} .{" "}
//         {data.scheduleWeeks * 7} jours affichés
//         </p>
//       </div>
//       </Section>

//       {/* AI recommendations */}
//       <Section icon={<Star size={16} />} title="Recommandations IA" onAdd={() => updateField(["recommendations"], [...(data.recommendations || []), ""])}>
//       <div className="space-y-2">
//         {(data.recommendations || []).map((rec, idx) => (
//           <div key={idx} className="flex items-center gap-2">
//             <input value={rec} onChange={(e) => updateField(["recommendations", idx], e.target.value)} placeholder="Conseil de la maison..." className="admin-input flex-1" />
//             <button onClick={() => updateField(["recommendations"], data.recommendations.filter((_, i) => i !== idx))} className="text-mute/40 hover:text-chili shrink-0">
//               <Trash2 size={15} />
//             </button>
//           </div>
//         ))}
//         {(data.recommendations || []).length === 0 && (
//           <p className="text-xs text-mute/40 italic">Aucune recommandation. Cliquez sur "+ Ajouter".</p>
//         )}
//       </div>
//       </Section>

//       {/* Extra notes for AI */}
//       <Section icon={<FileText size={16} />} title="Notes pour l'assistant IA">
//       <textarea value={data.extraNotes || ""} onChange={(e) => updateField(["extraNotes"], e.target.value)} rows={4} placeholder="Informations supplémentaires que l'IA doit connaître..." className="admin-input w-full resize-none" />
//       </Section>

//       {/* Save button at bottom */}
//       <button onClick={handleSave} disabled={saving} className="w-full flex items-center justify-center gap-2 bg-chili hover:bg-chili-dark text-cream font-semibold py-4 rounded-2xl transition disabled:opacity-50 mb-8">
//         {saving ? <span className="animate-spin"></span> : <Save size={18} />}
//         {saving ? "Enregistrement..." : "Enregistrer tous les paramètres"}
//       </button>

//       {/* <Section icon={<MapPin size={16} />} title="Emplacements"
//         onAdd={() => updateField(["locations"], [...data.locations, { name: "", days: "" }])}
//       >
//         <div className="space-y-2">
//           {data.locations.map((loc, idx) => (
//             <div key={idx} className="flex items-center gap-2">
//               <input value={loc.name} onChange={(e) => updateField(["locations", idx, "name"], e.target.value)} placeholder="Adresse" className="admin-input flex-1" />
//               <input value={loc.days} onChange={(e) => updateField(["locations", idx, "days"], e.target.value)} placeholder="Jours" className="admin-input w-32" />
//               <button onClick={() => updateField(["locations"], data.locations.filter((_, i) => i !== idx))} className="text-mute/40 hover:text-chili shrink-0">
//                 <Trash2 size={15} />
//               </button>
//             </div>
//           ))}
//         </div>
//       </Section> */}

//       {/* <Section icon={<Star size={16} />} title="Recommandations IA"
//         onAdd={() => updateField(["recommendations"], [...data.recommendations, ""])}
//       >
//         <div className="space-y-2">
//           {data.recommendations.map((rec, idx) => (
//             <div key={idx} className="flex items-center gap-2">
//               <input value={rec} onChange={(e) => updateField(["recommendations", idx], e.target.value)} placeholder="Conseil de la maison..." className="admin-input flex-1" />
//               <button onClick={() => updateField(["recommendations"], data.recommendations.filter((_, i) => i !== idx))} className="text-mute/40 hover:text-chili shrink-0">
//                 <Trash2 size={15} />
//               </button>
//             </div>
//           ))}
//         </div>
//       </Section> */}

//       {/* <Section icon={<FileText size={16} />} title="Notes pour l'assistant IA">
//         <textarea value={data.extraNotes || ""} onChange={(e) => updateField(["extraNotes"], e.target.value)}
//           rows={4} placeholder="Informations supplémentaires que l'IA doit connaître..."
//           className="admin-input w-full resize-none"
//         />
//       </Section> */}
//     </div>
//   );
// }

// function Section({ icon, title, children, onAdd }) {
//   return (
//     <div className="mb-8">
//       <div className="flex items-center justify-between mb-3">
//         <h2 className="flex items-center gap-2 font-display text-base font-semibold text-marigold">{icon} {title}</h2>
//         {onAdd && (
//           <button onClick={onAdd} className="flex items-center gap-1 text-xs text-mute hover:text-cream transition">
//             <Plus size={13} /> Ajouter
//           </button>
//         )}
//       </div>
//       <div className="bg-char-soft rounded-2xl p-4 border border-cream/5">{children}</div>
//     </div>
//   );
// }
