import { useState } from "react";
import { LogIn } from "lucide-react";
import AdminLayout from "../admin/AdminLayout";
import Dashboard from "../admin/Dashboard";
import MenuManager from "../admin/MenuManager";
import OrdersManager from "../admin/OrdersManager";
import Settings from "../admin/Settings";

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem("adminToken") || "");
  const [tokenInput, setTokenInput] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState("dashboard");

  const handleLogin = async () => {
    setError("");
    // Quick verify against admin endpoint
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || ""}/api/admin/business`,
        { headers: { "x-admin-token": tokenInput } },
      );
      if (res.status === 401) {
        setError("Code d'acces incorrect.");
        return;
      }
      localStorage.setItem("adminToken", tokenInput);
      setToken(tokenInput);
    } catch {
      setError("Impossible de verifier le code. Verifiez votre connexion.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setToken("");
    setTokenInput("");
  };

  // Login screen
  if (!token) {
    return (
      <div className="min-h-screen bg-char flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <span className="text-5xl">Car Emoji</span>
            <h1 className="font-display text-3xl font-bold text-cream mt-3">
              Chez Farahi
            </h1>
            <p className="text-mute/60 text-sm mt-1">Espace administration</p>
          </div>
          <div className="bg-char-soft rounded-2xl p-6 border border-cream/10">
            <label className="text-xs text-mute/60 uppercase tracking-wider mb-2 block">
              Code d'acces
            </label>
            <input
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="************"
              className="w-full bg-char rounded-xl px-4 py-3 text-cream placeholder:text-mute/30 focus:outline-none focus:ring-2 focus:ring-marigold/50 mb-3"
            />
            {error && <p className="text-chili text-xs mb-3">{error}</p>}
            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-2 bg-marigold hover:bg-marigold-light text-char font-semibold py-3 rounded-full transition active:scale-95"
            >
              <LogIn size={16} /> Se connecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render page content
  const pageContent = {
    dashboard: <Dashboard />,
    menu: <MenuManager token={token} />,
    orders: <OrdersManager />,
    settings: <Settings token={token} />,
  }[page] || <Dashboard />;

  return (
    <AdminLayout page={page} setPage={setPage} onLogout={handleLogout}>
      {pageContent}
    </AdminLayout>
  );
}

// import { useState, useEffect } from "react";
// import { Plus, Trash2, Save, LogIn, ShoppingBag } from "lucide-react";

// import { useNavigate } from "react-router-dom";

// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// export default function Admin() {
//   const [token, setToken] = useState(localStorage.getItem("adminToken") || "");
//   const [tokenInput, setTokenInput] = useState("");
//   const [data, setData] = useState(null);
//   const [status, setStatus] = useState("");
//   const [error, setError] = useState("");

//   const navigate = useNavigate();

//   useEffect(() => {
//     if (token) loadData(token);
//   }, [token]);

//   async function loadData(authToken) {
//     setError("");
//     try {
//       const res = await fetch(`${API_URL}/api/admin/business`, {
//         headers: { "x-admin-token": authToken },
//       });
//       if (res.status === 401) {
//         setError("Code d'accès incorrect.");
//         setToken("");
//         localStorage.removeItem("adminToken");
//         return;
//       }
//       const json = await res.json();
//       setData(json);
//     } catch (err) {
//       setError("Impossible de charger les données.");
//     }
//   }

//   function handleLogin() {
//     localStorage.setItem("adminToken", tokenInput);
//     setToken(tokenInput);
//   }

//   async function handleSave() {
//     setStatus("Enregistrement...");
//     try {
//       const res = await fetch(`${API_URL}/api/admin/business`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json", "x-admin-token": token },
//         body: JSON.stringify(data),
//       });
//       if (!res.ok) throw new Error();
//       setStatus("Enregistré ✓");
//       setTimeout(() => setStatus(""), 2000);
//     } catch {
//       setStatus("Erreur lors de l'enregistrement.");
//     }
//   }

//   // ---------- field update helpers ----------
//   const updateField = (path, value) => {
//     setData((prev) => {
//       const next = structuredClone(prev);
//       let obj = next;
//       for (let i = 0; i < path.length - 1; i++) obj = obj[path[i]];
//       obj[path[path.length - 1]] = value;
//       return next;
//     });
//   };

//   const addMenuItem = () => {
//     setData((prev) => ({
//       ...prev,
//       menu: [
//         ...prev.menu,
//         { id: `item-${Date.now()}`, category: "", name: "", desc: "", price: 0, veg: false },
//       ],
//     }));
//   };

//   const removeMenuItem = (idx) => {
//     setData((prev) => ({ ...prev, menu: prev.menu.filter((_, i) => i !== idx) }));
//   };

//   const addLocation = () => {
//     setData((prev) => ({ ...prev, locations: [...prev.locations, { name: "", days: "" }] }));
//   };

//   const removeLocation = (idx) => {
//     setData((prev) => ({ ...prev, locations: prev.locations.filter((_, i) => i !== idx) }));
//   };

//   const addRecommendation = () => {
//     setData((prev) => ({ ...prev, recommendations: [...prev.recommendations, ""] }));
//   };

//   const removeRecommendation = (idx) => {
//     setData((prev) => ({
//       ...prev,
//       recommendations: prev.recommendations.filter((_, i) => i !== idx),
//     }));
//   };

//   // ---------- login screen ----------
//   if (!token) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-char px-4">
//         <div className="bg-char-soft rounded-2xl p-8 w-full max-w-sm">
//           <h1 className="font-display text-2xl font-semibold text-cream mb-1">Espace Admin</h1>
//           <p className="text-mute/70 text-sm mb-6">Entrez le code d'accès pour gérer le camion.</p>
//           <input
//             type="password"
//             value={tokenInput}
//             onChange={(e) => setTokenInput(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && handleLogin()}
//             placeholder="Code d'accès"
//             className="w-full bg-char rounded-xl px-4 py-3 text-cream placeholder:text-mute/40 focus:outline-none focus:ring-2 focus:ring-marigold/50 mb-3"
//           />
//           {error && <p className="text-chili text-sm mb-3">{error}</p>}
//           <button
//             onClick={handleLogin}
//             className="w-full flex items-center justify-center gap-2 bg-marigold text-char font-semibold py-3 rounded-full hover:bg-marigold-light transition"
//           >
//             <LogIn size={16} /> Se connecter
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!data) {
//     return <div className="min-h-screen flex items-center justify-center text-mute">Chargement...</div>;
//   }

//   return (
//     <div className="min-h-screen bg-char text-cream px-4 py-8">
//       <div className="max-w-3xl mx-auto">
//         <div className="flex items-center justify-between mb-8">
//           <h1 className="font-display text-3xl font-bold">Gérer Le Camion Doré</h1>
//           <button
//             onClick={handleSave}
//             className="flex items-center gap-2 bg-chili hover:bg-chili-dark text-cream font-semibold px-5 py-2.5 rounded-full transition active:scale-95"
//           >
//             <Save size={16} /> {status || "Enregistrer"}
//           </button>

//           <button
//   onClick={() => navigate("/admin/orders")}
//   className="flex items-center gap-2 bg-char hover:bg-char-soft text-cream border border-cream/15 font-semibold px-5 py-2.5 rounded-full transition"
// >
//   <ShoppingBag size={16} /> Commandes
// </button>
//         </div>

//         {/* Business name */}
//         <Section title="Nom du commerce">
//           <input
//             value={data.businessName}
//             onChange={(e) => updateField(["businessName"], e.target.value)}
//             className="input"
//           />
//         </Section>

//         {/* Hours */}
//         <Section title="Horaires d'ouverture">
//           <div className="space-y-2">
//             {data.hours.map((h, idx) => (
//               <div key={idx} className="flex items-center gap-3">
//                 <span className="w-24 text-sm text-mute">{h.day}</span>
//                 <label className="flex items-center gap-1.5 text-xs text-mute">
//                   <input
//                     type="checkbox"
//                     checked={h.closed}
//                     onChange={(e) => updateField(["hours", idx, "closed"], e.target.checked)}
//                   />
//                   Fermé
//                 </label>
//                 {!h.closed && (
//                   <>
//                     <input
//                       type="time"
//                       value={h.open}
//                       onChange={(e) => updateField(["hours", idx, "open"], e.target.value)}
//                       className="input-sm"
//                     />
//                     <span className="text-mute/50">→</span>
//                     <input
//                       type="time"
//                       value={h.close}
//                       onChange={(e) => updateField(["hours", idx, "close"], e.target.value)}
//                       className="input-sm"
//                     />
//                   </>
//                 )}
//               </div>
//             ))}
//           </div>
//         </Section>

//         {/* Locations */}
//         <Section title="Emplacements" onAdd={addLocation}>
//           <div className="space-y-2">
//             {data.locations.map((loc, idx) => (
//               <div key={idx} className="flex items-center gap-2">
//                 <input
//                   value={loc.name}
//                   onChange={(e) => updateField(["locations", idx, "name"], e.target.value)}
//                   placeholder="Nom du lieu"
//                   className="input flex-1"
//                 />
//                 <input
//                   value={loc.days}
//                   onChange={(e) => updateField(["locations", idx, "days"], e.target.value)}
//                   placeholder="Jours"
//                   className="input w-32"
//                 />
//                 <button onClick={() => removeLocation(idx)} className="text-mute/50 hover:text-chili shrink-0">
//                   <Trash2 size={16} />
//                 </button>
//               </div>
//             ))}
//           </div>
//         </Section>

//         {/* Menu */}
//         <Section title="Menu" onAdd={addMenuItem}>
//           <div className="space-y-3">
//             {data.menu.map((item, idx) => (
//               <div key={item.id} className="bg-char rounded-lg p-3 space-y-2">
//                 <div className="flex gap-2">
//                   <input
//                     value={item.name}
//                     onChange={(e) => updateField(["menu", idx, "name"], e.target.value)}
//                     placeholder="Nom du plat"
//                     className="input flex-1"
//                   />
//                   <input
//                     value={item.category}
//                     onChange={(e) => updateField(["menu", idx, "category"], e.target.value)}
//                     placeholder="Catégorie"
//                     className="input w-32"
//                   />
//                   <button onClick={() => removeMenuItem(idx)} className="text-mute/50 hover:text-chili shrink-0">
//                     <Trash2 size={16} />
//                   </button>
//                 </div>
//                 <input
//                   value={item.desc}
//                   onChange={(e) => updateField(["menu", idx, "desc"], e.target.value)}
//                   placeholder="Description"
//                   className="input w-full"
//                 />
//                 <div className="flex items-center gap-3">
//                   <input
//                     type="number"
//                     step="0.5"
//                     value={item.price}
//                     onChange={(e) => updateField(["menu", idx, "price"], parseFloat(e.target.value) || 0)}
//                     placeholder="Prix"
//                     className="input-sm w-24"
//                   />
//                   <label className="flex items-center gap-1.5 text-xs text-mute">
//                     <input
//                       type="checkbox"
//                       checked={item.veg}
//                       onChange={(e) => updateField(["menu", idx, "veg"], e.target.checked)}
//                     />
//                     Végé
//                   </label>

//                   <input
//   type="number"
//   step="0.10"
//   min="0"
//   value={item.discount ?? 0}
//   onChange={(e) => updateField(["menu", idx, "discount"], parseFloat(e.target.value) || 0)}
//   placeholder="Remise (€)"
//   className="input-sm w-28"
// />
// <label className="text-[10px] text-mute">Remise / article (€)</label>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </Section>

//         {/* Recommendations */}
//         <Section title="Recommandations IA" onAdd={addRecommendation}>
//           <div className="space-y-2">
//             {data.recommendations.map((rec, idx) => (
//               <div key={idx} className="flex items-center gap-2">
//                 <input
//                   value={rec}
//                   onChange={(e) => updateField(["recommendations", idx], e.target.value)}
//                   className="input flex-1"
//                 />
//                 <button onClick={() => removeRecommendation(idx)} className="text-mute/50 hover:text-chili shrink-0">
//                   <Trash2 size={16} />
//                 </button>
//               </div>
//             ))}
//           </div>
//         </Section>

//         {/* Extra notes */}
//         <Section title="Notes supplémentaires (pour l'IA)">
//           <textarea
//             value={data.extraNotes || ""}
//             onChange={(e) => updateField(["extraNotes"], e.target.value)}
//             rows={3}
//             className="input w-full resize-none"
//           />
//         </Section>
//       </div>
//     </div>
//   );
// }

// function Section({ title, children, onAdd }) {
//   return (
//     <div className="mb-8">
//       <div className="flex items-center justify-between mb-3">
//         <h2 className="font-display text-lg font-semibold text-marigold">{title}</h2>
//         {onAdd && (
//           <button onClick={onAdd} className="flex items-center gap-1 text-xs text-mute hover:text-cream">
//             <Plus size={14} /> Ajouter
//           </button>
//         )}
//       </div>
//       {children}
//     </div>
//   );
// }
