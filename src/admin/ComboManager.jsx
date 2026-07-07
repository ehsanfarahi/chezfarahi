import { useState, useEffect, useRef } from "react";
import {
  Plus, Trash2, Pencil, X, Check,
  Image, Link, GlassWater, ShoppingBag,
} from "lucide-react";

import { compressImage, uploadToCloudinary } from "../utils/imageUtils";

const API_URL = import.meta.env.VITE_API_URL || "";

const EMPTY_BEVERAGE = { name: "", originalPrice: 2.0, comboPrice: 1.5 };

const EMPTY_COMBO = {
  id: "",
  name: "",
  image: "",
  tag: "",
  emoji: "🎉",
  rating: 5.0,
  reviews: 0,
  items: [],       // { menuItemId, name, originalPrice, comboPrice }
  beverages: [{ ...EMPTY_BEVERAGE }],
};

function Label({ children }) {
  return <p className="text-[11px] text-mute/60 uppercase tracking-wider mb-1.5">{children}</p>;
}

export default function ComboManager({ token }) {
  const [combos, setCombos] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [adding, setAdding] = useState(false);
  const [newCombo, setNewCombo] = useState({ ...EMPTY_COMBO, items: [], beverages: [{ ...EMPTY_BEVERAGE }] });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [uploading, setUploading] = useState(false);


     useEffect(() => {
       loadData();
     }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [bizRes, combosRes] = await Promise.all([
        fetch(`${API_URL}/api/business`),
        fetch(`${API_URL}/api/combos`),
      ]);
      const biz = await bizRes.json();
      const combosData = await combosRes.json();
      setMenuItems(biz.menu || []);
      setCombos(Array.isArray(combosData) ? combosData : []);
    } catch {
      setSaveMsg("Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }


  async function saveCombos(updated) {
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch(`${API_URL}/api/combos`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error();
      setCombos(updated);
      setSaveMsg("Enregistré ✓");
      setTimeout(() => setSaveMsg(""), 2500);
    } catch {
      setSaveMsg("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  }

  const addCombo = async () => {
    if (!newCombo.name.trim()) return;
    const combo = { ...newCombo, id: `combo-${Date.now()}` };
    await saveCombos([...combos, combo]);
    setNewCombo({ ...EMPTY_COMBO, items: [], beverages: [{ ...EMPTY_BEVERAGE }] });
    setAdding(false);
  };

  const startEdit = (combo) => {
    setEditingId(combo.id);
    setEditDraft(JSON.parse(JSON.stringify(combo)));
  };

  const saveEdit = async () => {
    await saveCombos(combos.map((c) => (c.id === editingId ? editDraft : c)));
    setEditingId(null);
    setEditDraft(null);
  };

  const deleteCombo = async (id) => {
    if (!window.confirm("Supprimer ce combo ?")) return;
    await saveCombos(combos.filter((c) => c.id !== id));
  };

  const calcTotals = (combo) => {
    const items = combo.items || [];
    const bevs = combo.beverages || [];
    const original = items.reduce((s, i) => s + (i.originalPrice || 0), 0)
      + bevs.reduce((s, b) => s + (b.originalPrice || 0), 0);
    const discounted = items.reduce((s, i) => s + (i.comboPrice || 0), 0)
      + bevs.reduce((s, b) => s + (b.comboPrice || 0), 0);
    return { original: original.toFixed(2), discounted: discounted.toFixed(2), savings: (original - discounted).toFixed(2) };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-4xl animate-bounce">🥟</span>
      </div>
    );
  }

  return (
    <div className="text-cream max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-marigold text-xs font-semibold uppercase tracking-widest mb-1">
            Admin
          </p>
          <h1 className="font-display text-3xl font-bold">Combos</h1>
        </div>
        <div className="flex items-center gap-3">
          {saveMsg && (
            <span
              className={`text-xs font-medium ${saveMsg.includes("Erreur") ? "text-chili" : "text-herb"}`}
            >
              {saveMsg}
            </span>
          )}
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 bg-marigold hover:bg-marigold-light text-char font-semibold px-4 py-2.5 rounded-full transition active:scale-95"
          >
            <Plus size={16} /> Créer un combo
          </button>
        </div>
      </div>

      {/* Add form */}
      {adding && (
        <div className="bg-char-soft border border-marigold/30 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-marigold">
              Nouveau combo
            </h3>
            <button onClick={() => setAdding(false)}>
              <X size={18} className="text-mute/50" />
            </button>
          </div>
          <ComboForm
            combo={newCombo}
            setCombo={setNewCombo}
            menuItems={menuItems}
            onSave={addCombo}
            onCancel={() => setAdding(false)}
            saveLabel="Créer le combo"
            saving={saving}
            token={token}
            setUploading={setUploading}
          />
        </div>
      )}

      {/* Combos list */}
      <div className="space-y-4">
        {combos.map((combo) => {
          const totals = calcTotals(combo);
          return (
            <div
              key={combo.id}
              className="bg-char-soft rounded-2xl border border-cream/5 overflow-hidden"
            >
              {editingId === combo.id ? (
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-semibold text-marigold">
                      Modifier le combo
                    </h3>
                    <button onClick={() => setEditingId(null)}>
                      <X size={18} className="text-mute/50" />
                    </button>
                  </div>
                  <ComboForm
                    combo={editDraft}
                    setCombo={setEditDraft}
                    menuItems={menuItems}
                    onSave={saveEdit}
                    onCancel={() => setEditingId(null)}
                    saveLabel="Enregistrer"
                    saving={saving}
                    token={token}
                    setUploading={setUploading}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-4 px-4 py-4">
                  {/* Image */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-char flex items-center justify-center shrink-0">
                    {combo.image ? (
                      <img
                        src={combo.image}
                        alt={combo.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">{combo.emoji || "🎉"}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-cream text-sm truncate">
                        {combo.name}
                      </h3>
                      {combo.tag && (
                        <span className="text-[10px] bg-marigold/20 text-marigold px-1.5 py-0.5 rounded-full shrink-0">
                          {combo.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-mute/60 truncate">
                      {[
                        ...(combo.items || []),
                        ...(combo.beverages || []).map((b) => ({
                          name: b.name,
                        })),
                      ]
                        .map((i) => i.name)
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="font-mono text-xs font-semibold text-marigold">
                        {totals.discounted}€
                      </span>
                      <span className="font-mono text-[10px] text-mute/40 line-through">
                        {totals.original}€
                      </span>
                      {parseFloat(totals.savings) > 0 && (
                        <span className="text-[10px] bg-herb/20 text-herb px-1.5 py-0.5 rounded-full">
                          -{totals.savings}€ économisés
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => startEdit(combo)}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-cream/10 text-mute/60 hover:text-cream transition"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => deleteCombo(combo.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-chili/10 text-mute/60 hover:text-chili transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {combos.length === 0 && !adding && (
        <div className="text-center py-16 text-mute/40">
          <p className="text-4xl mb-3">🎁</p>
          <p className="text-sm">Aucun combo créé pour l'instant.</p>
          <p className="text-xs mt-1">
            Créez votre premier combo en cliquant sur "Créer un combo".
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Combo Form ───────────────────────────────────────────────────────────────
function ComboForm({
  combo,
  setCombo,
  menuItems,
  onSave,
  onCancel,
  saveLabel,
  saving,
  token,
  setUploading,
}) {
  const fileRef = useRef(null);
  const [imageTab, setImageTab] = useState("url");

  const set = (field) => (e) =>
    setCombo((prev) => ({ ...prev, [field]: e.target.value }));

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressed = await compressImage(file, 900, 0.85);
      const url = await uploadToCloudinary(
        compressed,
        token,
        "chezfarahi/combos",
      );
      setCombo((prev) => ({ ...prev, image: url }));
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
  //       const MAX = 500;
  //       const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
  //       canvas.width = img.width * ratio;
  //       canvas.height = img.height * ratio;
  //       canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
  //       setCombo((prev) => ({ ...prev, image: canvas.toDataURL("image/jpeg", 0.80) }));
  //     };
  //     img.src = ev.target.result;
  //   };
  //   reader.readAsDataURL(file);
  // };

  // Menu item selection
  const addMenuItem = () => {
    const firstItem = menuItems[0];
    if (!firstItem) return;
    setCombo((prev) => ({
      ...prev,
      items: [
        ...(prev.items || []),
        {
          menuItemId: firstItem.id,
          name: firstItem.name,
          originalPrice: firstItem.price,
          comboPrice: parseFloat(
            (firstItem.price - (firstItem.discount || 0)).toFixed(2),
          ),
        },
      ],
    }));
  };

  const updateMenuItem = (idx, field, value) => {
    setCombo((prev) => {
      const items = [...prev.items];
      if (field === "menuItemId") {
        const found = menuItems.find((m) => m.id === value);
        items[idx] = {
          menuItemId: value,
          name: found?.name || "",
          originalPrice: found?.price || 0,
          comboPrice: parseFloat(
            ((found?.price || 0) - (found?.discount || 0)).toFixed(2),
          ),
        };
      } else {
        items[idx] = { ...items[idx], [field]: parseFloat(value) || 0 };
      }
      return { ...prev, items };
    });
  };

  const removeMenuItem = (idx) =>
    setCombo((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));

  // Beverage management
  const addBeverage = () =>
    setCombo((prev) => ({
      ...prev,
      beverages: [...(prev.beverages || []), { ...EMPTY_BEVERAGE }],
    }));

  const updateBeverage = (idx, field, value) => {
    setCombo((prev) => {
      const beverages = [...(prev.beverages || [])];
      beverages[idx] = {
        ...beverages[idx],
        [field]: field === "name" ? value : parseFloat(value) || 0,
      };
      return { ...prev, beverages };
    });
  };

  const removeBeverage = (idx) =>
    setCombo((prev) => ({
      ...prev,
      beverages: prev.beverages.filter((_, i) => i !== idx),
    }));

  // Totals
  const totalOriginal = [
    ...(combo.items || []).map((i) => i.originalPrice || 0),
    ...(combo.beverages || []).map((b) => b.originalPrice || 0),
  ].reduce((s, v) => s + v, 0);

  const totalCombo = [
    ...(combo.items || []).map((i) => i.comboPrice || 0),
    ...(combo.beverages || []).map((b) => b.comboPrice || 0),
  ].reduce((s, v) => s + v, 0);

  return (
    <div className="space-y-6">
      {/* Basic info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label>Nom du combo</Label>
          <input
            value={combo.name}
            onChange={set("name")}
            placeholder="Ex: Combo Poulet Royal"
            className="admin-input w-full"
          />
        </div>
        <div>
          <Label>Tag / badge</Label>
          <input
            value={combo.tag || ""}
            onChange={set("tag")}
            placeholder="Best-seller, Nouveau..."
            className="admin-input w-full"
          />
        </div>
        <div>
          <Label>Emoji (si pas d'image)</Label>
          <input
            value={combo.emoji || "🎉"}
            onChange={set("emoji")}
            placeholder="🎉"
            className="admin-input w-full"
          />
        </div>
      </div>

      {/* Image */}
      <div>
        <Label>Image du combo</Label>
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
              {tab === "url" ? (
                <>
                  <Link size={11} /> URL
                </>
              ) : (
                <>
                  <Image size={11} /> Fichier
                </>
              )}
            </button>
          ))}
        </div>
        {imageTab === "url" ? (
          <input
            value={combo.image?.startsWith("data:") ? "" : combo.image || ""}
            onChange={set("image")}
            placeholder="https://example.com/combo.jpg"
            className="admin-input w-full"
          />
        ) : (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-cream/15 hover:border-marigold/40 rounded-xl py-4 text-sm text-mute/60 hover:text-mute transition flex items-center justify-center gap-2"
            >
              <Image size={16} />
              {combo.image?.startsWith("data:")
                ? "Image chargée ✓"
                : "Cliquez pour choisir une image"}
            </button>
          </>
        )}
        {combo.image && (
          <div className="mt-2 flex items-center gap-2">
            <img
              src={combo.image}
              alt="preview"
              className="w-16 h-16 rounded-xl object-cover border border-cream/10"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <button
              onClick={() => setCombo((p) => ({ ...p, image: "" }))}
              className="text-xs text-chili hover:underline"
            >
              Supprimer
            </button>
          </div>
        )}
      </div>

      {/* Menu items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Plats du menu</Label>
          <button
            onClick={addMenuItem}
            className="flex items-center gap-1 text-xs text-marigold hover:text-marigold-light transition"
          >
            <Plus size={12} /> Ajouter un plat
          </button>
        </div>

        {(combo.items || []).length === 0 && (
          <p className="text-xs text-mute/40 italic mb-2">
            Aucun plat ajouté. Cliquez sur "Ajouter un plat".
          </p>
        )}

        <div className="space-y-3">
          {(combo.items || []).map((item, idx) => (
            <div key={idx} className="bg-char rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag size={13} className="text-marigold shrink-0" />
                <select
                  value={item.menuItemId}
                  onChange={(e) =>
                    updateMenuItem(idx, "menuItemId", e.target.value)
                  }
                  className="admin-input flex-1 text-xs"
                >
                  {menuItems.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — {m.price?.toFixed(2)}€
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => removeMenuItem(idx)}
                  className="text-mute/40 hover:text-chili shrink-0"
                >
                  <X size={15} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] text-mute/50 mb-1">
                    Prix original (auto)
                  </p>
                  <div className="admin-input text-xs text-mute/60 font-mono">
                    {item.originalPrice?.toFixed(2)}€
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-mute/50 mb-1">
                    Prix dans le combo (€)
                  </p>
                  <input
                    type="number"
                    step="0.10"
                    min="0"
                    value={item.comboPrice}
                    onChange={(e) =>
                      updateMenuItem(idx, "comboPrice", e.target.value)
                    }
                    className="admin-input w-full text-xs"
                  />
                </div>
              </div>
              {item.comboPrice < item.originalPrice && (
                <p className="text-[10px] text-herb mt-1.5">
                  Remise: -{(item.originalPrice - item.comboPrice).toFixed(2)}€
                  sur cet article
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Beverages */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Boissons</Label>
          <button
            onClick={addBeverage}
            className="flex items-center gap-1 text-xs text-marigold hover:text-marigold-light transition"
          >
            <Plus size={12} /> Ajouter une boisson
          </button>
        </div>

        <div className="space-y-3">
          {(combo.beverages || []).map((bev, idx) => (
            <div key={idx} className="bg-char rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <GlassWater size={13} className="text-marigold shrink-0" />
                <input
                  value={bev.name}
                  onChange={(e) => updateBeverage(idx, "name", e.target.value)}
                  placeholder="Ex: Coca-Cola, Eau, Jus d'orange..."
                  className="admin-input flex-1 text-xs"
                />
                <button
                  onClick={() => removeBeverage(idx)}
                  className="text-mute/40 hover:text-chili shrink-0"
                >
                  <X size={15} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] text-mute/50 mb-1">
                    Prix original (€)
                  </p>
                  <input
                    type="number"
                    step="0.10"
                    min="0"
                    value={bev.originalPrice}
                    onChange={(e) =>
                      updateBeverage(idx, "originalPrice", e.target.value)
                    }
                    className="admin-input w-full text-xs"
                  />
                </div>
                <div>
                  <p className="text-[10px] text-mute/50 mb-1">
                    Prix dans le combo (€)
                  </p>
                  <input
                    type="number"
                    step="0.10"
                    min="0"
                    value={bev.comboPrice}
                    onChange={(e) =>
                      updateBeverage(idx, "comboPrice", e.target.value)
                    }
                    className="admin-input w-full text-xs"
                  />
                </div>
              </div>
              {bev.comboPrice < bev.originalPrice && (
                <p className="text-[10px] text-herb mt-1.5">
                  Remise: -{(bev.originalPrice - bev.comboPrice).toFixed(2)}€
                  sur cette boisson
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Totals preview */}
      {(combo.items?.length > 0 || combo.beverages?.length > 0) && (
        <div className="bg-char rounded-2xl p-4 border border-marigold/20">
          <p className="text-xs font-semibold text-marigold mb-2">
            Aperçu des prix
          </p>
          <div className="space-y-1.5">
            {[
              ...(combo.items || []),
              ...(combo.beverages || []).map((b) => ({
                name: b.name || "Boisson",
                originalPrice: b.originalPrice,
                comboPrice: b.comboPrice,
              })),
            ].map((item, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-mute/70">{item.name || "—"}</span>
                <span className="font-mono">
                  <span className="text-marigold">
                    {(item.comboPrice || 0).toFixed(2)}€
                  </span>
                  <span className="text-mute/30 line-through ml-1.5">
                    {(item.originalPrice || 0).toFixed(2)}€
                  </span>
                </span>
              </div>
            ))}
            <div className="pt-2 border-t border-cream/10 flex justify-between">
              <span className="text-sm font-semibold text-cream">
                Total combo
              </span>
              <span className="font-mono font-bold text-marigold">
                {totalCombo.toFixed(2)}€
                <span className="text-mute/30 line-through ml-1.5 font-normal text-xs">
                  {totalOriginal.toFixed(2)}€
                </span>
              </span>
            </div>
            {totalOriginal > totalCombo && (
              <p className="text-[11px] text-herb text-right">
                Économie totale: {(totalOriginal - totalCombo).toFixed(2)}€
              </p>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1 border-t border-cream/5">
        <button
          onClick={onSave}
          disabled={saving || !combo.name.trim()}
          className="flex items-center gap-2 bg-chili hover:bg-chili-dark text-cream font-semibold px-5 py-2.5 rounded-full transition disabled:opacity-50"
        >
          {saving ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <Check size={15} />
          )}
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
