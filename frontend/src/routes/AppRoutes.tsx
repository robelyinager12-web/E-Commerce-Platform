import { Routes, Route } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { Home } from "../pages/Home";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { ListingBrowse } from "../pages/ListingBrowse";
import { ListingDetail } from "../pages/ListingDetail";
import { PostListing } from "../pages/PostListing";
import { EditListing } from "../pages/EditListing";
import { MyListings } from "../pages/MyListings";
import { SavedListings } from "../pages/SavedListings";
import { SellerProfile } from "../pages/SellerProfile";
import { Account } from "../pages/Account";
import { NotFound } from "../pages/NotFound";
import { ProtectedRoute } from "../components/common/ProtectedRoute";
import { AdminRoute } from "../components/common/AdminRoute";
import { AdminLayout } from "../layouts/AdminLayout";
import { Dashboard } from "../pages/admin/Dashboard";
import { AdminListings } from "../pages/admin/AdminListings";
import { AdminCategories } from "../pages/admin/AdminCategories";
import { AdminReports } from "../pages/admin/AdminReports";
import { AdminUsers } from "../pages/admin/AdminUsers";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/listings" element={<ListingBrowse />} />
        <Route path="/listings/:slug" element={<ListingDetail />} />
        <Route path="/sellers/:sellerId" element={<SellerProfile />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/listings/new" element={<PostListing />} />
          <Route path="/listings/:slug/edit" element={<EditListing />} />
          <Route path="/listings/mine" element={<MyListings />} />
          <Route path="/saved" element={<SavedListings />} />
          <Route path="/account" element={<Account />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="listings" element={<AdminListings />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
      </Route>
    </Routes>
  );
}