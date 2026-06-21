import { useReducer, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Menu from "./components/Menu";
import CartPanel from "./components/CartPanel";
import ChatPanel from "./components/ChatPanel";
import AiButton from "./components/AiButton";

// Import components
import { SocialMedias } from "./components";

// Language
import i18n from "./i18n";

// Use useReducer
const initialState = {
  language: i18n.language?.toUpperCase() === "EN" ? "EN" : "FR",
};

function reducer(state, action) {
  switch (action.type) {
    case "lang/language":
      return { ...state, language: action.payload };
    default:
      throw new Error("Unknown action type");
  }
}

export default function App() {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // Use Reducer
  const [{ language }, dispatch] = useReducer(reducer, initialState);

  const handleAdd = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + 1 } : i,
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
    setCartOpen(true);
  };

  const handleInc = (id) =>
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)),
    );

  const handleDec = (id) =>
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0),
    );

  const handleRemove = (id) =>
    setCart((prev) => prev.filter((i) => i.id !== id));

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
      <div className="min-h-screen font-body">
        <Navbar cartCount={cartCount} onCartClick={() => setCartOpen(true)} language={language} dispatch={dispatch} />
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
         <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
        <AiButton
          onClick={() => setChatOpen(true)}
        />
        <SocialMedias />
      </div>
  );
}
