export const popularCombos = [
  {
    id: "combo-01",
    name: "Combo Poulet Royal",
    emoji: "🥪",
    tag: "Best-seller",
    rating: 4.9,
    reviews: 211,
    linkTo: "combo-01",
    itemRefs: [
      { id: "san-01", qty: 1 },
      { id: "fr-01", qty: 1 },
      { id: "drink-01", qty: 1 },
    ],
  },
  {
    id: "combo-02",
    name: "Combo Samosa Feast",
    emoji: "🥟",
    tag: "Populaire",
    rating: 4.8,
    reviews: 142,
    linkTo: "combo-02",
    itemRefs: [
      { id: "sam-01", qty: 3 },
      { id: "fr-02", qty: 1 },
      { id: "drink-01", qty: 1 },
    ],
  },
  {
    id: "combo-03",
    name: "Combo Végé Zen",
    emoji: "🥙",
    tag: "Végé",
    rating: 4.7,
    reviews: 98,
    linkTo: "combo-03",
    itemRefs: [
      { id: "san-02", qty: 1 },
      { id: "sam-02", qty: 1 },
      { id: "drink-01", qty: 1 },
    ],
  },
  {
    id: "combo-04",
    name: "Combo Hot-Dog Épicé",
    emoji: "🌭",
    tag: "Piquant 🔥",
    rating: 4.6,
    reviews: 87,
    linkTo: "combo-04",
    itemRefs: [
      { id: "hd-02", qty: 1 },
      { id: "fr-02", qty: 1 },
      { id: "drink-01", qty: 1 },
    ],
  },
  {
    id: "combo-05",
    name: "Combo Découverte",
    emoji: "🎉",
    tag: "Nouveau",
    rating: 4.8,
    reviews: 34,
    linkTo: "combo-05",
    itemRefs: [
      { id: "sam-01", qty: 1 },
      { id: "hd-01", qty: 1 },
      { id: "fr-01", qty: 1 },
      { id: "drink-01", qty: 1 },
    ],
  },
];

// Helper: calculate original and discounted totals from menu data
export function calcComboPrice(combo, menuItems) {
  let original = 0;
  let discounted = 0;
  const breakdown = [];


  combo.itemRefs.forEach(({ id, qty }) => {
    const item = menuItems.find((m) => m.id === id);
    if (!item) return;
    const itemOriginal = item.price * qty;
    const itemDiscount = (item.discount || 0) * qty;
    original += itemOriginal;
    discounted += itemOriginal - itemDiscount;
    breakdown.push({
      name: item.name,
      qty,
      unitPrice: item.price,
      unitDiscount: item.discount || 0,
      lineOriginal: itemOriginal,
      lineDiscounted: itemOriginal - itemDiscount,
    });
  });

  return {
    original: parseFloat(original.toFixed(2)),
    discounted: parseFloat(discounted.toFixed(2)),
    savings: parseFloat((original - discounted).toFixed(2)),
    breakdown,
  };
}