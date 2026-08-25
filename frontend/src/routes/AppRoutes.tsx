import { Routes, Route } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { Home } from "../pages/Home";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { ProductListing } from "../pages/ProductListing";
import { ProductDetail } from "../pages/ProductDetail";
import { NotFound } from "../pages/NotFound";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={<ProductListing />} />
        <Route path="/products/:slug" element={<ProductDetail />} />
        {/* Cart, wishlist, checkout, and account pages are added in the
            following frontend steps. */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}