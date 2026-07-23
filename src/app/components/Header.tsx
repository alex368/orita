import { useState } from "react";
import { Link, NavLink } from "react-router";
import { Menu, Phone, UserRound, X } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Accueil" },
    { to: "/parcours", label: "Parcours" },
    { to: "/chauffeurs", label: "Chauffeurs" },
    { to: "/location", label: "Location" },
    { to: "/bons-plans", label: "Bons plans" },
    { to: "/contact", label: "Contact" }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center" aria-label="ORITA - Accueil">
            <BrandLogo className="h-12 w-40 sm:w-48" />
          </Link>

          <nav className="hidden items-center gap-1 rounded-md bg-stone-100 p-1 md:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-white text-emerald-900 shadow-sm"
                      : "text-stone-600 hover:text-stone-950"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/mon-espace"
              className="inline-flex items-center gap-2 rounded-md border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 hover:text-emerald-900"
            >
              <UserRound className="h-4 w-4" />
              Mon espace
            </Link>
            <a
              href="https://wa.me/22997123456"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-emerald-900/15 px-4 py-2 text-sm font-medium text-emerald-900 transition-colors hover:bg-emerald-50"
            >
              <Phone className="h-4 w-4" />
              WhatsApp
            </a>
          </div>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Ouvrir le menu">
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <nav className="mt-10 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className="rounded-md px-3 py-3 text-base font-medium text-stone-700 transition-colors hover:bg-stone-100 hover:text-emerald-900"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/mon-espace"
                  onClick={() => setIsOpen(false)}
                  className="rounded-md px-3 py-3 text-base font-medium text-stone-700 transition-colors hover:bg-stone-100 hover:text-emerald-900"
                >
                  Mon espace
                </Link>
                <a
                  href="https://wa.me/22997123456"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 flex items-center justify-center gap-2 rounded-md bg-emerald-900 px-4 py-3 font-medium text-white transition-colors hover:bg-emerald-800"
                >
                  <Phone className="h-5 w-5" />
                  WhatsApp
                </a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
