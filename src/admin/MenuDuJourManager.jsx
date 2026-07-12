import { useState, useEffect, useRef } from "react";
import {
  Plus, Save, X, Check,
  Eye, EyeOff, Image, Link, GlassWater,
  LayoutTemplate, BookOpen,
} from "lucide-react";
import { compressImage, uploadToCloudinary } from "../utils/imageUtils";

const API_URL = import.meta.env.VITE_API_URL || "";

const today = new Date().toISOString().slice(0, 10);

const EMPTY = {
  dateFrom: today,
  dateTo: today,
  title: "Menu du Jour",
  subtitle: "Suggestion du Chef",
  description: "",
  emoji: "👨‍🍳",
  image: "",
  items: [],
  extraItems: [],
  beverage: { name: "Boisson au choix", price: 2.0, included: true },
  totalOriginal: 0,
  menuPrice: 0,
  validUntil: "21:00",
  active: false,
  displayOptions: {
    showItemPrices: true,
    showPromoTags: true,
    showImage: true,
    uiStyle: "modern", // "modern" | "blackboard"
  },
};

function calcOriginal(items, extraItems, beverage) {
  const a = (items || []).reduce((s, i) => s + (i.originalPrice || 0), 0);
  const b = (extraItems || []).reduce((s, i) => s + (i.price || 0), 0);
  const c = beverage?.included ? (beverage.price || 0) : 0;
  return parseFloat((a + b + c).toFixed(2));
}

function Label({ children }) {
  return (
    <p className="text-[11px] text-mute/60 uppercase tracking-wider mb-1.5">
      {children}
    </p>
  );
}

function Section({ title, children, onAdd, addLabel = "+ Ajouter" }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-display text-sm font-semibold text-marigold uppercase tracking-wider">
          {title}
        </h2>
        {onAdd && (
          <button
            onClick={onAdd}
            className="text-xs text-mute hover:text-cream transition flex items-center gap-1"
          >
            <Plus size={12} /> {addLabel}
          </button>
        )}
      </div>
      <div className="bg-char-soft rounded-2xl p-4 border border-cream/5">
        {children}
      </div>
    </div>
  );
}

function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-cream/5 last:border-0">
      <div>
        <p className="text-sm text-cream font-medium">{label}</p>
        {description && (
          <p className="text-[11px] text-mute/50 mt-0.5">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors ${
          checked ? "bg-marigold" : "bg-cream/15"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

export default function MenuDuJourManager({ token }) {
  const [form, setForm] = useState(EMPTY);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [imageTab, setImageTab] = useState("url");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/business`).then((r) => r.json()),
      // fetch regardless of active status for admin
      fetch(`${API_URL}/api/menu-du-jour`, { headers: { "x-admin-token": token } }).then((r) => r.json()).catch(() => null),
    ])
      .then(([biz, mdj]) => {
        setMenuItems(biz.menu || []);
        if (mdj) {
          // Migrate old single-date field to dateFrom/dateTo
          setForm({
            ...EMPTY,
            ...mdj,
            dateFrom: mdj.dateFrom || mdj.date || today,
            dateTo:   mdj.dateTo   || mdj.date || today,
            displayOptions: { ...EMPTY.displayOptions, ...(mdj.displayOptions || {}) },
          });
        }
      })
      .catch(() => setSaveMsg("Erreur de chargement."))
      .finally(() => setLoading(false));
  }, []);

  // Auto-recalculate original total
  useEffect(() => {
    const orig = calcOriginal(form.items, form.extraItems, form.beverage);
    setForm((prev) => ({ ...prev, totalOriginal: orig }));
  }, [form.items, form.extraItems, form.beverage]);

  const set = (field) => (e) => {
    const val =
      e.target.type === "checkbox" ? e.target.checked
      : e.target.type === "number" ? parseFloat(e.target.value) || 0
      : e.target.value;
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const setOpt = (field, value) => {
    setForm((prev) => ({
      ...prev,
      displayOptions: { ...prev.displayOptions, [field]: value },
    }));
  };

  const setBeverage = (field) => (e) => {
    const val =
      e.target.type === "checkbox" ? e.target.checked
      : e.target.type === "number" ? parseFloat(e.target.value) || 0
      : e.target.value;
    setForm((prev) => ({ ...prev, beverage: { ...prev.beverage, [field]: val } }));
  };

  // ─── Menu items from existing products ───────────────────────────────────
  const addMenuItem = () => {
    const first = menuItems[0];
    if (!first) return;
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { menuItemId: first.id, name: first.name, originalPrice: first.price }],
    }));
  };

  const updateMenuItem = (idx, field, value) => {
    setForm((prev) => {
      const items = [...prev.items];
      if (field === "menuItemId") {
        const found = menuItems.find((m) => m.id === value);
        items[idx] = { menuItemId: value, name: found?.name || "", originalPrice: found?.price || 0 };
      } else {
        items[idx] = { ...items[idx], [field]: value };
      }
      return { ...prev, items };
    });
  };

  const removeMenuItem = (idx) =>
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));

  // ─── Extra items ──────────────────────────────────────────────────────────
  const addExtraItem = () =>
    setForm((prev) => ({ ...prev, extraItems: [...prev.extraItems, { name: "", price: 0 }] }));

  const updateExtraItem = (idx, field, value) => {
    setForm((prev) => {
      const extraItems = [...prev.extraItems];
      extraItems[idx] = { ...extraItems[idx], [field]: field === "price" ? parseFloat(value) || 0 : value };
      return { ...prev, extraItems };
    });
  };

  const removeExtraItem = (idx) =>
    setForm((prev) => ({ ...prev, extraItems: prev.extraItems.filter((_, i) => i !== idx) }));

  // ─── Image upload ─────────────────────────────────────────────────────────
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressed = await compressImage(file, 800, 0.82);
      const url = await uploadToCloudinary(compressed, token, "chezfarahi/menu-du-jour");
      setForm((prev) => ({ ...prev, image: url }));
    } catch (err) {
      setSaveMsg("Erreur upload: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  // ─── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch(`${API_URL}/api/menu-du-jour`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setSaveMsg("Menu du Jour enregistré ✓");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch {
      setSaveMsg("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-4xl animate-bounce">👨‍🍳</span>
      </div>
    );
  }

  const savings = (form.totalOriginal - form.menuPrice).toFixed(2);
  const savingsPct = form.totalOriginal > 0
    ? Math.round((1 - form.menuPrice / form.totalOriginal) * 100)
    : 0;
  const opts = form.displayOptions || {};

  return (
    <div className="text-cream max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-marigold text-xs font-semibold uppercase tracking-widest mb-1">Admin</p>
          <h1 className="font-display text-3xl font-bold">Menu du Jour</h1>
        </div>
        <div className="flex items-center gap-3">
          {saveMsg && (
            <span className={`text-xs font-medium ${saveMsg.includes("Erreur") ? "text-chili" : "text-herb"}`}>
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

      {/* Active toggle */}
      <div className="bg-char-soft rounded-2xl p-4 border border-cream/5 mb-5 flex items-center justify-between">
        <div>
          <p className="font-semibold text-cream text-sm">Menu actif</p>
          <p className="text-xs text-mute/50 mt-0.5">
            {form.active
              ? "Visible par les clients sur la page d'accueil"
              : "Masqué — les clients ne voient pas ce menu"}
          </p>
        </div>
        <button
          onClick={() => setForm((prev) => ({ ...prev, active: !prev.active }))}
          className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full border transition ${
            form.active
              ? "bg-herb/20 border-herb/40 text-herb"
              : "bg-cream/5 border-cream/15 text-mute"
          }`}
        >
          {form.active ? <><Eye size={13} /> Actif</> : <><EyeOff size={13} /> Inactif</>}
        </button>
      </div>

      {/* Basic info */}
      <Section title="Informations générales">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label>Titre</Label>
            <input value={form.title} onChange={set("title")} className="admin-input w-full" />
          </div>
          <div>
            <Label>Sous-titre</Label>
            <input value={form.subtitle} onChange={set("subtitle")} placeholder="Suggestion du Chef" className="admin-input w-full" />
          </div>
          <div>
            <Label>Valable jusqu'à</Label>
            <input type="time" value={form.validUntil} onChange={set("validUntil")} className="admin-input w-full" />
          </div>
          <div className="col-span-2">
            <Label>Description (affichée entre guillemets)</Label>
            <input value={form.description} onChange={set("description")} placeholder="Un menu complet soigneusement préparé..." className="admin-input w-full" />
          </div>
          <div>
            <Label>Emoji (si pas d'image)</Label>
            <input value={form.emoji} onChange={set("emoji")} placeholder="👨‍🍳" className="admin-input w-full" />
          </div>
        </div>
      </Section>

      {/* Date range */}
      <Section title="Période de validité">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Du (date de début)</Label>
            <input
              type="date"
              value={form.dateFrom}
              onChange={set("dateFrom")}
              className="admin-input w-full"
            />
          </div>
          <div>
            <Label>Au (date de fin)</Label>
            <input
              type="date"
              value={form.dateTo}
              min={form.dateFrom}
              onChange={set("dateTo")}
              className="admin-input w-full"
            />
          </div>
        </div>
        <p className="text-[11px] text-mute/40 mt-2">
          Le menu sera visible par les clients entre ces deux dates (incluses), si le menu est actif.
        </p>
      </Section>

      {/* UI Style selector */}
      <Section title="Design de la carte client">
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              id: "modern",
              icon: <LayoutTemplate size={20} />,
              label: "Moderne",
              desc: "Design sombre élégant avec dégradés",
            },
            {
              id: "blackboard",
              icon: <BookOpen size={20} />,
              label: "Ardoise",
              desc: "Style tableau noir français classique",
            },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setOpt("uiStyle", s.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition text-center ${
                opts.uiStyle === s.id
                  ? "border-marigold bg-marigold/10 text-marigold"
                  : "border-cream/10 text-mute/60 hover:border-cream/25 hover:text-mute"
              }`}
            >
              {s.icon}
              <span className="text-sm font-semibold">{s.label}</span>
              <span className="text-[11px] leading-snug opacity-70">{s.desc}</span>
            </button>
          ))}
        </div>
      </Section>

      {/* Display options */}
      <Section title="Options d'affichage">
        <Toggle
          label="Afficher les prix individuels"
          description="Prix barré de chaque plat séparément"
          checked={opts.showItemPrices !== false}
          onChange={(v) => setOpt("showItemPrices", v)}
        />
        <Toggle
          label="Afficher les tags de promotion"
          description="Badge de réduction et économies réalisées"
          checked={opts.showPromoTags !== false}
          onChange={(v) => setOpt("showPromoTags", v)}
        />
        <Toggle
          label="Afficher l'image du menu"
          description="Photo ou emoji en haut de la carte"
          checked={opts.showImage !== false}
          onChange={(v) => setOpt("showImage", v)}
        />
        <p className="text-[11px] text-mute/40 mt-3">
          Le prix total du menu est toujours affiché, quelle que soit la configuration.
        </p>
      </Section>

      {/* Image */}
      <Section title="Image">
        <div className="flex gap-2 mb-2">
          {["url", "upload"].map((tab) => (
            <button
              key={tab}
              onClick={() => setImageTab(tab)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition ${
                imageTab === tab
                  ? "bg-marigold text-char border-marigold"
                  : "border-cream/15 text-mute hover:text-cream"
              }`}
            >
              {tab === "url" ? <><Link size={11} /> URL</> : <><Image size={11} /> Fichier</>}
            </button>
          ))}
        </div>
        {imageTab === "url" ? (
          <input
            value={form.image?.startsWith("data:") ? "" : form.image || ""}
            onChange={set("image")}
            placeholder="https://res.cloudinary.com/..."
            className="admin-input w-full"
          />
        ) : (
          <>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full border-2 border-dashed border-cream/15 hover:border-marigold/40 rounded-xl py-4 text-sm text-mute/60 hover:text-mute transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Image size={16} />
              {uploading ? "Upload en cours..." : form.image ? "Image chargée ✓ — cliquez pour changer" : "Cliquez pour choisir une image"}
            </button>
          </>
        )}
        {form.image && (
          <div className="mt-2 flex items-center gap-2">
            <img src={form.image} alt="preview" className="w-14 h-14 rounded-xl object-cover border border-cream/10"
              onError={(e) => { e.target.style.display = "none"; }} />
            <button onClick={() => setForm((p) => ({ ...p, image: "" }))} className="text-xs text-chili hover:underline">
              Supprimer
            </button>
          </div>
        )}
      </Section>

      {/* Items from existing menu */}
      <Section title="Plats du menu (depuis vos produits)" onAdd={addMenuItem} addLabel="+ Ajouter un plat">
        {form.items.length === 0 && (
          <p className="text-xs text-mute/40 italic">Aucun plat. Cliquez sur "+ Ajouter un plat".</p>
        )}
        <div className="space-y-3">
          {form.items.map((item, idx) => (
            <div key={idx} className="bg-char rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <select
                  value={item.menuItemId}
                  onChange={(e) => updateMenuItem(idx, "menuItemId", e.target.value)}
                  className="admin-input flex-1 text-xs"
                >
                  {menuItems.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — {Number(m.price).toFixed(2)}€
                    </option>
                  ))}
                </select>
                <button onClick={() => removeMenuItem(idx)} className="text-mute/40 hover:text-chili shrink-0">
                  <X size={15} />
                </button>
              </div>
              <p className="text-[11px] text-mute/50">
                Prix original :{" "}
                <span className="font-mono text-marigold">{Number(item.originalPrice).toFixed(2)}€</span>
                <span className="ml-2 text-mute/30">(inclus dans le prix unique du menu)</span>
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Extra items */}
      <Section title="Plats supplémentaires (hors menu existant)" onAdd={addExtraItem} addLabel="+ Ajouter">
        {form.extraItems.length === 0 && (
          <p className="text-xs text-mute/40 italic">Ex: dessert maison, accompagnement spécial...</p>
        )}
        <div className="space-y-2">
          {form.extraItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                value={item.name}
                onChange={(e) => updateExtraItem(idx, "name", e.target.value)}
                placeholder="Nom du plat"
                className="admin-input flex-1 text-xs"
              />
              <input
                type="number" step="0.50" min="0"
                value={item.price}
                onChange={(e) => updateExtraItem(idx, "price", e.target.value)}
                placeholder="Prix €"
                className="admin-input w-24 text-xs"
              />
              <button onClick={() => removeExtraItem(idx)} className="text-mute/40 hover:text-chili shrink-0">
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
      </Section>

      {/* Beverage */}
      <Section title="Boisson">
        <div className="bg-char rounded-xl p-3">
          <div className="flex items-center gap-2 mb-3">
            <GlassWater size={14} className="text-marigold shrink-0" />
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.beverage?.included || false}
                onChange={setBeverage("included")}
                className="accent-marigold w-4 h-4"
              />
              <span className="text-sm text-mute">Boisson incluse dans le menu</span>
            </label>
          </div>
          {form.beverage?.included && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Nom</Label>
                <input value={form.beverage.name} onChange={setBeverage("name")} placeholder="Boisson au choix" className="admin-input w-full text-xs" />
              </div>
              <div>
                <Label>Valeur (€)</Label>
                <input type="number" step="0.10" min="0" value={form.beverage.price} onChange={setBeverage("price")} className="admin-input w-full text-xs" />
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* Pricing */}
      <Section title="Prix du menu">
        <div className="bg-char rounded-2xl p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-mute/60">Valeur totale des plats</span>
            <span className="font-mono text-cream">{Number(form.totalOriginal).toFixed(2)}€</span>
          </div>
          <div>
            <Label>Prix unique du menu (€)</Label>
            <input
              type="number" step="0.50" min="0"
              value={form.menuPrice}
              onChange={set("menuPrice")}
              placeholder="0.00"
              className="admin-input w-full text-lg font-mono font-bold"
            />
          </div>
          {form.menuPrice > 0 && form.totalOriginal > form.menuPrice && (
            <div className="flex items-center justify-between pt-2 border-t border-cream/5">
              <span className="text-xs text-herb">Économie client</span>
              <span className="font-mono text-sm font-bold text-herb">
                -{savings}€ ({savingsPct}% de réduction)
              </span>
            </div>
          )}
        </div>
      </Section>

      {/* Preview */}
      <div className="bg-char-soft rounded-2xl p-4 border border-marigold/20 mb-6">
        <p className="text-xs text-marigold font-semibold uppercase tracking-wider mb-3">
          Aperçu du bouton client
        </p>
        <div
          className="flex items-center gap-2.5 px-4 py-3 rounded-full w-fit"
          style={{ background: "linear-gradient(135deg, #F2A93B 0%, #C8432A 100%)" }}
        >
          <span>{form.emoji || "👨‍🍳"}</span>
          <span className="font-display font-bold text-char">{form.title || "Menu du Jour"}</span>
          <span className="font-mono font-black text-char text-sm px-2 py-0.5 rounded-full"
            style={{ background: "rgba(27,20,17,0.15)" }}>
            {Number(form.menuPrice).toFixed(2)}€
          </span>
          <span className="w-2 h-2 rounded-full bg-char/80 animate-pulse" />
        </div>
        <p className="text-[11px] text-mute/40 mt-2">
          Design sélectionné :{" "}
          <span className="text-mute/60 font-medium">
            {opts.uiStyle === "blackboard" ? "Ardoise française" : "Moderne"}
          </span>
        </p>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving || !form.menuPrice}
        className="w-full flex items-center justify-center gap-2 bg-chili hover:bg-chili-dark text-cream font-semibold py-4 rounded-2xl transition disabled:opacity-50 mb-8"
      >
        {saving ? <span className="animate-spin">⏳</span> : <Check size={18} />}
        {saving ? "Enregistrement..." : "Enregistrer le Menu du Jour"}
      </button>
    </div>
  );
}










// import { useState, useEffect, useRef } from "react";
// import {
//   Plus, Save, X, Check,
//   Eye, EyeOff, Image, Link, GlassWater,
// } from "lucide-react";
// import { compressImage, uploadToCloudinary } from "../utils/imageUtils";

// const API_URL = import.meta.env.VITE_API_URL || "";

// const EMPTY = {
//   date: new Date().toISOString().slice(0, 10),
//   title: "Menu du Jour",
//   subtitle: "Suggestion du Chef",
//   description: "",
//   emoji: "👨‍🍳",
//   image: "",
//   items: [],
//   extraItems: [],
//   beverage: { name: "Boisson au choix", price: 2.0, included: true },
//   totalOriginal: 0,
//   menuPrice: 0,
//   validUntil: "21:00",
//   active: false,
// };

// function calcOriginal(items, extraItems, beverage) {
//   const a = (items || []).reduce((s, i) => s + (i.originalPrice || 0), 0);
//   const b = (extraItems || []).reduce((s, i) => s + (i.price || 0), 0);
//   const c = beverage?.included ? (beverage.price || 0) : 0;
//   return parseFloat((a + b + c).toFixed(2));
// }

// function Label({ children }) {
//   return (
//     <p className="text-[11px] text-mute/60 uppercase tracking-wider mb-1.5">
//       {children}
//     </p>
//   );
// }

// function Section({ title, children, onAdd, addLabel = "+ Ajouter" }) {
//   return (
//     <div className="mb-6">
//       <div className="flex items-center justify-between mb-2">
//         <h2 className="font-display text-sm font-semibold text-marigold uppercase tracking-wider">
//           {title}
//         </h2>
//         {onAdd && (
//           <button
//             onClick={onAdd}
//             className="text-xs text-mute hover:text-cream transition flex items-center gap-1"
//           >
//             <Plus size={12} /> {addLabel}
//           </button>
//         )}
//       </div>
//       <div className="bg-char-soft rounded-2xl p-4 border border-cream/5">
//         {children}
//       </div>
//     </div>
//   );
// }

// export default function MenuDuJourManager({ token }) {
//   const [form, setForm] = useState(EMPTY);
//   const [menuItems, setMenuItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [saveMsg, setSaveMsg] = useState("");
//   const [imageTab, setImageTab] = useState("url");
//   const [uploading, setUploading] = useState(false);
//   const fileRef = useRef(null);

//   useEffect(() => {
//     Promise.all([
//       fetch(`${API_URL}/api/business`).then((r) => r.json()),
//       fetch(`${API_URL}/api/menu-du-jour`).then((r) => r.json()),
//     ])
//       .then(([biz, mdj]) => {
//         setMenuItems(biz.menu || []);
//         if (mdj) setForm({ ...EMPTY, ...mdj });
//       })
//       .catch(() => setSaveMsg("Erreur de chargement."))
//       .finally(() => setLoading(false));
//   }, []);

//   // Auto-recalculate original total whenever items change
//   useEffect(() => {
//     const orig = calcOriginal(form.items, form.extraItems, form.beverage);
//     setForm((prev) => ({ ...prev, totalOriginal: orig }));
//   }, [form.items, form.extraItems, form.beverage]);

//   const set = (field) => (e) => {
//     const val =
//       e.target.type === "checkbox" ? e.target.checked
//       : e.target.type === "number" ? parseFloat(e.target.value) || 0
//       : e.target.value;
//     setForm((prev) => ({ ...prev, [field]: val }));
//   };

//   const setBeverage = (field) => (e) => {
//     const val =
//       e.target.type === "checkbox" ? e.target.checked
//       : e.target.type === "number" ? parseFloat(e.target.value) || 0
//       : e.target.value;
//     setForm((prev) => ({
//       ...prev,
//       beverage: { ...prev.beverage, [field]: val },
//     }));
//   };

//   // ─── Menu items from existing products ───────────────────────────────────
//   const addMenuItem = () => {
//     const first = menuItems[0];
//     if (!first) return;
//     setForm((prev) => ({
//       ...prev,
//       items: [
//         ...prev.items,
//         { menuItemId: first.id, name: first.name, originalPrice: first.price },
//       ],
//     }));
//   };

//   const updateMenuItem = (idx, field, value) => {
//     setForm((prev) => {
//       const items = [...prev.items];
//       if (field === "menuItemId") {
//         const found = menuItems.find((m) => m.id === value);
//         items[idx] = {
//           menuItemId: value,
//           name: found?.name || "",
//           originalPrice: found?.price || 0,
//         };
//       } else {
//         items[idx] = { ...items[idx], [field]: value };
//       }
//       return { ...prev, items };
//     });
//   };

//   const removeMenuItem = (idx) =>
//     setForm((prev) => ({
//       ...prev,
//       items: prev.items.filter((_, i) => i !== idx),
//     }));

//   // ─── Extra items not in menu ──────────────────────────────────────────────
//   const addExtraItem = () =>
//     setForm((prev) => ({
//       ...prev,
//       extraItems: [...prev.extraItems, { name: "", price: 0 }],
//     }));

//   const updateExtraItem = (idx, field, value) => {
//     setForm((prev) => {
//       const extraItems = [...prev.extraItems];
//       extraItems[idx] = {
//         ...extraItems[idx],
//         [field]: field === "price" ? parseFloat(value) || 0 : value,
//       };
//       return { ...prev, extraItems };
//     });
//   };

//   const removeExtraItem = (idx) =>
//     setForm((prev) => ({
//       ...prev,
//       extraItems: prev.extraItems.filter((_, i) => i !== idx),
//     }));

//   // ─── Image upload ─────────────────────────────────────────────────────────
//   const handleFileUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     setUploading(true);
//     try {
//       const compressed = await compressImage(file, 800, 0.82);
//       const url = await uploadToCloudinary(
//         compressed,
//         token,
//         "chezfarahi/menu-du-jour"
//       );
//       setForm((prev) => ({ ...prev, image: url }));
//     } catch (err) {
//       setSaveMsg("Erreur upload: " + err.message);
//     } finally {
//       setUploading(false);
//     }
//   };

//   // ─── Save ─────────────────────────────────────────────────────────────────
//   const handleSave = async () => {
//     setSaving(true);
//     setSaveMsg("");
//     try {
//       const res = await fetch(`${API_URL}/api/menu-du-jour`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           "x-admin-token": token,
//         },
//         body: JSON.stringify(form),
//       });
//       if (!res.ok) throw new Error("Save failed");
//       setSaveMsg("Menu du Jour enregistré ✓");
//       setTimeout(() => setSaveMsg(""), 3000);
//     } catch {
//       setSaveMsg("Erreur lors de la sauvegarde.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <span className="text-4xl animate-bounce">👨‍🍳</span>
//       </div>
//     );
//   }

//   const savings = (form.totalOriginal - form.menuPrice).toFixed(2);
//   const savingsPct =
//     form.totalOriginal > 0
//       ? Math.round((1 - form.menuPrice / form.totalOriginal) * 100)
//       : 0;

//   return (
//     <div className="text-cream max-w-2xl mx-auto">

//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <p className="text-marigold text-xs font-semibold uppercase tracking-widest mb-1">
//             Admin
//           </p>
//           <h1 className="font-display text-3xl font-bold">Menu du Jour</h1>
//         </div>
//         <div className="flex items-center gap-3">
//           {saveMsg && (
//             <span
//               className={`text-xs font-medium ${
//                 saveMsg.includes("Erreur") ? "text-chili" : "text-herb"
//               }`}
//             >
//               {saveMsg}
//             </span>
//           )}
//           <button
//             onClick={handleSave}
//             disabled={saving}
//             className="flex items-center gap-2 bg-chili hover:bg-chili-dark text-cream font-semibold px-5 py-2.5 rounded-full transition disabled:opacity-50"
//           >
//             <Save size={15} />
//             {saving ? "Enregistrement..." : "Enregistrer"}
//           </button>
//         </div>
//       </div>

//       {/* Active toggle */}
//       <div className="bg-char-soft rounded-2xl p-4 border border-cream/5 mb-5 flex items-center justify-between">
//         <div>
//           <p className="font-semibold text-cream text-sm">
//             Menu actif aujourd'hui
//           </p>
//           <p className="text-xs text-mute/50 mt-0.5">
//             {form.active
//               ? "Visible par les clients sur la page d'accueil"
//               : "Masqué — les clients ne voient pas ce menu"}
//           </p>
//         </div>
//         <button
//           onClick={() => setForm((prev) => ({ ...prev, active: !prev.active }))}
//           className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full border transition ${
//             form.active
//               ? "bg-herb/20 border-herb/40 text-herb"
//               : "bg-cream/5 border-cream/15 text-mute"
//           }`}
//         >
//           {form.active ? (
//             <><Eye size={13} /> Actif</>
//           ) : (
//             <><EyeOff size={13} /> Inactif</>
//           )}
//         </button>
//       </div>

//       {/* Basic info */}
//       <Section title="Informations générales">
//         <div className="grid grid-cols-2 gap-3">
//           <div className="col-span-2">
//             <Label>Titre</Label>
//             <input
//               value={form.title}
//               onChange={set("title")}
//               className="admin-input w-full"
//             />
//           </div>
//           <div>
//             <Label>Sous-titre</Label>
//             <input
//               value={form.subtitle}
//               onChange={set("subtitle")}
//               placeholder="Suggestion du Chef"
//               className="admin-input w-full"
//             />
//           </div>
//           <div>
//             <Label>Valable jusqu'à</Label>
//             <input
//               type="time"
//               value={form.validUntil}
//               onChange={set("validUntil")}
//               className="admin-input w-full"
//             />
//           </div>
//           <div className="col-span-2">
//             <Label>Description (affichée entre guillemets)</Label>
//             <input
//               value={form.description}
//               onChange={set("description")}
//               placeholder="Un menu complet soigneusement préparé..."
//               className="admin-input w-full"
//             />
//           </div>
//           <div>
//             <Label>Emoji (si pas d'image)</Label>
//             <input
//               value={form.emoji}
//               onChange={set("emoji")}
//               placeholder="👨‍🍳"
//               className="admin-input w-full"
//             />
//           </div>
//           <div>
//             <Label>Date</Label>
//             <input
//               type="date"
//               value={form.date}
//               onChange={set("date")}
//               className="admin-input w-full"
//             />
//           </div>
//         </div>
//       </Section>

//       {/* Image */}
//       <Section title="Image">
//         <div className="flex gap-2 mb-2">
//           {["url", "upload"].map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setImageTab(tab)}
//               className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition ${
//                 imageTab === tab
//                   ? "bg-marigold text-char border-marigold"
//                   : "border-cream/15 text-mute hover:text-cream"
//               }`}
//             >
//               {tab === "url" ? (
//                 <><Link size={11} /> URL</>
//               ) : (
//                 <><Image size={11} /> Fichier</>
//               )}
//             </button>
//           ))}
//         </div>
//         {imageTab === "url" ? (
//           <input
//             value={form.image?.startsWith("data:") ? "" : form.image || ""}
//             onChange={set("image")}
//             placeholder="https://res.cloudinary.com/..."
//             className="admin-input w-full"
//           />
//         ) : (
//           <>
//             <input
//               ref={fileRef}
//               type="file"
//               accept="image/*"
//               onChange={handleFileUpload}
//               className="hidden"
//             />
//             <button
//               onClick={() => fileRef.current?.click()}
//               disabled={uploading}
//               className="w-full border-2 border-dashed border-cream/15 hover:border-marigold/40 rounded-xl py-4 text-sm text-mute/60 hover:text-mute transition flex items-center justify-center gap-2 disabled:opacity-50"
//             >
//               <Image size={16} />
//               {uploading
//                 ? "Upload en cours..."
//                 : form.image
//                 ? "Image chargée ✓ — cliquez pour changer"
//                 : "Cliquez pour choisir une image"}
//             </button>
//           </>
//         )}
//         {form.image && (
//           <div className="mt-2 flex items-center gap-2">
//             <img
//               src={form.image}
//               alt="preview"
//               className="w-14 h-14 rounded-xl object-cover border border-cream/10"
//               onError={(e) => { e.target.style.display = "none"; }}
//             />
//             <button
//               onClick={() => setForm((p) => ({ ...p, image: "" }))}
//               className="text-xs text-chili hover:underline"
//             >
//               Supprimer
//             </button>
//           </div>
//         )}
//       </Section>

//       {/* Items from existing menu */}
//       <Section
//         title="Plats du menu (depuis vos produits)"
//         onAdd={addMenuItem}
//         addLabel="+ Ajouter un plat"
//       >
//         {form.items.length === 0 && (
//           <p className="text-xs text-mute/40 italic">
//             Aucun plat ajouté. Cliquez sur "+ Ajouter un plat".
//           </p>
//         )}
//         <div className="space-y-3">
//           {form.items.map((item, idx) => (
//             <div key={idx} className="bg-char rounded-xl p-3">
//               <div className="flex items-center gap-2 mb-2">
//                 <select
//                   value={item.menuItemId}
//                   onChange={(e) =>
//                     updateMenuItem(idx, "menuItemId", e.target.value)
//                   }
//                   className="admin-input flex-1 text-xs"
//                 >
//                   {menuItems.map((m) => (
//                     <option key={m.id} value={m.id}>
//                       {m.name} — {Number(m.price).toFixed(2)}€
//                     </option>
//                   ))}
//                 </select>
//                 <button
//                   onClick={() => removeMenuItem(idx)}
//                   className="text-mute/40 hover:text-chili shrink-0"
//                 >
//                   <X size={15} />
//                 </button>
//               </div>
//               <div className="flex items-center gap-2">
//                 <p className="text-[10px] text-mute/50">Prix original :</p>
//                 <p className="font-mono text-xs text-marigold">
//                   {Number(item.originalPrice).toFixed(2)}€
//                 </p>
//                 <p className="text-[10px] text-mute/40 ml-1">
//                   (inclus dans le prix unique du menu)
//                 </p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </Section>

//       {/* Extra items */}
//       <Section
//         title="Plats supplémentaires (hors menu existant)"
//         onAdd={addExtraItem}
//         addLabel="+ Ajouter"
//       >
//         {form.extraItems.length === 0 && (
//           <p className="text-xs text-mute/40 italic">
//             Ex: dessert maison, accompagnement spécial...
//           </p>
//         )}
//         <div className="space-y-2">
//           {form.extraItems.map((item, idx) => (
//             <div key={idx} className="flex items-center gap-2">
//               <input
//                 value={item.name}
//                 onChange={(e) => updateExtraItem(idx, "name", e.target.value)}
//                 placeholder="Nom du plat"
//                 className="admin-input flex-1 text-xs"
//               />
//               <input
//                 type="number"
//                 step="0.50"
//                 min="0"
//                 value={item.price}
//                 onChange={(e) => updateExtraItem(idx, "price", e.target.value)}
//                 placeholder="Prix €"
//                 className="admin-input w-24 text-xs"
//               />
//               <button
//                 onClick={() => removeExtraItem(idx)}
//                 className="text-mute/40 hover:text-chili shrink-0"
//               >
//                 <X size={15} />
//               </button>
//             </div>
//           ))}
//         </div>
//       </Section>

//       {/* Beverage */}
//       <Section title="Boisson">
//         <div className="bg-char rounded-xl p-3">
//           <div className="flex items-center gap-2 mb-3">
//             <GlassWater size={14} className="text-marigold shrink-0" />
//             <label className="flex items-center gap-2 cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={form.beverage?.included || false}
//                 onChange={setBeverage("included")}
//                 className="accent-marigold w-4 h-4"
//               />
//               <span className="text-sm text-mute">
//                 Boisson incluse dans le menu
//               </span>
//             </label>
//           </div>
//           {form.beverage?.included && (
//             <div className="grid grid-cols-2 gap-2">
//               <div>
//                 <Label>Nom</Label>
//                 <input
//                   value={form.beverage.name}
//                   onChange={setBeverage("name")}
//                   placeholder="Boisson au choix"
//                   className="admin-input w-full text-xs"
//                 />
//               </div>
//               <div>
//                 <Label>Valeur (€)</Label>
//                 <input
//                   type="number"
//                   step="0.10"
//                   min="0"
//                   value={form.beverage.price}
//                   onChange={setBeverage("price")}
//                   className="admin-input w-full text-xs"
//                 />
//               </div>
//             </div>
//           )}
//         </div>
//       </Section>

//       {/* Pricing */}
//       <Section title="Prix du menu">
//         <div className="bg-char rounded-2xl p-4 space-y-3">
//           <div className="flex justify-between text-sm">
//             <span className="text-mute/60">Valeur totale des plats</span>
//             <span className="font-mono text-cream">
//               {Number(form.totalOriginal).toFixed(2)}€
//             </span>
//           </div>
//           <div>
//             <Label>Prix unique du menu (€)</Label>
//             <input
//               type="number"
//               step="0.50"
//               min="0"
//               value={form.menuPrice}
//               onChange={set("menuPrice")}
//               placeholder="0.00"
//               className="admin-input w-full text-lg font-mono font-bold"
//             />
//           </div>
//           {form.menuPrice > 0 && form.totalOriginal > form.menuPrice && (
//             <div className="flex items-center justify-between pt-2 border-t border-cream/5">
//               <span className="text-xs text-herb">Économie client</span>
//               <span className="font-mono text-sm font-bold text-herb">
//                 -{savings}€ ({savingsPct}% de réduction)
//               </span>
//             </div>
//           )}
//         </div>
//       </Section>

//       {/* Button preview */}
//       <div className="bg-char-soft rounded-2xl p-4 border border-marigold/20 mb-6">
//         <p className="text-xs text-marigold font-semibold uppercase tracking-wider mb-3">
//           Aperçu du bouton client
//         </p>
//         <div
//           className="flex items-center gap-2.5 px-4 py-3 rounded-full w-fit"
//           style={{
//             background: "linear-gradient(135deg, #F2A93B 0%, #C8432A 100%)",
//           }}
//         >
//           <span>{form.emoji || "👨‍🍳"}</span>
//           <span className="font-display font-bold text-char">
//             {form.title || "Menu du Jour"}
//           </span>
//           <span
//             className="font-mono font-black text-char text-sm px-2 py-0.5 rounded-full"
//             style={{ background: "rgba(27,20,17,0.15)" }}
//           >
//             {Number(form.menuPrice).toFixed(2)}€
//           </span>
//           <span className="w-2 h-2 rounded-full bg-char/80 animate-pulse" />
//         </div>
//       </div>

//       {/* Save button at bottom */}
//       <button
//         onClick={handleSave}
//         disabled={saving || !form.menuPrice}
//         className="w-full flex items-center justify-center gap-2 bg-chili hover:bg-chili-dark text-cream font-semibold py-4 rounded-2xl transition disabled:opacity-50 mb-8"
//       >
//         {saving ? <span className="animate-spin">⏳</span> : <Check size={18} />}
//         {saving ? "Enregistrement..." : "Enregistrer le Menu du Jour"}
//       </button>
//     </div>
//   );
// }