import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, User, Car, Euro } from 'lucide-react';
import { DataCard, StatusBadge } from '@/components/DataComponents';
import { mockOrders, mockLeads, mockVehicles, orderStatusLabels } from '@/lib/mock-data';
import type { Order, OrderStatus } from '@/types/models';
import { toast } from 'sonner';

const columns: { status: OrderStatus; color: string }[] = [
  { status: 'draft', color: 'bg-muted-foreground' },
  { status: 'confirmed', color: 'bg-[hsl(var(--processing))]' },
  { status: 'in_progress', color: 'bg-[hsl(var(--processing))]' },
  { status: 'quality_check', color: 'bg-[hsl(var(--warning))]' },
  { status: 'completed', color: 'bg-[hsl(var(--success))]' },
  { status: 'delivered', color: 'bg-[hsl(var(--success))]' },
];

const statusDisplay: Record<OrderStatus, 'new' | 'processing' | 'success' | 'warning'> = {
  draft: 'new', confirmed: 'processing', in_progress: 'processing', quality_check: 'warning', completed: 'success', delivered: 'success',
};

export default function OperationsKanbanPage() {
  const [ordersByStatus, setOrdersByStatus] = useState<Record<OrderStatus, Order[]>>(() => {
    const grouped: Record<OrderStatus, Order[]> = {
      draft: [], confirmed: [], in_progress: [], quality_check: [], completed: [], delivered: [],
    };
    for (const order of mockOrders) {
      grouped[order.status].push({ ...order });
    }
    return grouped;
  });

  const dragItem = useRef<{ orderId: string; fromStatus: OrderStatus } | null>(null);
  const [dragOverCol, setDragOverCol] = useState<OrderStatus | null>(null);

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
      const to = [...prev[toStatus], { ...moved, status: toStatus }];
      return { ...prev, [fromStatus]: from, [toStatus]: to };
    });

    toast.success(`Auftrag ${orderId} → ${orderStatusLabels[toStatus]}`);
    dragItem.current = null;
  }, []);

  const totalOrders = Object.values(ordersByStatus).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="p-6 h-[calc(100vh-3.5rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kanban Board</h1>
          <p className="text-sm text-muted-foreground">{totalOrders} Aufträge · Drag & Drop zum Verschieben</p>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 flex gap-3 overflow-x-auto pb-2 min-h-0">
        {columns.map(col => {
          const orders = ordersByStatus[col.status];
          const isOver = dragOverCol === col.status;

          return (
            <div
              key={col.status}
              className={`flex-1 min-w-[220px] max-w-[300px] flex flex-col rounded-sm transition-colors ${
                isOver ? 'bg-destructive/5 ring-1 ring-destructive/30' : 'bg-secondary/30'
              }`}
              onDragOver={e => handleDragOver(e, col.status)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(col.status)}
            >
              {/* Column Header */}
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

              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                <AnimatePresence>
                  {orders.map(order => (
                    <KanbanCard
                      key={order.id}
                      order={order}
                      onDragStart={() => handleDragStart(order.id, col.status)}
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
    </div>
  );
}

function KanbanCard({ order, onDragStart }: { order: Order; onDragStart: () => void }) {
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
      className="cursor-grab active:cursor-grabbing"
    >
      <DataCard className="hover:border-muted-foreground/30 transition-all hover:shadow-md">
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
