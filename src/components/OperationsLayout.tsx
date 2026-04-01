import { useState, useCallback, useRef, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import { ClipboardList, LayoutDashboard, CalendarDays, Users, Mail, TicketCheck, UserCircle, Settings, X, Plus, Gauge, Car } from 'lucide-react';
import { OperationsTabsContext, type OperationsTab, type TabType, TAB_COLORS, TAB_TYPE_LABELS } from '@/lib/operations-tabs-store';

const defaultNavItems = [
  { id: 'overview', label: 'Übersicht', path: '/operations', icon: LayoutDashboard, end: true },
  { id: 'orders', label: 'Aufträge', path: '/operations/orders', icon: ClipboardList },
  { id: 'vehicles', label: 'Fahrzeugdatenbank', path: '/operations/vehicles', icon: Car },
  { id: 'customers', label: 'Kunden', path: '/operations/customers', icon: UserCircle },
  { id: 'tickets', label: 'Tickets', path: '/operations/tickets', icon: TicketCheck },
  { id: 'email', label: 'E-Mail', path: '/operations/email', icon: Mail },
  { id: 'calendar', label: 'Kalender', path: '/operations/calendar', icon: CalendarDays },
];

const TAB_TYPE_ICONS: Record<TabType, typeof ClipboardList> = {
  order: ClipboardList,
  customer: UserCircle,
  ticket: TicketCheck,
  email: Mail,
};

let tabCounter = 0;

export default function OperationsLayout() {
  const [tabs, setTabs] = useState<OperationsTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const navigate = useNavigate();

function AddTabMenu({ onAdd }: { onAdd: (type: TabType) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative shrink-0 ml-1" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-center h-7 w-7 rounded-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-md shadow-lg py-1 min-w-[150px] z-50">
          {(Object.keys(TAB_TYPE_LABELS) as TabType[]).map(type => {
            const Icon = TAB_TYPE_ICONS[type];
            return (
              <button
                key={type}
                onClick={() => { onAdd(type); setOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-popover-foreground hover:bg-secondary/60 transition-colors"
              >
                <Icon className="h-3.5 w-3.5" />
                {TAB_TYPE_LABELS[type]}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}


  const addTab = useCallback((tab: Omit<OperationsTab, 'id' | 'color'>) => {
    setTabs(prev => {
      const existing = prev.find(t => t.path === tab.path);
      if (existing) {
        setActiveTabId(existing.id);
        navigate(existing.path);
        return prev;
      }
      const id = `tab-${++tabCounter}`;
      const newTab: OperationsTab = { ...tab, id, color: null };
      setActiveTabId(id);
      navigate(tab.path);
      return [...prev, newTab];
    });
  }, [navigate]);

  const removeTab = useCallback((id: string) => {
    setTabs(prev => {
      const idx = prev.findIndex(t => t.id === id);
      const newTabs = prev.filter(t => t.id !== id);
      if (activeTabId === id) {
        if (newTabs.length > 0) {
          const newIdx = Math.min(idx, newTabs.length - 1);
          setActiveTabId(newTabs[newIdx].id);
          navigate(newTabs[newIdx].path);
        } else {
          setActiveTabId(null);
          navigate('/operations');
        }
      }
      return newTabs;
    });
  }, [activeTabId, navigate]);

  const cycleTabColor = useCallback((id: string) => {
    setTabs(prev => prev.map(t => {
      if (t.id !== id) return t;
      const currentIdx = t.color ? TAB_COLORS.indexOf(t.color) : -1;
      const nextIdx = (currentIdx + 1) % (TAB_COLORS.length + 1);
      const nextColor = nextIdx === TAB_COLORS.length ? null : TAB_COLORS[nextIdx];
      return { ...t, color: nextColor };
    }));
  }, []);

  const handleTabClick = (tab: OperationsTab) => {
    setActiveTabId(tab.id);
    navigate(tab.path);
  };

  const addNewTab = (type: TabType) => {
    const count = tabs.filter(t => t.type === type).length + 1;
    const label = `${TAB_TYPE_LABELS[type]} ${count}`;
    const pathMap: Record<TabType, string> = {
      order: '/operations/orders',
      customer: '/operations/customers',
      ticket: '/operations/tickets',
      email: '/operations/email',
    };
    addTab({ type, label, path: pathMap[type] });
  };

  return (
    <OperationsTabsContext.Provider value={{ tabs, activeTabId, addTab, removeTab, setActiveTab: setActiveTabId, cycleTabColor }}>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between h-14 px-6">
            <Link to="/operations" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-sm bg-destructive flex items-center justify-center">
                <Gauge className="h-4 w-4 text-destructive-foreground" />
              </div>
              <span className="font-bold text-foreground text-lg tracking-tight">Tuning<span className="text-destructive">Cockpit</span></span>
            </Link>

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

            <div className="flex items-center gap-3">
              <Link to="/admin" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Admin-CRM →
              </Link>
              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                <Settings className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </header>

        {/* Tabs Bar */}
        {tabs.length > 0 && (
           <div className="relative bg-background/60 border-b border-border">
            <div className="relative max-w-7xl mx-auto flex items-end h-10 px-6 gap-0.5 overflow-x-auto">
              {tabs.map(tab => {
                const Icon = TAB_TYPE_ICONS[tab.type];
                const isActive = tab.id === activeTabId;
                return (
                  <div
                    key={tab.id}
                    className={`group relative flex items-center gap-1.5 px-3 text-xs cursor-pointer border-b-2 transition-all select-none shrink-0 py-2 ${
                      isActive
                        ? 'border-destructive text-foreground font-medium bg-secondary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/30'
                    }`}
                    style={tab.color ? { borderBottomColor: tab.color } : undefined}
                    onClick={() => handleTabClick(tab)}
                    onDoubleClick={() => cycleTabColor(tab.id)}
                  >
                    {tab.color && (
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: tab.color }}
                      />
                    )}
                    <Icon className="h-3 w-3 shrink-0" />
                    <span className="truncate max-w-[120px]">{tab.label}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeTab(tab.id); }}
                      className="ml-1 opacity-0 group-hover:opacity-100 hover:bg-secondary rounded-sm p-0.5 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
              <AddTabMenu onAdd={addNewTab} />
            </div>
          </div>
        )}

        {/* Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </OperationsTabsContext.Provider>
  );
}
