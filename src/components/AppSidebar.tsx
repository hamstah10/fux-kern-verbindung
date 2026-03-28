import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Car, Sparkles, Activity,
  Building2, FileText, ShoppingCart, Shield, Settings, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Leads', path: '/admin/leads', icon: Users },
  { label: 'Fahrzeuge', path: '/admin/vehicles', icon: Car },
  { label: 'Empfehlungen', path: '/admin/recommendations', icon: Sparkles },
  { label: 'Dyno-Sim', path: '/admin/dyno', icon: Activity },
  { label: 'Aufträge', path: '/admin/orders', icon: ShoppingCart },
  { label: 'Dateien', path: '/admin/files', icon: FileText },
  { label: 'Partner', path: '/admin/partners', icon: Building2 },
  { label: 'Dealer Requests', path: '/admin/dealer-requests', icon: Shield },
];

const portalItems = [
  { label: 'Kundenportal', path: '/my-garage', icon: Car },
  { label: 'Händlerportal', path: '/dealer', icon: Building2 },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside className={cn(
      "fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r border-border bg-sidebar transition-all duration-300",
      collapsed ? "w-16" : "w-60"
    )}>
      <div className="flex items-center gap-2 px-4 py-5 border-b border-border">
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight text-foreground">
            Tuning<span className="text-destructive">Fux</span>
          </span>
        )}
        {collapsed && <span className="text-lg font-bold text-primary mx-auto">TF</span>}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <div className="mb-1 px-2">
          {!collapsed && <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Admin / CRM</span>}
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors mb-0.5",
              isActive || (item.path === '/admin' && location.pathname === '/admin')
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}

        <div className="mt-5 mb-1 px-2">
          {!collapsed && <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Portale</span>}
        </div>
        {portalItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors mb-0.5",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center py-3 border-t border-border text-muted-foreground hover:text-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
}
