import { ReactNode, useState } from "react";
import { Bell, ChevronLeft, ChevronRight, LogOut, Menu, Search, X } from "lucide-react";
import { BrandLogo } from "../../../components/BrandLogo";
import { Button } from "../../../components/ui/button";
import { AdminSection, adminNavItems } from "../adminNavigation";

export type AdminNotification = {
  id: string;
  title: string;
  description: string;
  section: AdminSection;
  tone: "amber" | "emerald" | "red" | "blue" | "stone";
};

type AdminLayoutProps = {
  activeSection: AdminSection;
  activeLabel: string;
  collapsed: boolean;
  isMobileOpen: boolean;
  globalSearch: string;
  notifications: AdminNotification[];
  onSearchChange: (value: string) => void;
  onDismissNotification: (id: string) => void;
  onDismissAllNotifications: () => void;
  onCollapse: () => void;
  onCloseMobile: () => void;
  onOpenMobile: () => void;
  onSelect: (section: AdminSection) => void;
  onLogout: () => void;
  children: ReactNode;
};

/**
 * Shared admin chrome used by every dedicated admin page.
 */
export function AdminLayout({
  activeSection,
  activeLabel,
  collapsed,
  isMobileOpen,
  globalSearch,
  notifications,
  onSearchChange,
  onDismissNotification,
  onDismissAllNotifications,
  onCollapse,
  onCloseMobile,
  onOpenMobile,
  onSelect,
  onLogout,
  children,
}: AdminLayoutProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationCount = notifications.length;

  return (
    <div className="min-h-screen bg-[#f7f3eb] text-stone-950">
      <AdminSidebar
        activeSection={activeSection}
        collapsed={collapsed}
        isMobileOpen={isMobileOpen}
        notifications={notifications}
        onCollapse={onCollapse}
        onCloseMobile={onCloseMobile}
        onSelect={onSelect}
      />

      <div className={`min-h-screen transition-all duration-200 ${collapsed ? "lg:pl-24" : "lg:pl-72"}`}>
        <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-20 items-center gap-4 px-4 py-3 lg:px-8">
            <Button variant="outline" size="icon" className="lg:hidden" onClick={onOpenMobile}>
              <Menu className="h-4 w-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Admin / {activeLabel}</p>
              <h1 className="mt-1 truncate text-2xl font-semibold text-stone-950">{activeLabel}</h1>
            </div>
            <div className="hidden min-w-[280px] items-center gap-2 rounded-md border border-stone-200 bg-[#fbfaf7] px-3 py-2 md:flex">
              <Search className="h-4 w-4 text-stone-400" />
              <input
                value={globalSearch}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Rechercher client, réservation, parcours..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <div className="relative">
              <Button variant="outline" size="icon" className="relative" onClick={() => setNotificationsOpen((value) => !value)} aria-label="Ouvrir le centre de notifications">
                <Bell className="h-4 w-4" />
                {notificationCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-semibold text-white">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </Button>
              {notificationsOpen && (
                <div className="absolute right-0 top-12 z-50 w-[min(360px,calc(100vw-2rem))] rounded-md border border-stone-200 bg-white p-3 shadow-xl">
                  <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
                    <div>
                      <p className="font-semibold text-stone-950">Centre de notifications</p>
                      <p className="text-xs text-stone-500">{notificationCount} élément{notificationCount > 1 ? "s" : ""} à vérifier</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {notifications.length > 0 && (
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={onDismissAllNotifications}>
                          Tout traiter
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setNotificationsOpen(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 max-h-[420px] space-y-2 overflow-y-auto pr-1">
                    {notifications.length === 0 && (
                      <div className="rounded-md border border-dashed border-stone-200 p-4 text-sm text-stone-500">Aucune notification pour le moment.</div>
                    )}
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="rounded-md border border-stone-200 p-3 transition hover:bg-stone-50"
                      >
                        <div className="flex items-start gap-3">
                          <span className={`mt-1 h-2.5 w-2.5 rounded-full ${notificationToneClass(notification.tone)}`} />
                          <button
                            type="button"
                            className="min-w-0 flex-1 text-left"
                            onClick={() => {
                              setNotificationsOpen(false);
                              onSelect(notification.section);
                            }}
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium text-stone-950">{notification.title}</p>
                              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-stone-600">
                                {adminSectionLabel(notification.section)}
                              </span>
                            </div>
                            <p className="mt-1 text-sm leading-5 text-stone-500">{notification.description}</p>
                          </button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => {
                              setNotificationsOpen(false);
                              onSelect(notification.section);
                            }}
                          >
                            Traiter
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="hidden items-center gap-3 rounded-md border border-stone-200 px-3 py-2 md:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-900 text-xs font-semibold text-white">AD</div>
              <div>
                <p className="text-sm font-medium">Administrateur</p>
                <p className="text-xs text-stone-500">Démo locale</p>
              </div>
            </div>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </header>

        <main className="space-y-6 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function notificationToneClass(tone: AdminNotification["tone"]) {
  return {
    amber: "bg-amber-500",
    emerald: "bg-emerald-500",
    red: "bg-red-500",
    blue: "bg-blue-500",
    stone: "bg-stone-400",
  }[tone];
}

function AdminSidebar({ activeSection, collapsed, isMobileOpen, notifications, onCollapse, onCloseMobile, onSelect }: {
  activeSection: AdminSection;
  collapsed: boolean;
  isMobileOpen: boolean;
  notifications: AdminNotification[];
  onCollapse: () => void;
  onCloseMobile: () => void;
  onSelect: (section: AdminSection) => void;
}) {
  const notificationCounts = notifications.reduce<Record<string, number>>((counts, notification) => {
    counts[notification.section] = (counts[notification.section] ?? 0) + 1;
    return counts;
  }, {});

  return (
    <>
      {isMobileOpen && <button aria-label="Fermer le menu" className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onCloseMobile} />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-stone-200 bg-stone-950 text-stone-200 transition-all duration-200 ${collapsed ? "lg:w-24" : "lg:w-72"} ${isMobileOpen ? "w-72 translate-x-0" : "w-72 -translate-x-full lg:translate-x-0"}`}>
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <div className={`flex items-center gap-3 ${collapsed ? "lg:justify-center" : ""}`}>
            <BrandLogo compact className="h-10 w-10 flex-shrink-0" invert />
            {!collapsed && (
              <div>
                <p className="font-semibold text-white">ORITA</p>
                <p className="text-xs text-emerald-300">Administration</p>
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" className="text-stone-300 hover:bg-white/10 hover:text-white lg:hidden" onClick={onCloseMobile}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            const count = notificationCounts[item.id] ?? 0;
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`relative flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm transition-colors ${isActive ? "bg-emerald-400 text-stone-950" : "text-stone-300 hover:bg-white/10 hover:text-white"} ${collapsed ? "lg:justify-center" : ""}`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span className="min-w-0 flex-1 text-left">{item.label}</span>}
                {count > 0 && (
                  <span className={`${collapsed ? "absolute right-2 top-2" : ""} flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-semibold text-white`}>
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <Button variant="ghost" className="hidden w-full justify-center text-stone-300 hover:bg-white/10 hover:text-white lg:flex" onClick={onCollapse}>
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /> Réduire</>}
          </Button>
        </div>
      </aside>
    </>
  );
}

function adminSectionLabel(section: AdminSection) {
  return adminNavItems.find((item) => item.id === section)?.label ?? "Admin";
}
