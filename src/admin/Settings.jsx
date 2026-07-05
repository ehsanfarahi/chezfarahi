import { useState, useEffect } from "react";
import { Plus, Trash2, Save, Clock, MapPin, Star, FileText } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function Settings({ token }) {
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/admin`, { headers: { "x-admin-token": token } })
      .then((r) => r.json())
      .then(setData)
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
        headers: { "Content-Type": "application/json", "x-admin-token": token },
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

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-mute/50">
        <span className="text-4xl animate-pulse">⚙️</span>
      </div>
    );
  }

  return (
    <div className="text-cream max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-marigold text-xs font-semibold uppercase tracking-widest mb-1">Admin</p>
          <h1 className="font-display text-3xl font-bold">Paramètres</h1>
        </div>
        <div className="flex items-center gap-3">
          {saveMsg && (
            <span className={`text-xs font-medium ${saveMsg.includes("Erreur") ? "text-chili" : "text-herb"}`}>
              {saveMsg}
            </span>
          )}
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-chili hover:bg-chili-dark text-cream font-semibold px-5 py-2.5 rounded-full transition disabled:opacity-50"
          >
            <Save size={15} />
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>

      <Section icon={<FileText size={16} />} title="Nom du commerce">
        <input value={data.businessName} onChange={(e) => updateField(["businessName"], e.target.value)} className="admin-input w-full" />
      </Section>

      <Section icon={<Clock size={16} />} title="Horaires d'ouverture">
        <div className="space-y-2">
          {data.hours.map((h, idx) => (
            <div key={idx} className="flex items-center gap-3 py-1">
              <span className="w-24 text-sm text-mute shrink-0">{h.day}</span>
              <label className="flex items-center gap-1.5 text-xs text-mute cursor-pointer">
                <input type="checkbox" checked={h.closed} onChange={(e) => updateField(["hours", idx, "closed"], e.target.checked)} className="accent-chili" />
                Fermé
              </label>
              {!h.closed && (
                <>
                  <input type="time" value={h.open} onChange={(e) => updateField(["hours", idx, "open"], e.target.value)} className="admin-input w-28" />
                  <span className="text-mute/40 text-sm">→</span>
                  <input type="time" value={h.close} onChange={(e) => updateField(["hours", idx, "close"], e.target.value)} className="admin-input w-28" />
                </>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section icon={<MapPin size={16} />} title="Emplacements"
        onAdd={() => updateField(["locations"], [...data.locations, { name: "", days: "" }])}
      >
        <div className="space-y-2">
          {data.locations.map((loc, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input value={loc.name} onChange={(e) => updateField(["locations", idx, "name"], e.target.value)} placeholder="Adresse" className="admin-input flex-1" />
              <input value={loc.days} onChange={(e) => updateField(["locations", idx, "days"], e.target.value)} placeholder="Jours" className="admin-input w-32" />
              <button onClick={() => updateField(["locations"], data.locations.filter((_, i) => i !== idx))} className="text-mute/40 hover:text-chili shrink-0">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={<Star size={16} />} title="Recommandations IA"
        onAdd={() => updateField(["recommendations"], [...data.recommendations, ""])}
      >
        <div className="space-y-2">
          {data.recommendations.map((rec, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input value={rec} onChange={(e) => updateField(["recommendations", idx], e.target.value)} placeholder="Conseil de la maison..." className="admin-input flex-1" />
              <button onClick={() => updateField(["recommendations"], data.recommendations.filter((_, i) => i !== idx))} className="text-mute/40 hover:text-chili shrink-0">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={<FileText size={16} />} title="Notes pour l'assistant IA">
        <textarea value={data.extraNotes || ""} onChange={(e) => updateField(["extraNotes"], e.target.value)}
          rows={4} placeholder="Informations supplémentaires que l'IA doit connaître..."
          className="admin-input w-full resize-none"
        />
      </Section>
    </div>
  );
}

function Section({ icon, title, children, onAdd }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold text-marigold">{icon} {title}</h2>
        {onAdd && (
          <button onClick={onAdd} className="flex items-center gap-1 text-xs text-mute hover:text-cream transition">
            <Plus size={13} /> Ajouter
          </button>
        )}
      </div>
      <div className="bg-char-soft rounded-2xl p-4 border border-cream/5">{children}</div>
    </div>
  );
}
