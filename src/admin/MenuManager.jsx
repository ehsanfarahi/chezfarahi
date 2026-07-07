import { useState, useEffect, useRef } from "react";
import {
  Plus, Trash2, Pencil, X, Check,
  Leaf, Flame, Image, Link, Clock, Eye, EyeOff,
} from "lucide-react";

import { compressImage, uploadToCloudinary } from "../utils/imageUtils";

const API_URL = import.meta.env.VITE_API_URL || "";
const CATEGORIES = ["Samosas", "Sandwichs", "Hot-Dogs", "Frites", "Boissons", "Desserts"];
const ALLERGEN_OPTIONS = ["Gluten", "Lait", "Oeufs", "Arachides", "Soja", "Fruits à coque", "Sésame", "Moutarde"];

const EMPTY_ITEM = {
  id: "", category: "Samosas", name: "", desc: "", price: 0,
  discount: 0, veg: false, spicy: 0, image: "", prepTime: 5,
  available: true, allergens: [],
  nutrition: { calories: 0, protein: "0g", carbs: "0g", fat: "0g" },
};

function Label({ children }) {
  return <p className="text-[11px] text-mute/60 uppercase tracking-wider mb-1.5">{children}</p>;
}

function ItemForm({ item, setItem, onSave, onCancel, saveLabel, saving, token }) {
  const fileRef = useRef(null);
  const [imageTab, setImageTab] = useState("url");

  const set = (field) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked
      : e.target.type === "number" ? parseFloat(e.target.value) || 0
      : e.target.value;
    setItem((prev) => ({ ...prev, [field]: val }));
  };

  const setNutrition = (field) => (e) =>
    setItem((prev) => ({ ...prev, nutrition: { ...prev.nutrition, [field]: e.target.value } }));

  const toggleAllergen = (allergen) => {
    const current = item.allergens || [];
    setItem((prev) => ({
      ...prev,
      allergens: current.includes(allergen)
        ? current.filter((a) => a !== allergen)
        : [...current, allergen],
    }));
  };

  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  setUploading(true);
  try {
    const compressed = await compressImage(file, 800, 0.82);
    const url = await uploadToCloudinary(compressed, token, "chezfarahi/menu");
    setItem((prev) => ({ ...prev, image: url }));
  } catch (err) {
    alert("Erreur upload: " + err.message);
  } finally {
    setUploading(false);
  }
};

  // const handleFileUpload = (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;
  //   const reader = new FileReader();
  //   reader.onload = (ev) => {
  //     const img = document.createElement("img");
  //     img.onload = () => {
  //       const canvas = document.createElement("canvas");
  //       const MAX = 400;
  //       const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
  //       canvas.width = img.width * ratio;
  //       canvas.height = img.height * ratio;
  //       canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
  //       setItem((prev) => ({ ...prev, image: canvas.toDataURL("image/jpeg", 0.75) }));
  //     };
  //     img.src = ev.target.result;
  //   };
  //   reader.readAsDataURL(file);
  // };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label>Nom du plat</Label>
          <input value={item.name} onChange={set("name")} placeholder="Ex: Samosa Agneau Épicé" className="admin-input w-full" />
        </div>
        <div>
          <Label>Catégorie</Label>
          <select value={item.category} onChange={set("category")} className="admin-input w-full">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <Label>Niveau piquant</Label>
          <select value={item.spicy} onChange={set("spicy")} className="admin-input w-full">
            <option value={0}>🌿 Non piquant</option>
            <option value={1}>🌶️ Légèrement</option>
            <option value={2}>🌶️🌶️ Piquant</option>
            <option value={3}>🌶️🌶️🌶️ Très piquant</option>
          </select>
        </div>
        <div className="col-span-2">
          <Label>Description</Label>
          <input value={item.desc} onChange={set("desc")} placeholder="Ingrédients, préparation..." className="admin-input w-full" />
        </div>
      </div>

      <div>
        <Label>Prix & remise</Label>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-[10px] text-mute/50 mb-1">Prix (€)</p>
            <input type="number" step="0.50" min="0" value={item.price} onChange={set("price")} className="admin-input w-full" />
          </div>
          <div>
            <p className="text-[10px] text-mute/50 mb-1">Remise combo (€)</p>
            <input type="number" step="0.10" min="0" value={item.discount} onChange={set("discount")} className="admin-input w-full" />
          </div>
          <div>
            <p className="text-[10px] text-mute/50 mb-1">Temps prép. (min)</p>
            <input type="number" min="1" max="60" value={item.prepTime || 5} onChange={set("prepTime")} className="admin-input w-full" />
          </div>
        </div>
      </div>

      <div>
        <Label>Image</Label>
        <div className="flex gap-2 mb-2">
          {["url", "upload"].map((tab) => (
            <button key={tab} onClick={() => setImageTab(tab)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition ${
                imageTab === tab ? "bg-marigold text-char border-marigold" : "border-cream/15 text-mute hover:text-cream"
              }`}
            >
              {tab === "url" ? <><Link size={11} /> URL</> : <><Image size={11} /> Fichier</>}
            </button>
          ))}
        </div>
        {imageTab === "url" ? (
          <input
            value={item.image?.startsWith("data:") ? "" : (item.image || "")}
            onChange={set("image")}
            placeholder="https://example.com/image.jpg"
            className="admin-input w-full"
          />
        ) : (
          <>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="w-full border-2 border-dashed border-cream/15 hover:border-marigold/40 rounded-xl py-4 text-sm text-mute/60 hover:text-mute transition flex items-center justify-center gap-2"
            >
              <Image size={16} />
              {uploading ? "Upload en cours..." : item.image && !item.image.startsWith("data:") ? "Image chargée ✓" : "Cliquez pour choisir une image"}
            </button>
          </>
        )}
        {item.image && (
          <div className="mt-2 flex items-center gap-2">
            <img src={item.image} alt="preview" className="w-14 h-14 rounded-lg object-cover border border-cream/10"
              onError={(e) => { e.target.style.display = "none"; }} />
            <button onClick={() => setItem((p) => ({ ...p, image: "" }))} className="text-xs text-chili hover:underline">
              Supprimer l'image
            </button>
          </div>
        )}
      </div>

      <div>
        <Label>Informations nutritionnelles</Label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { key: "calories", label: "Calories", ph: "280" },
            { key: "protein", label: "Protéines", ph: "12g" },
            { key: "carbs", label: "Glucides", ph: "24g" },
            { key: "fat", label: "Lipides", ph: "16g" },
          ].map(({ key, label, ph }) => (
            <div key={key}>
              <p className="text-[10px] text-mute/50 mb-1">{label}</p>
              <input value={(item.nutrition || {})[key] || ""} onChange={setNutrition(key)}
                placeholder={ph} className="admin-input w-full text-xs" />
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>Allergènes</Label>
        <div className="flex flex-wrap gap-2">
          {ALLERGEN_OPTIONS.map((a) => {
            const active = (item.allergens || []).includes(a);
            return (
              <button key={a} onClick={() => toggleAllergen(a)}
                className={`text-xs px-2.5 py-1 rounded-full border transition ${
                  active ? "bg-chili/20 text-chili border-chili/40" : "border-cream/15 text-mute/60 hover:border-cream/30"
                }`}
              >
                {a}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={item.veg || false} onChange={set("veg")} className="accent-herb w-4 h-4" />
          <span className="text-sm text-mute flex items-center gap-1.5"><Leaf size={13} className="text-herb" /> Végétarien</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={item.available !== false}
            onChange={(e) => setItem((p) => ({ ...p, available: e.target.checked }))} className="accent-marigold w-4 h-4" />
          <span className="text-sm text-mute flex items-center gap-1.5"><Eye size={13} className="text-marigold" /> Disponible aujourd'hui</span>
        </label>
      </div>

      <div className="flex gap-2 pt-1 border-t border-cream/5">
        <button onClick={onSave} disabled={saving || !item.name.trim()}
          className="flex items-center gap-2 bg-chili hover:bg-chili-dark text-cream font-semibold px-5 py-2.5 rounded-full transition disabled:opacity-50"
        >
          {saving ? <span className="animate-spin">⏳</span> : <Check size={15} />}
          {saving ? "Enregistrement..." : saveLabel}
        </button>
        <button onClick={onCancel}
          className="px-5 py-2.5 rounded-full border border-cream/15 text-mute hover:text-cream text-sm transition"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}

export default function MenuManager({ token }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState(EMPTY_ITEM);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [filterCat, setFilterCat] = useState("Tous");

  useEffect(() => { loadMenu(); }, []);

  async function loadMenu() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/business`);
      const data = await res.json();
      setItems(data.menu || []);
    } catch { setSaveMsg("Erreur de chargement du menu."); }
    finally { setLoading(false); }
  }

  async function saveMenu(updatedItems) {
    setSaving(true); setSaveMsg("");
    try {
      const res = await fetch(`${API_URL}/api/business`);
      const fullData = await res.json();
      const saveRes = await fetch(`${API_URL}/api/admin`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({ ...fullData, menu: updatedItems }),
      });
      if (!saveRes.ok) throw new Error();
      setItems(updatedItems);
      setSaveMsg("Enregistré ✓");
      setTimeout(() => setSaveMsg(""), 2500);
    } catch { setSaveMsg("Erreur lors de la sauvegarde."); }
    finally { setSaving(false); }
  }

  const startEdit = (item) => { setEditingId(item.id); setEditDraft({ ...item }); };
  const cancelEdit = () => { setEditingId(null); setEditDraft(null); };
  const saveEdit = async () => {
    await saveMenu(items.map((i) => (i.id === editingId ? editDraft : i)));
    cancelEdit();
  };
  const deleteItem = async (id) => {
    if (!window.confirm("Supprimer cet article ?")) return;
    await saveMenu(items.filter((i) => i.id !== id));
  };
  const addItem = async () => {
    if (!newItem.name.trim()) return;
    await saveMenu([...items, { ...newItem, id: `item-${Date.now()}`, price: parseFloat(newItem.price) || 0, discount: parseFloat(newItem.discount) || 0, prepTime: parseInt(newItem.prepTime) || 5 }]);
    setNewItem(EMPTY_ITEM); setAdding(false);
  };
  const toggleAvailability = async (id) =>
    saveMenu(items.map((i) => i.id === id ? { ...i, available: !i.available } : i));

  const categoryEmoji = (cat) => ({ Samosas: "🥟", Sandwichs: "🥪", "Hot-Dogs": "🌭", Frites: "🍟", Boissons: "🥤", Desserts: "🍮" }[cat] || "🍽️");
  const filtered = filterCat === "Tous" ? items : items.filter((i) => i.category === filterCat);

  if (loading) return <div className="flex items-center justify-center h-64"><span className="text-4xl animate-bounce">🍔</span></div>;

  return (
    <div className="text-cream max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-marigold text-xs font-semibold uppercase tracking-widest mb-1">Admin</p>
          <h1 className="font-display text-3xl font-bold">Menu</h1>
        </div>
        <div className="flex items-center gap-3">
          {saveMsg && <span className={`text-xs font-medium ${saveMsg.includes("Erreur") ? "text-chili" : "text-herb"}`}>{saveMsg}</span>}
          <button onClick={() => setAdding(true)}
            className="flex items-center gap-2 bg-marigold hover:bg-marigold-light text-char font-semibold px-4 py-2.5 rounded-full transition active:scale-95"
          >
            <Plus size={16} /> Ajouter un plat
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-none">
        {["Tous", ...CATEGORIES].map((cat) => (
          <button key={cat} onClick={() => setFilterCat(cat)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition ${
              filterCat === cat ? "bg-marigold text-char border-marigold" : "border-cream/15 text-mute hover:border-cream/30 hover:text-cream"
            }`}
          >{cat}</button>
        ))}
      </div>

      {adding && (
        <div className="bg-char-soft border border-marigold/30 rounded-2xl p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-marigold">Nouvel article</h3>
            <button onClick={() => setAdding(false)}><X size={18} className="text-mute/50" /></button>
          </div>
          <ItemForm item={newItem} setItem={setNewItem} onSave={addItem} onCancel={() => { setAdding(false); setNewItem(EMPTY_ITEM); }} saveLabel="Ajouter au menu" saving={saving} token={token} />
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((item) => (
          <div key={item.id} className={`bg-char-soft rounded-2xl border overflow-hidden ${item.available === false ? "border-cream/5 opacity-60" : "border-cream/5"}`}>
            {editingId === item.id ? (
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold text-marigold">Modifier</h3>
                  <button onClick={cancelEdit}><X size={18} className="text-mute/50" /></button>
                </div>
                <ItemForm item={editDraft} setItem={setEditDraft} onSave={saveEdit} onCancel={cancelEdit} saveLabel="Enregistrer" saving={saving} token={token} />
              </div>
            ) : (
              <div className="flex items-center gap-4 px-4 py-3.5">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-char flex items-center justify-center shrink-0">
                  {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <span className="text-2xl">{categoryEmoji(item.category)}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-cream text-sm truncate">{item.name}</h3>
                    {item.veg && <Leaf size={12} className="text-herb shrink-0" />}
                    {item.spicy > 0 && <span className="flex shrink-0">{Array.from({ length: item.spicy }).map((_, i) => <Flame key={i} size={11} className="fill-chili text-chili" />)}</span>}
                    {item.available === false && <span className="text-[10px] bg-chili/20 text-chili px-1.5 py-0.5 rounded-full shrink-0">Indisponible</span>}
                  </div>
                  <p className="text-xs text-mute/60 truncate">{item.desc}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="font-mono text-xs font-semibold text-marigold">{item.price?.toFixed(2)}€</span>
                    {item.discount > 0 && <span className="text-[10px] bg-herb/20 text-herb px-1.5 py-0.5 rounded-full">-{item.discount?.toFixed(2)}€ combo</span>}
                    {item.prepTime && <span className="text-[10px] text-mute/40 flex items-center gap-0.5"><Clock size={9} /> {item.prepTime}min</span>}
                    <span className="text-[10px] text-mute/40 bg-char px-1.5 py-0.5 rounded-full">{item.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => toggleAvailability(item.id)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-cream/10 text-mute/50 hover:text-cream transition">
                    {item.available === false ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button onClick={() => startEdit(item)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-cream/10 text-mute/60 hover:text-cream transition"><Pencil size={14} /></button>
                  <button onClick={() => deleteItem(item.id)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-chili/10 text-mute/60 hover:text-chili transition"><Trash2 size={14} /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {filtered.length === 0 && <div className="text-center py-16 text-mute/40 text-sm">Aucun article dans cette catégorie.</div>}
    </div>
  );
}
