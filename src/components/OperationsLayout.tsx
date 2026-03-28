import { Link, Outlet, useLocation } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import { ClipboardList, LayoutDashboard, Columns3, Settings } from 'lucide-react';

const navItems = [
  { label: 'Übersicht', path: '/operations', icon: LayoutDashboard, end: true },
  { label: 'Aufträge', path: '/operations/orders', icon: ClipboardList },
  { label: 'Kanban', path: '/operations/kanban', icon: Columns3 },
];

export default function OperationsLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="flex items-center justify-between h-14 px-6">
          {/* Logo / Brand */}
          <Link to="/operations" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-sm bg-destructive flex items-center justify-center">
              <span className="text-destructive-foreground font-bold text-sm">OP</span>
            </div>
            <span className="font-bold text-foreground text-lg tracking-tight">Operations</span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-1">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                activeClassName="bg-secondary text-foreground font-medium"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Admin-CRM →
            </Link>
            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
              <Settings className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
