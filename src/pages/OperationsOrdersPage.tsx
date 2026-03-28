import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { DataCard, StatusBadge } from '@/components/DataComponents';
import { mockOrders, mockLeads, mockVehicles, orderStatusLabels } from '@/lib/mock-data';
import type { OrderStatus } from '@/types/models';
import { PinToTabButton } from '@/components/PinToTabButton';

const orderStatusDisplay: Record<OrderStatus, 'new' | 'processing' | 'success' | 'warning'> = {
  draft: 'new', confirmed: 'processing', in_progress: 'processing', quality_check: 'warning', completed: 'success', delivered: 'success',
};

const allStatuses: Array<OrderStatus | 'all'> = ['all', 'draft', 'confirmed', 'in_progress', 'quality_check', 'completed', 'delivered'];

export default function OperationsOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = mockOrders.filter(order => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    if (search) {
      const lead = mockLeads.find(l => l.id === order.lead_id);
      const vehicle = mockVehicles.find(v => v.id === order.vehicle_id);
      const haystack = `${order.id} ${lead?.name ?? ''} ${vehicle?.brand ?? ''} ${vehicle?.model ?? ''} ${order.items.join(' ')}`.toLowerCase();
      if (!haystack.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold text-foreground mb-1">Aufträge</h1>
        <p className="text-sm text-muted-foreground mb-6">Alle Aufträge aus allen Portalen</p>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Suche nach ID, Kunde, Fahrzeug..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-sm bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex items-center gap-1">
            <Filter className="h-4 w-4 text-muted-foreground mr-1" />
            {allStatuses.map(s => (
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
            ))}
          </div>
        </div>

        {/* Order List */}
        <div className="space-y-2">
          {filtered.map((order, i) => {
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
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground italic py-8 text-center">Keine Aufträge gefunden</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
