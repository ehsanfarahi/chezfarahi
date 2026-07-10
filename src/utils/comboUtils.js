export function calcComboPrice(combo, menuItems) {
  const items = combo.items || [];
  const bevs = combo.beverages || [];
  const breakdown = [];

  let original = 0;
  let discounted = 0;

  items.forEach((item) => {
    const menuItem = menuItems?.find((m) => m.id === item.menuItemId);
    const lineOriginal   = parseFloat((item.originalPrice ?? menuItem?.price ?? 0).toFixed(2));
    const lineDiscounted = parseFloat((item.comboPrice    ?? lineOriginal).toFixed(2));
    const unitDiscount   = parseFloat((lineOriginal - lineDiscounted).toFixed(2));

    original   += lineOriginal;
    discounted += lineDiscounted;

    breakdown.push({
      name:          item.name || menuItem?.name || "—",
      qty:           1,
      unitPrice:     lineOriginal,
      unitDiscount,
      lineOriginal,
      lineDiscounted,
    });
  });

  bevs.forEach((bev) => {
    const lineOriginal   = parseFloat((bev.originalPrice ?? 0).toFixed(2));
    const lineDiscounted = parseFloat((bev.comboPrice    ?? lineOriginal).toFixed(2));
    const unitDiscount   = parseFloat((lineOriginal - lineDiscounted).toFixed(2));

    original   += lineOriginal;
    discounted += lineDiscounted;

    breakdown.push({
      name:          bev.name || "Boisson",
      qty:           1,
      unitPrice:     lineOriginal,
      unitDiscount,
      lineOriginal,
      lineDiscounted,
    });
  });

  return {
    original:   parseFloat(original.toFixed(2)),
    discounted: parseFloat(discounted.toFixed(2)),
    savings:    parseFloat((original - discounted).toFixed(2)),
    breakdown,
  };
}
























// // Calculates original and discounted totals from combo items + beverages
// export function calcComboPrice(combo, menuItems) {
//   const items = combo.items || [];
//   const bevs = combo.beverages || [];
//   const breakdown = [];

//   let original = 0;
//   let discounted = 0;

//   items.forEach((item) => {
//     const menuItem = menuItems.find((m) => m.id === item.menuItemId);
//     const lineOriginal = item.originalPrice || menuItem?.price || 0;
//     const lineDiscounted = item.comboPrice ?? lineOriginal;
//     original += lineOriginal;
//     discounted += lineDiscounted;
//     breakdown.push({
//       name: item.name || menuItem?.name || "—",
//       originalPrice: lineOriginal,
//       comboPrice: lineDiscounted,
//       savings: lineOriginal - lineDiscounted,
//     });
//   });

//   bevs.forEach((bev) => {
//     const lineOriginal = bev.originalPrice || 0;
//     const lineDiscounted = bev.comboPrice ?? lineOriginal;
//     original += lineOriginal;
//     discounted += lineDiscounted;
//     breakdown.push({
//       name: bev.name || "Boisson",
//       originalPrice: lineOriginal,
//       comboPrice: lineDiscounted,
//       savings: lineOriginal - lineDiscounted,
//     });
//   });

//   return {
//     original: parseFloat(original.toFixed(2)),
//     discounted: parseFloat(discounted.toFixed(2)),
//     savings: parseFloat((original - discounted).toFixed(2)),
//     breakdown,
//   };
// }