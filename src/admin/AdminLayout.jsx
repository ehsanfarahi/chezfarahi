import { useState } from "react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  PackagePlus,
  CalendarDays,
} from "lucide-react";

const NAV = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "menu",      label: "Menu",             icon: UtensilsCrossed },
  { id: "combos",    label: "Combos",            icon: PackagePlus },
  { id: "menuDuJour", label: "Plat du Jour",     icon: CalendarDays },
  { id: "orders",    label: "Commandes",         icon: ClipboardList },
  { id: "settings",  label: "Paramètres",        icon: Settings },
];

export default function AdminLayout({ page, setPage, onLogout, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const active = page === item.id;
    return (
      <button
        onClick={() => { setPage(item.id); setMobileOpen(false); }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
          active
            ? "bg-marigold text-char shadow-lg shadow-marigold/20"
            : "text-mute/70 hover:bg-cream/5 hover:text-cream"
        }`}
      >
        <Icon size={18} className="shrink-0" />
        <span className="flex-1 text-left">{item.label}</span>
        {active && <ChevronRight size={14} className="shrink-0" />}
      </button>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-5 py-6 border-b border-cream/10">
        <p className="text-marigold text-[10px] font-semibold uppercase tracking-widest mb-0.5">
          Administration
        </p>
        <h1 className="font-display text-xl font-bold text-cream">Le Camion Doré</h1>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map((item) => <NavItem key={item.id} item={item} />)}
      </nav>
      <div className="px-3 py-4 border-t border-cream/10">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-mute/60 hover:bg-chili/10 hover:text-chili transition"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-char flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-char-soft border-r border-cream/10 shrink-0 fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 bg-char-soft border-r border-cream/10 flex flex-col">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-cream/10"
            >
              <X size={18} className="text-cream" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-64 min-h-screen">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-char-soft border-b border-cream/10 sticky top-0 z-20">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-cream/10"
          >
            <Menu size={20} className="text-cream" />
          </button>
          <span className="font-display font-semibold text-cream">
            {NAV.find((n) => n.id === page)?.label}
          </span>
          <div className="w-9" />
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
