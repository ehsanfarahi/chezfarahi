import { useState, useEffect } from "react";
import { Plus, Trash2, Save, Pencil, X, Check, Leaf, Flame } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";
const CATEGORIES = ["Samosas", "Sandwichs", "Hot-Dogs", "Frites", "Boissons", "Desserts"];

const EMPTY_ITEM = {
  id: "",
  category: "Samosas",
  name: "",
  desc: "",
  price: 0,
  discount: 0,
  veg: false,
  spicy: 0,
};

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

  useEffect(() => {
    loadMenu();
  }, []);

  async function loadMenu() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/business`);
      const data = await res.json();
      setItems(data.menu || []);
    } catch {
      setSaveMsg("Erreur de chargement du menu.");
    } finally {
      setLoading(false);
    }
  }

  async function saveMenu(updatedItems) {
    setSaving(true);
    setSaveMsg("");
    try {
      // Fetch full business data first, then patch menu
      const res = await fetch(`${API_URL}/api/business`);
      const fullData = await res.json();
      const updated = { ...fullData, menu: updatedItems };

      const saveRes = await fetch(`${API_URL}/api/business`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify(updated),
      });
      if (!saveRes.ok) throw new Error();
      setItems(updatedItems);
      setSaveMsg("Enregistré ✓");
      setTimeout(() => setSaveMsg(""), 2500);
    } catch {
      setSaveMsg("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  }

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditDraft({ ...item });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft(null);
  };

  const saveEdit = async () => {
    const updated = items.map((i) => (i.id === editingId ? editDraft : i));
    await saveMenu(updated);
    setEditingId(null);
    setEditDraft(null);
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Supprimer cet article du menu ?")) return;
    await saveMenu(items.filter((i) => i.id !== id));
  };

  const addItem = async () => {
    if (!newItem.name.trim()) return;
    const id = `item-${Date.now()}`;
    const itemToAdd = { ...newItem, id, price: parseFloat(newItem.price) || 0, discount: parseFloat(newItem.discount) || 0 };
    await saveMenu([...items, itemToAdd]);
    setNewItem(EMPTY_ITEM);
    setAdding(false);
  };

  const update = (setter) => (field) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked
      : e.target.type === "number" ? parseFloat(e.target.value) || 0
      : e.target.value;
    setter((prev) => ({ ...prev, [field]: val }));
  };

  const filtered = filterCat === "Tous" ? items : items.filter((i) => i.category === filterCat);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-mute/50">
        <span className="text-4xl animate-bounce">🍔</span>
      </div>
    );
  }

  return (
    <div className="text-cream max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-marigold text-xs font-semibold uppercase tracking-widest mb-1">Admin</p>
          <h1 className="font-display text-3xl font-bold">Menu</h1>
        </div>
        <div className="flex items-center gap-3">
          {saveMsg && (
            <span className={`text-xs font-medium ${saveMsg.includes("Erreur") ? "text-chili" : "text-herb"}`}>
              {saveMsg}
            </span>
          )}
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 bg-marigold hover:bg-marigold-light text-char font-semibold px-4 py-2.5 rounded-full transition active:scale-95"
          >
            <Plus size={16} /> Ajouter
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-none">
        {["Tous", ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition ${
              filterCat === cat
                ? "bg-marigold text-char border-marigold"
                : "border-cream/15 text-mute hover:border-cream/30 hover:text-cream"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Add new item form */}
      {adding && (
        <div className="bg-char-soft border border-marigold/30 rounded-2xl p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-marigold">Nouvel article</h3>
            <button onClick={() => setAdding(false)} className="text-mute/50 hover:text-cream">
              <X size={18} />
            </button>
          </div>
          <ItemForm
            item={newItem}
            onChange={update(setNewItem)}
            onSave={addItem}
            onCancel={() => setAdding(false)}
            saveLabel="Ajouter au menu"
            saving={saving}
          />
        </div>
      )}

      {/* Menu items list */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div key={item.id} className="bg-char-soft rounded-2xl border border-cream/5 overflow-hidden">
            {editingId === item.id ? (
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold text-marigold">Modifier</h3>
                  <button onClick={cancelEdit} className="text-mute/50 hover:text-cream">
                    <X size={18} />
                  </button>
                </div>
                <ItemForm
                  item={editDraft}
                  onChange={update(setEditDraft)}
                  onSave={saveEdit}
                  onCancel={cancelEdit}
                  saveLabel="Enregistrer"
                  saving={saving}
                />
              </div>
            ) : (
              <div className="flex items-center gap-4 px-5 py-4">
                <span className="text-2xl shrink-0">
                  {item.category === "Samosas" ? "🥟"
                    : item.category === "Sandwichs" ? "🥪"
                    : item.category === "Hot-Dogs" ? "🌭"
                    : item.category === "Frites" ? "🍟"
                    : item.category === "Boissons" ? "🥤"
                    : "🍽️"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-cream text-sm truncate">{item.name}</h3>
                    {item.veg && <Leaf size={12} className="text-herb shrink-0" />}
                    {item.spicy > 0 && (
                      <span className="flex shrink-0">
                        {Array.from({ length: item.spicy }).map((_, i) => (
                          <Flame key={i} size={11} className="fill-chili text-chili -ml-0.5 first:ml-0" />
                        ))}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-mute/60 truncate">{item.desc}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="font-mono text-xs font-semibold text-marigold">
                      {item.price.toFixed(2)}€
                    </span>
                    {item.discount > 0 && (
                      <span className="text-[10px] bg-herb/20 text-herb px-1.5 py-0.5 rounded-full">
                        -{item.discount.toFixed(2)}€ remise
                      </span>
                    )}
                    <span className="text-[10px] text-mute/40 bg-char px-1.5 py-0.5 rounded-full">
                      {item.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => startEdit(item)}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-cream/10 text-mute/60 hover:text-cream transition"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-chili/10 text-mute/60 hover:text-chili transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-mute/40 text-sm">
          Aucun article dans cette catégorie.
        </div>
      )}
    </div>
  );
}

function ItemForm({ item, onChange, onSave, onCancel, saveLabel, saving }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-[11px] text-mute/60 uppercase tracking-wider mb-1 block">Nom</label>
          <input
            value={item.name}
            onChange={onChange("name")}
            placeholder="Nom du plat"
            className="admin-input w-full"
          />
        </div>
        <div>
          <label className="text-[11px] text-mute/60 uppercase tracking-wider mb-1 block">Catégorie</label>
          <select value={item.category} onChange={onChange("category")} className="admin-input w-full">
            {["Samosas", "Sandwichs", "Hot-Dogs", "Frites", "Boissons", "Desserts"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[11px] text-mute/60 uppercase tracking-wider mb-1 block">Piquant (0-3)</label>
          <select value={item.spicy} onChange={onChange("spicy")} className="admin-input w-full">
            <option value={0}>🌿 Non piquant</option>
            <option value={1}>🌶️ Légèrement</option>
            <option value={2}>🌶️🌶️ Piquant</option>
            <option value={3}>🌶️🌶️🌶️ Très piquant</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="text-[11px] text-mute/60 uppercase tracking-wider mb-1 block">Description</label>
          <input
            value={item.desc}
            onChange={onChange("desc")}
            placeholder="Ingrédients et description"
            className="admin-input w-full"
          />
        </div>
        <div>
          <label className="text-[11px] text-mute/60 uppercase tracking-wider mb-1 block">Prix (€)</label>
          <input
            type="number"
            step="0.50"
            min="0"
            value={item.price}
            onChange={onChange("price")}
            className="admin-input w-full"
          />
        </div>
        <div>
          <label className="text-[11px] text-mute/60 uppercase tracking-wider mb-1 block">Remise combo (€)</label>
          <input
            type="number"
            step="0.10"
            min="0"
            value={item.discount}
            onChange={onChange("discount")}
            className="admin-input w-full"
          />
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <input
            type="checkbox"
            id="veg"
            checked={item.veg}
            onChange={onChange("veg")}
            className="accent-herb w-4 h-4"
          />
          <label htmlFor="veg" className="text-sm text-mute flex items-center gap-1.5">
            <Leaf size={13} className="text-herb" /> Article végétarien
          </label>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 bg-chili hover:bg-chili-dark text-cream font-semibold px-5 py-2.5 rounded-full transition disabled:opacity-50"
        >
          {saving ? <span className="animate-spin">⏳</span> : <Check size={15} />}
          {saving ? "Enregistrement..." : saveLabel}
        </button>
        <button
          onClick={onCancel}
          className="px-5 py-2.5 rounded-full border border-cream/15 text-mute hover:text-cream text-sm transition"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
