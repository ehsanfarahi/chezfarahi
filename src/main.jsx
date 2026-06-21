import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css'
import './i18n.js' // Import i18n configuration
import App from './App.jsx'
import Admin from "./pages/Admin.jsx";
import ProductDetailRoute from './pages/ProductDetailRoute.jsx'
import { CartProvider } from './context/CartContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CartProvider>
     <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/product/:id" element={<ProductDetailRoute />} />
      </Routes>
    </BrowserRouter>
    </CartProvider>
  </StrictMode>,
)
