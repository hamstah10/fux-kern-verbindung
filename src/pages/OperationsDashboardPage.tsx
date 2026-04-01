import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardList, Clock, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { DataCard, StatusBadge } from '@/components/DataComponents';
import { mockOrders, mockDealerRequests, orderStatusLabels, dealerRequestStatusLabels } from '@/lib/mock-data';
import type { OrderStatus } from '@/types/models';

const orderStatusDisplay: Record<OrderStatus, 'new' | 'processing' | 'success' | 'warning' | 'error'> = {
  received: 'new', in_progress: 'processing', on_hold: 'warning', parked: 'warning', completed: 'success', rejected: 'error',
};

const drStatusDisplay: Record<string, 'new' | 'processing' | 'success' | 'error'> = {
  pending: 'new', accepted: 'processing', in_progress: 'processing', completed: 'success', rejected: 'error',
};

export default function OperationsDashboardPage() {
  const activeOrders = mockOrders.filter(o => !['completed', 'delivered'].includes(o.status));
  const completedOrders = mockOrders.filter(o => ['completed', 'delivered'].includes(o.status));
  const activeRequests = mockDealerRequests.filter(r => !['completed', 'rejected'].includes(r.status));

  const stats = [
    { label: 'Offene Aufträge', value: activeOrders.length, icon: ClipboardList, color: 'text-[hsl(var(--processing))]' },
    { label: 'In Qualitätsprüfung', value: mockOrders.filter(o => o.status === 'quality_check').length, icon: AlertTriangle, color: 'text-[hsl(var(--warning))]' },
    { label: 'Abgeschlossen', value: completedOrders.length, icon: CheckCircle, color: 'text-[hsl(var(--success))]' },
    { label: 'Werkstatt-Anfragen', value: activeRequests.length, icon: Clock, color: 'text-destructive' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold text-foreground mb-1">Operations Center</h1>
        <p className="text-sm text-muted-foreground mb-6">Alle Aufträge und Werkstattanfragen auf einen Blick</p>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <DataCard>
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="text-3xl font-bold font-mono-data text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </DataCard>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Active Orders */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-foreground">Aktive Aufträge ({activeOrders.length})</h2>
              <Link to="/operations/orders" className="text-xs text-destructive hover:underline flex items-center gap-1">
                Alle anzeigen <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {activeOrders.slice(0, 6).map(order => (
                <Link to={`/operations/orders/${order.id}`} key={order.id}>
                  <DataCard className="hover:border-muted-foreground/30 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{order.id}</p>
                        <p className="text-xs text-muted-foreground">{order.items.join(', ')} · €{order.total_eur.toLocaleString('de-DE')}</p>
                      </div>
                      <StatusBadge status={orderStatusDisplay[order.status]} label={orderStatusLabels[order.status]} />
                    </div>
                  </DataCard>
                </Link>
              ))}
              {activeOrders.length === 0 && (
                <p className="text-sm text-muted-foreground italic">Keine aktiven Aufträge</p>
              )}
            </div>
          </div>

          {/* Active Dealer Requests */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-foreground">Werkstattanfragen ({activeRequests.length})</h2>
            </div>
            <div className="space-y-2">
              {activeRequests.slice(0, 6).map(req => (
                <DataCard key={req.id} className="hover:border-muted-foreground/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{req.id}</p>
                      <p className="text-xs text-muted-foreground">Equipment: {req.protocol_equipment.join(', ')} · ~{req.estimated_duration_hours}h</p>
                    </div>
                    <StatusBadge status={drStatusDisplay[req.status]} label={dealerRequestStatusLabels[req.status]} />
                  </div>
                </DataCard>
              ))}
              {activeRequests.length === 0 && (
                <p className="text-sm text-muted-foreground italic">Keine offenen Anfragen</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
