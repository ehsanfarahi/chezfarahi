import { useState, useEffect } from "react";
import { X, Check, Minus, Plus, Star } from "lucide-react";

// const fontLink = document.getElementById("caveat-font");
// if(!fontLink) {
//    const link = document.createElement("link");
//       link.id = "caveat-font";
//       link.rel = "stylesheet";
//       link.href = "https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&display=swap";
//       document.head.appendChild(link);
// }

export default function MenuDuJourBlackboard({ menu, open, onClose, onAdd }) {
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  // Load Caveat font safely inside useEffect (after DOM is ready)
  useEffect(() => {
    if (!document.getElementById("caveat-font")) {
      const link = document.createElement("link");
      link.id = "caveat-font";
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  // Reset qty when modal opens
  useEffect(() => {
    if (open) setQty(1);
  }, [open]);

  if (!open || !menu) return null;

  const opts        = menu.displayOptions || {};
  const savings     = ((menu.totalOriginal || 0) - menu.menuPrice).toFixed(2);
  const savingsPct  = menu.totalOriginal > 0
    ? Math.round((1 - menu.menuPrice / menu.totalOriginal) * 100)
    : 0;
  const total = (menu.menuPrice * qty).toFixed(2);

  const allItems = [
    ...(menu.items || []),
    ...(menu.extraItems || []).map((e) => ({ name: e.name, originalPrice: e.price })),
    ...(menu.beverage?.included
      ? [{ name: menu.beverage.name || "Boisson au choix", originalPrice: menu.beverage.price }]
      : []),
  ];

  const handleAdd = () => {
    onAdd({
      id:            `mdj-${menu.dateFrom || Date.now()}`,
      name:          `${menu.title || "Plat du Jour"}${menu.subtitle ? ` · ${menu.subtitle}` : ""}`,
      price:         menu.menuPrice,
      qty,
      desc:          allItems.map((i) => i.name).join(", "),
      isMenuDuJour:  true,
    });
    setJustAdded(true);
    setTimeout(() => { setJustAdded(false); onClose(); }, 1200);
  };

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <>
      {/* Backdrop */}
      <div
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)", zIndex: 50 }}
        onClick={onClose}
      />

      {/* Blackboard modal */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 51,
      }}>
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "relative",
            width: "100%", maxWidth: 460,
            maxHeight: "92vh", overflowY: "auto",
            borderRadius: "1.25rem 1.25rem 0 0",
            background: "#1c2b1e",
            boxShadow: "0 0 0 3px #2a3d2c, 0 0 0 6px #1c2b1e, 0 0 0 9px #354a37, 0 25px 60px rgba(0,0,0,0.8)",
          }}
        >
          {/* Grain texture */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
            opacity: 0.05, borderRadius: "inherit",
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "150px",
          }} />

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 4, right: 4, zIndex: 10,
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(255,255,255,0.08)", border: "none",
              color: "#d4c9b0", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={16} />
          </button>

          {/* Content */}
          <div style={{ position: "relative", zIndex: 1, padding: "2rem 1.75rem 1.5rem" }}>
            <div style={{
              border: "1.5px solid rgba(212,201,176,0.2)",
              borderRadius: 8, padding: "1.5rem 1.25rem 1.25rem",
              position: "relative",
            }}>
              {/* Corner decorations */}
              {[
                { top: 6, left: 6, borderTop: true, borderLeft: true },
                { top: 6, right: 6, borderTop: true, borderRight: true },
                { bottom: 6, left: 6, borderBottom: true, borderLeft: true },
                { bottom: 6, right: 6, borderBottom: true, borderRight: true },
              ].map((c, i) => (
                <div key={i} style={{
                  position: "absolute",
                  top: c.top, bottom: c.bottom,
                  left: c.left, right: c.right,
                  width: 12, height: 12,
                  borderTop:    c.borderTop    ? "2px solid rgba(212,201,176,0.35)" : "none",
                  borderBottom: c.borderBottom ? "2px solid rgba(212,201,176,0.35)" : "none",
                  borderLeft:   c.borderLeft   ? "2px solid rgba(212,201,176,0.35)" : "none",
                  borderRight:  c.borderRight  ? "2px solid rgba(212,201,176,0.35)" : "none",
                }} />
              ))}

              {/* Image (if enabled) */}
              {opts.showImage !== false && menu.image && (
                <div style={{ textAlign: "center", marginBottom: 12 }}>
                  <img
                    src={menu.image}
                    alt={menu.title}
                    style={{
                      width: 72, height: 72, borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid rgba(212,201,176,0.25)",
                      filter: "sepia(15%) brightness(0.88)",
                    }}
                  />
                </div>
              )}

              {/* Date */}
              <p style={{
                fontFamily: "Caveat, cursive", fontSize: "1.3rem",
                color: "rgba(212,201,176,0.5)", textAlign: "center",
                letterSpacing: "0.05em", marginBottom: 4,
              }}>
                {today}
              </p>

              {/* Stars */}
              <p style={{ textAlign: "center", color: "rgba(212,201,176,0.25)", fontSize: "0.65rem", letterSpacing: "0.5em", marginBottom: 6 }}>
                ✦ ✦ ✦
              </p>

              {/* Title */}
              <h2 style={{
                fontFamily: "Caveat, cursive",
                fontSize: "clamp(2rem, 7vw, 2.8rem)",
                fontWeight: 700,
                color: "#f0ebe0",
                textAlign: "center",
                lineHeight: 1,
                marginBottom: 4,
                textShadow: "0 0 20px rgba(240,235,224,0.12), 1px 1px 0 rgba(0,0,0,0.5)",
              }}>
                {menu.title || "Plat du Jour"}
              </h2>

              {menu.subtitle && (
                <p style={{
                  fontFamily: "Caveat, cursive", fontSize: "1.25rem",
                  color: "rgba(212,201,176,0.6)", textAlign: "center",
                  fontStyle: "italic", marginBottom: 4,
                }}>
                  — {menu.subtitle} —
                </p>
              )}

              {menu.description && (
                <p style={{
                  fontFamily: "Caveat, cursive", fontSize: "1.2rem",
                  color: "rgba(212,201,176,0.38)", textAlign: "center",
                  fontStyle: "italic", marginTop: 4,
                }}>
                  "{menu.description}"
                </p>
              )}

              {/* Chalk divider */}
              <Divider />

              {/* Items */}
              <div>
                {allItems.map((item, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "0.45rem 0",
                    borderBottom: i < allItems.length - 1
                      ? "1px dashed rgba(212,201,176,0.1)" : "none",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "rgba(212,201,176,0.3)", fontSize: "0.65rem" }}>✦</span>
                      <span style={{
                        fontFamily: "Caveat, cursive", fontSize: "1.2rem", color: "#e8e0d0",
                      }}>
                        {item.name}
                      </span>
                    </div>
                    {/* Individual price — controlled by displayOptions */}
                    {opts.showItemPrices !== false && item.originalPrice > 0 && (
                      <span style={{
                        fontFamily: "Caveat, cursive", fontSize: "0.95rem",
                        color: "rgba(212,201,176,0.3)",
                        textDecoration: "line-through", marginLeft: 12,
                      }}>
                        {Number(item.originalPrice).toFixed(2)}€
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <Divider />

              {/* Promo tag — controlled by displayOptions */}
              {opts.showPromoTags !== false && savingsPct > 0 && (
                <div style={{ textAlign: "center", marginBottom: 10 }}>
                  <span style={{
                    fontFamily: "Caveat, cursive", fontSize: "0.95rem",
                    color: "rgba(180,220,180,0.65)",
                    border: "1px solid rgba(180,220,180,0.2)",
                    borderRadius: 999, padding: "0.2rem 1rem",
                    display: "inline-flex", alignItems: "center", gap: 6,
                  }}>
                    <Star size={11} style={{ fill: "rgba(180,220,180,0.4)" }} />
                    Économie de {savings}€ · -{savingsPct}%
                  </span>
                </div>
              )}

              {/* Total original price (crossed) */}
              {opts.showPromoTags !== false && menu.totalOriginal > menu.menuPrice && (
                <p style={{
                  fontFamily: "Caveat, cursive", fontSize: "1rem",
                  color: "rgba(212,201,176,0.28)", textAlign: "center",
                  textDecoration: "line-through", marginBottom: 2,
                }}>
                  {Number(menu.totalOriginal).toFixed(2)}€
                </p>
              )}

              {/* BIG menu price — always visible */}
              <p style={{
                fontFamily: "Caveat, cursive",
                fontSize: "clamp(2.8rem, 10vw, 3.8rem)",
                fontWeight: 700,
                color: "#f0ebe0",
                textAlign: "center",
                lineHeight: 1,
                textShadow: "0 0 30px rgba(240,235,224,0.18), 1px 1px 0 rgba(0,0,0,0.5)",
              }}>
                {Number(menu.menuPrice).toFixed(2)}€
              </p>
              <p style={{
                fontFamily: "Caveat, cursive", fontSize: "1.2rem",
                color: "rgba(212,201,176,0.3)", textAlign: "center", marginTop: 2,
              }}>
                le menu complet
              </p>

              {menu.validUntil && (
                <p style={{
                  fontFamily: "Caveat, cursive", fontSize: "1.2rem",
                  color: "rgba(212,201,176,0.3)", textAlign: "center", marginTop: 8,
                }}>
                  ◌ Valable jusqu'à {menu.validUntil}
                </p>
              )}
            </div>

            {/* Qty + Add */}
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* Stepper */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(212,201,176,0.15)",
                  borderRadius: 999, padding: "0.45rem 0.75rem",
                }}>
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))}
                    style={{ background: "none", border: "none", color: "#d4c9b0", cursor: "pointer", display: "flex" }}>
                    <Minus size={14} />
                  </button>
                  <span style={{
                    fontFamily: "Caveat, cursive", fontSize: "1.2rem",
                    color: "#f0ebe0", width: 20, textAlign: "center",
                  }}>
                    {qty}
                  </span>
                  <button onClick={() => setQty((q) => q + 1)}
                    style={{
                      background: "rgba(212,201,176,0.85)", border: "none",
                      color: "#1c2b1e", cursor: "pointer", borderRadius: "50%",
                      width: 26, height: 26,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                    <Plus size={14} />
                  </button>
                </div>

                {/* Add button */}
                <button
                  onClick={handleAdd}
                  style={{
                    flex: 1,
                    background: justAdded ? "rgba(92,122,94,0.4)" : "rgba(212,201,176,0.1)",
                    border: justAdded ? "1px solid rgba(92,122,94,0.5)" : "1px solid rgba(212,201,176,0.25)",
                    color: "#f0ebe0", borderRadius: 999,
                    padding: "0.7rem 1rem",
                    fontFamily: "Caveat, cursive", fontSize: "1.1rem", fontWeight: 600,
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    transition: "all 0.2s",
                  }}
                >
                  {justAdded ? <><Check size={16} /> Ajouté !</> : <>Commander — {total}€</>}
                </button>
              </div>

              <p style={{
                fontFamily: "Caveat, cursive", fontSize: "1.1rem",
                color: "rgba(212,201,176,0.22)", textAlign: "center", marginTop: 8,
              }}>
                Plat du jour · Non modifiable
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Divider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "0.75rem 0" }}>
      <div style={{ flex: 1, height: 1, background: "rgba(212,201,176,0.12)" }} />
      <span style={{ color: "rgba(212,201,176,0.22)", fontSize: "0.55rem", letterSpacing: "0.4em" }}>✦ ✦ ✦</span>
      <div style={{ flex: 1, height: 1, background: "rgba(212,201,176,0.12)" }} />
    </div>
  );
}







// import { useState } from "react";
// import { X, Check, Minus, Plus, Star } from "lucide-react";

// // Load Caveat font for chalk-writing feel
// const fontLink = document.getElementById("caveat-font");
// if (!fontLink) {
//   const link = document.createElement("link");
//   link.id = "caveat-font";
//   link.rel = "stylesheet";
//   link.href = "https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&display=swap";
//   document.head.appendChild(link);
// }

// export default function MenuDuJourBlackboard({ menu, open, onClose, onAdd }) {
//   const [qty, setQty] = useState(1);
//   const [justAdded, setJustAdded] = useState(false);

//   if (!open || !menu) return null;

//   const opts = menu.displayOptions || {};
//   const savings = (menu.totalOriginal - menu.menuPrice).toFixed(2);
//   const savingsPct = menu.totalOriginal > 0
//     ? Math.round((1 - menu.menuPrice / menu.totalOriginal) * 100)
//     : 0;
//   const total = (menu.menuPrice * qty).toFixed(2);

//   const allItems = [
//     ...(menu.items || []),
//     ...(menu.extraItems || []).map((e) => ({ name: e.name, originalPrice: e.price })),
//     ...(menu.beverage?.included
//       ? [{ name: menu.beverage.name || "Boisson au choix", originalPrice: menu.beverage.price }]
//       : []),
//   ];

//   const handleAdd = () => {
//     onAdd({
//       id: `mdj-${menu.dateFrom || Date.now()}`,
//       name: `${menu.title || "Menu du Jour"}${menu.subtitle ? ` · ${menu.subtitle}` : ""}`,
//       price: menu.menuPrice,
//       qty,
//       desc: allItems.map((i) => i.name).join(", "),
//       isMenuDuJour: true,
//     });
//     setJustAdded(true);
//     setTimeout(() => { setJustAdded(false); onClose(); }, 1200);
//   };

//   const today = new Date().toLocaleDateString("fr-FR", {
//     weekday: "long", day: "numeric", month: "long",
//   });

//   return (
//     <>
//       {/* Backdrop */}
//       <div
//         className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm"
//         onClick={onClose}
//       />

//       {/* Blackboard modal */}
//       <div className="fixed bottom-0 left-0 right-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-50">
//         <div
//           className="relative w-full sm:w-[460px] sm:max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl"
//           style={{
//             background: "#1c2b1e",
//             boxShadow: "0 0 0 3px #2a3d2c, 0 0 0 6px #1c2b1e, 0 0 0 9px #354a37, 0 25px 60px rgba(0,0,0,0.8)",
//           }}
//           onClick={(e) => e.stopPropagation()}
//         >
//           {/* Grain texture overlay */}
//           <div
//             style={{
//               position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
//               opacity: 0.06, borderRadius: "inherit",
//               backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
//               backgroundSize: "150px",
//             }}
//           />

//           {/* Close */}
//           <button
//             onClick={onClose}
//             className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition"
//             style={{ background: "rgba(255,255,255,0.08)", color: "#d4c9b0" }}
//           >
//             <X size={16} />
//           </button>

//           <div style={{ position: "relative", zIndex: 1, padding: "2rem 1.75rem 1.5rem" }}>

//             {/* Decorative top frame line */}
//             <div style={{
//               border: "1.5px solid rgba(212,201,176,0.2)",
//               borderRadius: 8, padding: "1.5rem 1.25rem 1.25rem",
//               position: "relative",
//             }}>
//               {/* Corner decorations */}
//               {["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"].map((pos) => (
//                 <div
//                   key={pos}
//                   className={`absolute ${pos} w-3 h-3`}
//                   style={{
//                     borderTop: pos.includes("top") ? "2px solid rgba(212,201,176,0.4)" : "none",
//                     borderBottom: pos.includes("bottom") ? "2px solid rgba(212,201,176,0.4)" : "none",
//                     borderLeft: pos.includes("left") ? "2px solid rgba(212,201,176,0.4)" : "none",
//                     borderRight: pos.includes("right") ? "2px solid rgba(212,201,176,0.4)" : "none",
//                   }}
//                 />
//               ))}

//               {/* Image (if enabled and exists) */}
//               {opts.showImage !== false && menu.image && (
//                 <div className="flex justify-center mb-3">
//                   <img
//                     src={menu.image}
//                     alt={menu.title}
//                     style={{
//                       width: 72, height: 72, borderRadius: "50%",
//                       objectFit: "cover",
//                       border: "2px solid rgba(212,201,176,0.3)",
//                       filter: "sepia(20%) brightness(0.9)",
//                     }}
//                   />
//                 </div>
//               )}

//               {/* Date */}
//               <p style={{
//                 fontFamily: "Caveat, cursive", fontSize: "0.95rem",
//                 color: "rgba(212,201,176,0.55)", textAlign: "center",
//                 letterSpacing: "0.05em", marginBottom: "0.25rem",
//                 textShadow: "0 0 8px rgba(212,201,176,0.1)",
//               }}>
//                 {today}
//               </p>

//               {/* Stars decoration */}
//               <div style={{ textAlign: "center", marginBottom: "0.4rem" }}>
//                 <span style={{ color: "rgba(212,201,176,0.3)", fontSize: "0.7rem", letterSpacing: "0.4em" }}>
//                   ✦ ✦ ✦
//                 </span>
//               </div>

//               {/* Main title */}
//               <h2 style={{
//                 fontFamily: "Caveat, cursive",
//                 fontSize: "clamp(2.2rem, 7vw, 3rem)",
//                 fontWeight: 700,
//                 color: "#f0ebe0",
//                 textAlign: "center",
//                 lineHeight: 1,
//                 marginBottom: "0.15rem",
//                 textShadow: "0 0 20px rgba(240,235,224,0.15), 1px 1px 0 rgba(0,0,0,0.5)",
//                 letterSpacing: "0.01em",
//               }}>
//                 {menu.title || "Menu du Jour"}
//               </h2>

//               {menu.subtitle && (
//                 <p style={{
//                   fontFamily: "Caveat, cursive", fontSize: "1.2rem",
//                   color: "rgba(212,201,176,0.65)", textAlign: "center",
//                   fontStyle: "italic", marginBottom: "0.25rem",
//                   textShadow: "0 0 10px rgba(212,201,176,0.1)",
//                 }}>
//                   — {menu.subtitle} —
//                 </p>
//               )}

//               {/* Description */}
//               {menu.description && (
//                 <p style={{
//                   fontFamily: "Caveat, cursive", fontSize: "0.95rem",
//                   color: "rgba(212,201,176,0.4)", textAlign: "center",
//                   fontStyle: "italic", marginTop: "0.25rem",
//                 }}>
//                   "{menu.description}"
//                 </p>
//               )}

//               {/* Chalk divider */}
//               <ChalkDivider />

//               {/* Items */}
//               <div style={{ marginBottom: "0.5rem" }}>
//                 {allItems.map((item, i) => (
//                   <div
//                     key={i}
//                     style={{
//                       display: "flex", alignItems: "center",
//                       justifyContent: "space-between",
//                       padding: "0.45rem 0",
//                       borderBottom: i < allItems.length - 1 ? "1px dashed rgba(212,201,176,0.1)" : "none",
//                     }}
//                   >
//                     <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
//                       <span style={{ color: "rgba(212,201,176,0.35)", fontSize: "0.7rem" }}>✦</span>
//                       <span style={{
//                         fontFamily: "Caveat, cursive", fontSize: "1.15rem",
//                         color: "#e8e0d0",
//                         textShadow: "0 0 8px rgba(232,224,208,0.08)",
//                       }}>
//                         {item.name}
//                       </span>
//                     </div>

//                     {/* Per-item price (toggle) */}
//                     {opts.showItemPrices !== false && item.originalPrice > 0 && (
//                       <span style={{
//                         fontFamily: "Caveat, cursive", fontSize: "1rem",
//                         color: "rgba(212,201,176,0.35)",
//                         textDecoration: "line-through",
//                         marginLeft: "0.75rem", whiteSpace: "nowrap",
//                       }}>
//                         {Number(item.originalPrice).toFixed(2)}€
//                       </span>
//                     )}
//                   </div>
//                 ))}
//               </div>

//               {/* Chalk divider */}
//               <ChalkDivider />

//               {/* Promo tag (toggle) */}
//               {opts.showPromoTags !== false && savingsPct > 0 && (
//                 <div style={{ textAlign: "center", marginBottom: "0.75rem" }}>
//                   <span style={{
//                     fontFamily: "Caveat, cursive", fontSize: "1rem",
//                     color: "rgba(180,220,180,0.7)",
//                     border: "1px solid rgba(180,220,180,0.25)",
//                     borderRadius: "999px", padding: "0.2rem 0.85rem",
//                     display: "inline-flex", alignItems: "center", gap: "0.35rem",
//                   }}>
//                     <Star size={11} style={{ fill: "rgba(180,220,180,0.5)" }} />
//                     Économie de {savings}€ · -{savingsPct}%
//                   </span>
//                 </div>
//               )}

//               {/* BIG chalk price */}
//               <div style={{ textAlign: "center", marginBottom: "0.25rem" }}>
//                 {menu.totalOriginal > menu.menuPrice && (
//                   <p style={{
//                     fontFamily: "Caveat, cursive", fontSize: "1.1rem",
//                     color: "rgba(212,201,176,0.3)",
//                     textDecoration: "line-through",
//                     marginBottom: "0.1rem",
//                   }}>
//                     {Number(menu.totalOriginal).toFixed(2)}€
//                   </p>
//                 )}
//                 <p style={{
//                   fontFamily: "Caveat, cursive",
//                   fontSize: "clamp(3rem, 10vw, 4rem)",
//                   fontWeight: 700,
//                   color: "#f0ebe0",
//                   lineHeight: 1,
//                   textShadow: "0 0 30px rgba(240,235,224,0.2), 1px 1px 0 rgba(0,0,0,0.5)",
//                   letterSpacing: "-0.01em",
//                 }}>
//                   {Number(menu.menuPrice).toFixed(2)}€
//                 </p>
//                 <p style={{
//                   fontFamily: "Caveat, cursive", fontSize: "0.85rem",
//                   color: "rgba(212,201,176,0.35)", marginTop: "0.1rem",
//                 }}>
//                   le menu complet
//                 </p>
//               </div>

//               {/* Valid until */}
//               {menu.validUntil && (
//                 <p style={{
//                   fontFamily: "Caveat, cursive", fontSize: "0.85rem",
//                   color: "rgba(212,201,176,0.35)", textAlign: "center",
//                   marginTop: "0.5rem",
//                 }}>
//                   ◌ Valable jusqu'à {menu.validUntil}
//                 </p>
//               )}
//             </div>

//             {/* Qty + Add button — outside the frame */}
//             <div style={{ marginTop: "1.25rem" }}>
//               <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
//                 {/* Qty stepper */}
//                 <div style={{
//                   display: "flex", alignItems: "center", gap: "0.75rem",
//                   background: "rgba(255,255,255,0.05)",
//                   border: "1px solid rgba(212,201,176,0.15)",
//                   borderRadius: "999px", padding: "0.5rem 0.75rem",
//                 }}>
//                   <button
//                     onClick={() => setQty((q) => Math.max(1, q - 1))}
//                     style={{ color: "#d4c9b0", background: "none", border: "none", cursor: "pointer", display: "flex" }}
//                   >
//                     <Minus size={14} />
//                   </button>
//                   <span style={{
//                     fontFamily: "Caveat, cursive", fontSize: "1.2rem",
//                     color: "#f0ebe0", width: "1.25rem", textAlign: "center",
//                   }}>
//                     {qty}
//                   </span>
//                   <button
//                     onClick={() => setQty((q) => q + 1)}
//                     style={{
//                       color: "#1c2b1e", background: "rgba(212,201,176,0.85)",
//                       border: "none", cursor: "pointer", borderRadius: "50%",
//                       width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center",
//                     }}
//                   >
//                     <Plus size={14} />
//                   </button>
//                 </div>

//                 {/* Add to cart */}
//                 <button
//                   onClick={handleAdd}
//                   style={{
//                     flex: 1,
//                     background: justAdded
//                       ? "rgba(92,122,94,0.5)"
//                       : "rgba(212,201,176,0.12)",
//                     border: justAdded
//                       ? "1px solid rgba(92,122,94,0.5)"
//                       : "1px solid rgba(212,201,176,0.3)",
//                     color: "#f0ebe0",
//                     borderRadius: "999px",
//                     padding: "0.75rem 1.25rem",
//                     fontFamily: "Caveat, cursive",
//                     fontSize: "1.1rem",
//                     fontWeight: 600,
//                     cursor: "pointer",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     gap: "0.5rem",
//                     transition: "all 0.2s",
//                   }}
//                 >
//                   {justAdded ? (
//                     <><Check size={16} /> Ajouté au panier !</>
//                   ) : (
//                     <>Commander — {total}€</>
//                   )}
//                 </button>
//               </div>

//               <p style={{
//                 fontFamily: "Caveat, cursive", fontSize: "0.85rem",
//                 color: "rgba(212,201,176,0.25)", textAlign: "center",
//                 marginTop: "0.6rem",
//               }}>
//                 Menu du jour · Non modifiable
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// function ChalkDivider() {
//   return (
//     <div style={{
//       display: "flex", alignItems: "center", gap: "0.5rem",
//       margin: "0.75rem 0",
//     }}>
//       <div style={{ flex: 1, height: 1, background: "rgba(212,201,176,0.15)" }} />
//       <span style={{ color: "rgba(212,201,176,0.25)", fontSize: "0.6rem", letterSpacing: "0.3em" }}>
//         ✦ ✦ ✦
//       </span>
//       <div style={{ flex: 1, height: 1, background: "rgba(212,201,176,0.15)" }} />
//     </div>
//   );
// }