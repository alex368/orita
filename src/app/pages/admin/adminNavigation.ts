import {
  CalendarDays,
  Bot,
  Car,
  CircleDollarSign,
  FileText,
  Home,
  KeyRound,
  MapPinned,
  LayoutDashboard,
  Mail,
  Settings,
  ShoppingBag,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AdminSection = "dashboard" | "clients" | "tours" | "guides" | "drivers" | "rentals" | "tenants" | "plans" | "bookings" | "driverBookings" | "messages" | "ai" | "legal" | "settings";

export const adminNavItems: { id: AdminSection; label: string; icon: LucideIcon; path: string }[] = [
  { id: "dashboard", label: "Accueil", icon: LayoutDashboard, path: "/admin" },
  { id: "clients", label: "Clients", icon: Users, path: "/admin/clients" },
  { id: "tours", label: "Parcours", icon: CalendarDays, path: "/admin/parcours" },
  { id: "guides", label: "Guides", icon: MapPinned, path: "/admin/guides" },
  { id: "drivers", label: "Chauffeurs", icon: Car, path: "/admin/chauffeurs" },
  { id: "rentals", label: "Location", icon: Home, path: "/admin/location" },
  { id: "tenants", label: "Propriétaires", icon: KeyRound, path: "/admin/proprietaires" },
  { id: "plans", label: "Bons plans", icon: ShoppingBag, path: "/admin/bons-plans" },
  { id: "bookings", label: "Réservations", icon: CircleDollarSign, path: "/admin/reservations" },
  { id: "driverBookings", label: "Résa chauffeurs", icon: Car, path: "/admin/reservations-chauffeurs" },
  { id: "messages", label: "Messages", icon: Mail, path: "/admin/messages" },
  { id: "ai", label: "Configuration IA", icon: Bot, path: "/admin/configuration-ia" },
  { id: "legal", label: "Pages légales", icon: FileText, path: "/admin/pages-legales" },
  { id: "settings", label: "Paramètres", icon: Settings, path: "/admin/parametres" },
];

export function adminSectionFromPath(pathname: string): AdminSection {
  const section = pathname.split("/").filter(Boolean)[1];
  return adminNavItems.find((item) => item.path === `/admin/${section}`)?.id ?? "dashboard";
}

export function adminPathForSection(section: AdminSection) {
  return adminNavItems.find((item) => item.id === section)?.path ?? "/admin";
}
