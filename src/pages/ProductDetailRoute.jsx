import ProductDetail from "./ProductDetail";
import { useCart } from "../context/CartContext";

export default function ProductDetailRoute() {
  const { addToCart } = useCart();
  return <ProductDetail onAdd={addToCart} />;
}
