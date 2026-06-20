import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Menu from "./components/Menu";
import CartPanel from "./components/CartPanel";
import AiButton from "./components/AiButton";

export default function App() {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const handleAdd = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...item, qty: 1 }];
    });
    setCartOpen(true);
  };

  const handleInc = (id) =>
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)));

  const handleDec = (id) =>
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0)
    );

  const handleRemove = (id) => setCart((prev) => prev.filter((i) => i.id !== id));

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <div className="min-h-screen font-body">
      <Navbar cartCount={cartCount} onCartClick={() => setCartOpen(true)} />
      <Hero />
      <Menu onAdd={handleAdd} />
      <CartPanel
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onInc={handleInc}
        onDec={handleDec}
        onRemove={handleRemove}
      />
      <AiButton onClick={() => alert("Assistant IA — à venir dans la prochaine étape !")} />
    </div>
  );
}
