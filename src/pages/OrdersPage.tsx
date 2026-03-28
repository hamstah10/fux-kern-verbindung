import { Link } from 'react-router-dom';
import { SectionHeader, DataCard, StatusBadge } from '@/components/DataComponents';
import { mockOrders, mockVehicles, mockLeads, orderStatusLabels } from '@/lib/mock-data';
import { motion } from 'framer-motion';
import type { OrderStatus } from '@/types/models';

const orderStatusDisplay: Record<OrderStatus, 'new' | 'processing' | 'success' | 'warning'> = {
  draft: 'new', confirmed: 'processing', in_progress: 'processing', quality_check: 'warning', completed: 'success', delivered: 'success',
};

export default function OrdersPage() {
  return (
    <div className="p-6">
      <SectionHeader title="Aufträge" sub="Auftragsmanagement und Statusverfolgung" />
      <div className="space-y-3">
        {mockOrders.map((order, i) => {
          const vehicle = mockVehicles.find(v => v.id === order.vehicle_id);
          const lead = mockLeads.find(l => l.id === order.lead_id);
          return (
            <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={`/admin/orders/${order.id}`}>
                <DataCard className="hover:border-muted-foreground/30 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{lead?.name || order.lead_id}</h3>
                      {vehicle && <p className="text-xs text-muted-foreground">{vehicle.brand} {vehicle.model}</p>}
                    </div>
                    <StatusBadge status={orderStatusDisplay[order.status]} label={orderStatusLabels[order.status]} />
                  </div>
                  <div className="flex items-center gap-4 text-xs mb-2">
                    <span className="text-muted-foreground">Summe: <span className="font-mono-data text-foreground">€{order.total_eur.toLocaleString('de-DE')}</span></span>
                    <span className="text-muted-foreground">Positionen: {order.items.join(', ')}</span>
                  </div>
                  <span className="font-mono-data text-[10px] text-muted-foreground/40">{order.id}</span>
                </DataCard>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
