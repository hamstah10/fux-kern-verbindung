import { useState, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, List, Columns3, GripVertical, User, Car, Euro, X, Calendar, Package, Building2, ExternalLink, XCircle } from 'lucide-react';
import { DataCard, StatusBadge } from '@/components/DataComponents';
import { mockOrders, mockLeads, mockVehicles, mockDealers, mockRecommendations, orderStatusLabels } from '@/lib/mock-data';
import type { Order, OrderStatus } from '@/types/models';
import { PinToTabButton } from '@/components/PinToTabButton';
import { toast } from 'sonner';

const orderStatusDisplay: Record<OrderStatus, 'new' | 'processing' | 'success' | 'warning' | 'error'> = {
  received: 'new', in_progress: 'processing', on_hold: 'warning', parked: 'warning', completed: 'success', rejected: 'error',
};

const allStatuses: Array<OrderStatus | 'all'> = ['all', 'received', 'in_progress', 'on_hold', 'parked', 'completed', 'rejected'];

const columns: { status: OrderStatus; color: string }[] = [
  { status: 'received', color: 'bg-[hsl(var(--processing))]' },
  { status: 'in_progress', color: 'bg-[hsl(var(--processing))]' },
  { status: 'on_hold', color: 'bg-[hsl(var(--warning))]' },
  { status: 'parked', color: 'bg-muted-foreground' },
  { status: 'completed', color: 'bg-[hsl(var(--success))]' },
  { status: 'rejected', color: 'bg-destructive' },
];

type ViewMode = 'list' | 'kanban';

export default function OperationsOrdersPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  // Kanban state
  const [ordersByStatus, setOrdersByStatus] = useState<Record<OrderStatus, Order[]>>(() => {
    const grouped: Record<OrderStatus, Order[]> = {
      received: [], in_progress: [], on_hold: [], parked: [], completed: [], rejected: [],
    };
    for (const order of mockOrders) {
      grouped[order.status].push({ ...order });
    }
    return grouped;
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [hiddenCols, setHiddenCols] = useState<Set<OrderStatus>>(new Set());
  const dragItem = useRef<{ orderId: string; fromStatus: OrderStatus } | null>(null);
  const [dragOverCol, setDragOverCol] = useState<OrderStatus | null>(null);

  // List filtering
  const filteredList = mockOrders.filter(order => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    if (search) {
      const lead = mockLeads.find(l => l.id === order.lead_id);
      const vehicle = mockVehicles.find(v => v.id === order.vehicle_id);
      const haystack = `${order.id} ${lead?.name ?? ''} ${vehicle?.brand ?? ''} ${vehicle?.model ?? ''} ${order.items.join(' ')}`.toLowerCase();
      if (!haystack.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  // Kanban filtering
  const toggleCol = useCallback((status: OrderStatus) => {
    setHiddenCols(prev => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status); else next.add(status);
      return next;
    });
  }, []);

  const filteredByStatus = useMemo(() => {
    if (!search.trim()) return ordersByStatus;
    const q = search.toLowerCase();
    const result: Record<OrderStatus, Order[]> = { received: [], in_progress: [], on_hold: [], parked: [], completed: [], rejected: [] };
    for (const status of Object.keys(ordersByStatus) as OrderStatus[]) {
      result[status] = ordersByStatus[status].filter(order => {
        const lead = mockLeads.find(l => l.id === order.lead_id);
        const vehicle = mockVehicles.find(v => v.id === order.vehicle_id);
        const haystack = `${order.id} ${lead?.name ?? ''} ${lead?.email ?? ''} ${vehicle?.brand ?? ''} ${vehicle?.model ?? ''} ${order.items.join(' ')} ${order.total_eur}`.toLowerCase();
        return haystack.includes(q);
      });
    }
    return result;
  }, [ordersByStatus, search]);

  const handleDragStart = useCallback((orderId: string, fromStatus: OrderStatus) => {
    dragItem.current = { orderId, fromStatus };
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, status: OrderStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(status);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverCol(null);
  }, []);

  const handleDrop = useCallback((toStatus: OrderStatus) => {
    setDragOverCol(null);
    if (!dragItem.current) return;
    const { orderId, fromStatus } = dragItem.current;
    if (fromStatus === toStatus) { dragItem.current = null; return; }

    setOrdersByStatus(prev => {
      const from = prev[fromStatus].filter(o => o.id !== orderId);
      const moved = prev[fromStatus].find(o => o.id === orderId);
      if (!moved) return prev;
      const updated = { ...moved, status: toStatus };
      const to = [...prev[toStatus], updated];
      setSelectedOrder(sel => sel?.id === orderId ? updated : sel);
      return { ...prev, [fromStatus]: from, [toStatus]: to };
    });

    toast.success(`Auftrag ${orderId} → ${orderStatusLabels[toStatus]}`);
    dragItem.current = null;
  }, []);

  const handleStatusChangeFromPanel = useCallback((order: Order, newStatus: OrderStatus) => {
    const oldStatus = order.status;
    if (oldStatus === newStatus) return;

    setOrdersByStatus(prev => {
      const from = prev[oldStatus].filter(o => o.id !== order.id);
      const updated = { ...order, status: newStatus };
      const to = [...prev[newStatus], updated];
      setSelectedOrder(updated);
      return { ...prev, [oldStatus]: from, [newStatus]: to };
    });

    toast.success(`Auftrag ${order.id} → ${orderStatusLabels[newStatus]}`);
  }, []);

  const totalOrders = Object.values(ordersByStatus).reduce((sum, arr) => sum + arr.length, 0);
  const visibleOrders = Object.values(filteredByStatus).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className={`p-6 max-w-7xl mx-auto ${viewMode === 'kanban' ? 'h-[calc(100vh-3.5rem)] flex flex-col' : ''}`}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className={viewMode === 'kanban' ? 'flex flex-col flex-1 min-h-0' : ''}>
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-foreground">Aufträge</h1>
          {/* View Toggle */}
          <div className="flex items-center gap-0.5 bg-secondary rounded-sm p-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-sm transition-all ${
                viewMode === 'list'
                  ? 'bg-destructive text-destructive-foreground font-medium'
                  : 'text-secondary-foreground hover:text-foreground'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              Liste
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-sm transition-all ${
                viewMode === 'kanban'
                  ? 'bg-destructive text-destructive-foreground font-medium'
                  : 'text-secondary-foreground hover:text-foreground'
              }`}
            >
              <Columns3 className="h-3.5 w-3.5" />
              Kanban
            </button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          {viewMode === 'kanban'
            ? `${search ? `${visibleOrders} von ${totalOrders}` : totalOrders} Aufträge · Drag & Drop zum Verschieben`
            : 'Alle Aufträge aus allen Portalen'}
        </p>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Suche nach ID, Kunde, Fahrzeug..."
              className="w-full pl-9 pr-8 py-2 text-sm rounded-sm bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <XCircle className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Filter className="h-4 w-4 text-muted-foreground mr-1" />
            {viewMode === 'list'
              ? allStatuses.map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2.5 py-1.5 text-xs rounded-sm transition-all ${
                      statusFilter === s
                        ? 'bg-destructive text-destructive-foreground font-medium'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {s === 'all' ? 'Alle' : orderStatusLabels[s]}
                  </button>
                ))
              : columns.map(col => (
                  <button
                    key={col.status}
                    onClick={() => toggleCol(col.status)}
                    className={`px-2.5 py-1.5 text-xs rounded-sm transition-all ${
                      hiddenCols.has(col.status)
                        ? 'bg-secondary/50 text-muted-foreground line-through'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {orderStatusLabels[col.status]}
                  </button>
                ))
            }
          </div>
        </div>

        {/* LIST VIEW */}
        {viewMode === 'list' && (
          <div className="space-y-2">
            {filteredList.map((order, i) => {
              const lead = mockLeads.find(l => l.id === order.lead_id);
              const vehicle = mockVehicles.find(v => v.id === order.vehicle_id);
              const date = new Date(order.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

              return (
                <motion.div key={order.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Link to={`/operations/orders/${order.id}`}>
                    <DataCard className="hover:border-muted-foreground/30 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div>
                            <p className="text-sm font-medium text-foreground font-mono-data">{order.id}</p>
                            <p className="text-xs text-muted-foreground">{date}</p>
                          </div>
                          <div>
                            <p className="text-sm text-foreground">{lead?.name ?? order.lead_id}</p>
                            <p className="text-xs text-muted-foreground">{vehicle ? `${vehicle.brand} ${vehicle.model}` : order.vehicle_id}</p>
                          </div>
                          <div>
                            <p className="text-sm text-foreground">{order.items.join(', ')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-bold text-foreground font-mono-data">€{order.total_eur.toLocaleString('de-DE')}</span>
                          <StatusBadge status={orderStatusDisplay[order.status]} label={orderStatusLabels[order.status]} />
                          <PinToTabButton
                            type="order"
                            label={`${order.id} – ${lead?.name ?? 'Auftrag'}`}
                            path={`/operations/orders/${order.id}`}
                          />
                        </div>
                      </div>
                    </DataCard>
                  </Link>
                </motion.div>
              );
            })}
            {filteredList.length === 0 && (
              <p className="text-sm text-muted-foreground italic py-8 text-center">Keine Aufträge gefunden</p>
            )}
          </div>
        )}

        {/* KANBAN VIEW */}
        {viewMode === 'kanban' && (
          <div className="flex-1 flex gap-0 min-h-0">
            <div className={`flex-1 flex gap-3 overflow-x-auto pb-2 min-h-0 transition-all ${selectedOrder ? 'mr-0' : ''}`}>
              {columns.filter(col => !hiddenCols.has(col.status)).map(col => {
                const orders = filteredByStatus[col.status];
                const isOver = dragOverCol === col.status;

                return (
                  <div
                    key={col.status}
                    className={`flex-1 min-w-[180px] max-w-[280px] flex flex-col rounded-sm transition-colors self-start ${
                      isOver ? 'bg-destructive/5 ring-1 ring-destructive/30' : 'bg-secondary/30'
                    }`}
                    onDragOver={e => handleDragOver(e, col.status)}
                    onDragLeave={handleDragLeave}
                    onDrop={() => handleDrop(col.status)}
                  >
                    <div className="px-3 py-2.5 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${col.color}`} />
                        <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                          {orderStatusLabels[col.status]}
                        </span>
                        <span className="ml-auto text-[10px] font-mono-data text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-sm">
                          {orders.length}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                      <AnimatePresence>
                        {orders.map(order => (
                          <KanbanCard
                            key={order.id}
                            order={order}
                            isSelected={selectedOrder?.id === order.id}
                            onDragStart={() => handleDragStart(order.id, col.status)}
                            onClick={() => setSelectedOrder(order)}
                          />
                        ))}
                      </AnimatePresence>
                      {orders.length === 0 && (
                        <div className="flex items-center justify-center h-20 text-xs text-muted-foreground/50 italic">
                          Leer
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <AnimatePresence>
              {selectedOrder && (
                <OrderDetailPanel
                  order={selectedOrder}
                  onClose={() => setSelectedOrder(null)}
                  onStatusChange={handleStatusChangeFromPanel}
                />
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function KanbanCard({ order, isSelected, onDragStart, onClick }: {
  order: Order;
  isSelected: boolean;
  onDragStart: () => void;
  onClick: () => void;
}) {
  const lead = mockLeads.find(l => l.id === order.lead_id);
  const vehicle = mockVehicles.find(v => v.id === order.vehicle_id);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="cursor-grab active:cursor-grabbing"
    >
      <DataCard className={`transition-all hover:shadow-md ${
        isSelected ? 'ring-1 ring-destructive border-destructive/50' : 'hover:border-muted-foreground/30'
      }`}>
        <div className="flex items-start gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground/40 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono-data text-muted-foreground">{order.id}</span>
            </div>
            {lead && (
              <div className="flex items-center gap-1 mb-1">
                <User className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-foreground truncate">{lead.name}</span>
              </div>
            )}
            {vehicle && (
              <div className="flex items-center gap-1 mb-1.5">
                <Car className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground truncate">{vehicle.brand} {vehicle.model}</span>
              </div>
            )}
            <div className="flex flex-wrap gap-1 mb-1.5">
              {order.items.map((item, i) => (
                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-sm bg-secondary text-secondary-foreground">{item}</span>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <Euro className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-bold font-mono-data text-foreground">€{order.total_eur.toLocaleString('de-DE')}</span>
            </div>
          </div>
        </div>
      </DataCard>
    </motion.div>
  );
}

function OrderDetailPanel({ order, onClose, onStatusChange }: {
  order: Order;
  onClose: () => void;
  onStatusChange: (order: Order, newStatus: OrderStatus) => void;
}) {
  const lead = mockLeads.find(l => l.id === order.lead_id);
  const vehicle = mockVehicles.find(v => v.id === order.vehicle_id);
  const dealer = order.dealer_id ? mockDealers.find(d => d.id === order.dealer_id) : undefined;
  const recommendation = mockRecommendations.find(r => r.id === order.recommendation_id);
  const createdDate = new Date(order.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const updatedDate = new Date(order.updated_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 380, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="shrink-0 overflow-hidden ml-3"
    >
      <div className="w-[380px] h-full border border-border rounded-sm bg-card overflow-y-auto">
        <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">{order.id}</span>
            <StatusBadge status={orderStatusDisplay[order.status]} label={orderStatusLabels[order.status]} />
          </div>
          <div className="flex items-center gap-1">
            <Link
              to={`/operations/orders/${order.id}`}
              className="p-1.5 rounded-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title="Vollständige Detailseite"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <button onClick={onClose} className="p-1.5 rounded-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-5">
          <div>
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Status ändern</h4>
            <div className="flex flex-wrap gap-1">
              {columns.map(col => (
                <button
                  key={col.status}
                  onClick={() => onStatusChange(order, col.status)}
                  className={`px-2.5 py-1.5 text-xs rounded-sm transition-all ${
                    order.status === col.status
                      ? 'bg-destructive text-destructive-foreground font-medium'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {orderStatusLabels[col.status]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Details</h4>
            <div className="space-y-2.5">
              <DetailRow icon={<Euro className="h-3.5 w-3.5" />} label="Gesamtsumme" value={`€${order.total_eur.toLocaleString('de-DE')}`} bold />
              <DetailRow icon={<Calendar className="h-3.5 w-3.5" />} label="Erstellt" value={createdDate} />
              <DetailRow icon={<Calendar className="h-3.5 w-3.5" />} label="Aktualisiert" value={updatedDate} />
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Positionen</h4>
            <div className="space-y-1.5">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Package className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {recommendation && (
            <div>
              <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Empfehlung</h4>
              <div className="p-2.5 rounded-sm bg-secondary/50 border border-border">
                <p className="text-sm font-medium text-foreground">{recommendation.stage_label}</p>
                <p className="text-xs text-destructive font-semibold mt-0.5">+{recommendation.delta_hp} PS · +{recommendation.delta_nm} Nm</p>
                <p className="text-xs text-muted-foreground">→ {recommendation.estimated_hp} PS / {recommendation.estimated_nm} Nm</p>
              </div>
            </div>
          )}

          <div>
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Verknüpfungen</h4>
            <div className="space-y-2">
              {lead && (
                <Link to={`/admin/leads/${lead.id}`} className="flex items-center gap-2 p-2 rounded-sm hover:bg-secondary/50 transition-colors">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-foreground">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">{lead.email}</p>
                  </div>
                </Link>
              )}
              {vehicle && (
                <Link to={`/admin/vehicles/${vehicle.id}`} className="flex items-center gap-2 p-2 rounded-sm hover:bg-secondary/50 transition-colors">
                  <Car className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-foreground">{vehicle.brand} {vehicle.model}</p>
                    <p className="text-xs text-muted-foreground">{vehicle.engine_code} · {vehicle.year}</p>
                  </div>
                </Link>
              )}
              {dealer && (
                <Link to={`/admin/partners/${dealer.id}`} className="flex items-center gap-2 p-2 rounded-sm hover:bg-secondary/50 transition-colors">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-foreground">{dealer.name}</p>
                    <p className="text-xs text-muted-foreground">{dealer.city}</p>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DetailRow({ icon, label, value, bold }: { icon: React.ReactNode; label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-muted-foreground mt-0.5">{icon}</span>
      <div>
        <span className="text-[10px] text-muted-foreground">{label}</span>
        <p className={`text-sm text-foreground ${bold ? 'font-bold font-mono-data' : ''}`}>{value}</p>
      </div>
    </div>
  );
}
