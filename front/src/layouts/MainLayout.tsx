import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";

export function MainLayout() {
  const { pathname } = useLocation();
  const hideFooter = [
    "/profile/saved",
    "/saved",
    "/profile-messages",
    "/profile/notifications",
    "/profile/adverts",
    "/listings/mine",
    "/profile/shop",
    "/profile/statistics",
    "/performance",
    "/profile/settings/contact-details",
    "/account",
    "/profile/feedback",
    "/listings/new",
  ].includes(pathname);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}