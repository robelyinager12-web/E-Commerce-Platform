import { Routes, Route } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { Home } from "../pages/Home";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { ProductListing } from "../pages/ProductListing";
import { ProductDetail } from "../pages/ProductDetail";
import { Cart } from "../pages/Cart";
import { Wishlist } from "../pages/Wishlist";
import { Checkout } from "../pages/Checkout";
import { OrderHistory } from "../pages/OrderHistory";
import { OrderDetail } from "../pages/OrderDetail";
import { Account } from "../pages/Account";
import { NotFound } from "../pages/NotFound";
import { ProtectedRoute } from "../components/common/ProtectedRoute";
import { AdminRoute } from "../components/common/AdminRoute";
import { AdminLayout } from "../layouts/AdminLayout";
import { Dashboard } from "../pages/admin/Dashboard";
import { AdminProducts } from "../pages/admin/AdminProducts";
import { AdminOrders } from "../pages/admin/AdminOrders";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={<ProductListing />} />
        <Route path="/products/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/account" element={<Account />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
        </Route>
      </Route>
    </Routes>
  );
}