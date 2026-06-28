import { useReducer, useState } from "react";
import { useCart } from "./context/CartContext";
import { useMenuData } from "./hooks/useMenuData";

// Import components
import { SocialMedias, Navbar, Hero, Menu, CartPanel, ChatPanel, AiButton, PopularSection } from "./components";

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
  const { cart, addToCart, inc, dec, remove, cartCount, clearCart } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  

  const { menuItems } = useMenuData();
console.log("menuItems:", menuItems); // ← add this temporarily

  // Use Reducer
  const [{ language }, dispatch] = useReducer(reducer, initialState);

 const handleAdd = (item) => {
    addToCart(item);
    setCartOpen(true);
  };

  const handleReorder = (items) => {
  items.forEach((item) => addToCart(item));
  setCartOpen(true);
};

  // const clearCart = () => setCart([]); CartContext equivalent is Used


  return (
      <div className="min-h-screen font-body">
        <Navbar cartCount={cartCount} onCartClick={() => setCartOpen(true)} language={language} dispatch={dispatch} />
        <Hero />
        <PopularSection onAdd={handleAdd} menuItems={menuItems} />
        <Menu onAdd={handleAdd} />
        <CartPanel
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          cart={cart}
          onInc={inc}
          onDec={dec}
          onRemove={remove}
          onClearCart={clearCart}
          onReorder={handleReorder}
        />

         <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
        <AiButton
          onClick={() => setChatOpen(true)}
        />
        <SocialMedias /> 
      </div>
  );
}
