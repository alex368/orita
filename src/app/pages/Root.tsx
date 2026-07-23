import { Outlet, useLocation } from "react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { CookieConsent } from "../components/CookieConsent";
import { PageChat } from "../components/PageChat";
import { Toaster } from "../components/ui/sonner";

export function Root() {
  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdminRoute && <Header />}
      <main className="flex-1">
        <Outlet />
      </main>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <CookieConsent />}
      {!isAdminRoute && <PageChat />}
      <Toaster />
    </div>
  );
}
