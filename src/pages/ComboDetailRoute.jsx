import ComboDetail from "./ComboDetail";
import { useCart } from "../context/CartContext";

export default function ComboDetailRoute() {
  const { addToCart } = useCart();
  return <ComboDetail onAdd={addToCart} />;
}