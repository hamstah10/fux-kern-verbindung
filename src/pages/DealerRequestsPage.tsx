import { Link } from 'react-router-dom';
import { SectionHeader, DataCard, StatusBadge } from '@/components/DataComponents';
import { mockDealerRequests, mockLeads, mockVehicles, mockDealers, dealerRequestStatusLabels } from '@/lib/mock-data';
import { motion } from 'framer-motion';
import type { DealerRequestStatus } from '@/types/models';

const drStatusDisplay: Record<DealerRequestStatus, 'new' | 'processing' | 'success' | 'error'> = {
  pending: 'new', accepted: 'processing', in_progress: 'processing', completed: 'success', rejected: 'error',
};

export default function DealerRequestsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <SectionHeader title="Dealer Requests" sub="Werkstattanfragen mit Equipment-Validierung und Statusverfolgung" />
      <div className="space-y-3">
        {mockDealerRequests.map((req, i) => {
          const lead = mockLeads.find(l => l.id === req.lead_id);
          const vehicle = mockVehicles.find(v => v.id === req.vehicle_id);
          const dealer = mockDealers.find(d => d.id === req.dealer_id);
          return (
            <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={`/admin/dealer-requests/${req.id}`}>
                <DataCard className="hover:border-muted-foreground/30 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{dealer?.name || req.dealer_id}</h3>
                      <p className="text-xs text-muted-foreground">{lead?.name} · {vehicle?.brand} {vehicle?.model}</p>
                    </div>
                    <StatusBadge status={drStatusDisplay[req.status]} label={dealerRequestStatusLabels[req.status]} />
                  </div>
                  <div className="flex gap-4 text-xs mb-2">
                    <span className="text-muted-foreground">Equipment: {req.protocol_equipment.join(', ')}</span>
                    <span className="text-muted-foreground">Dauer: ~{req.estimated_duration_hours}h</span>
                  </div>
                  {req.notes && <p className="text-xs text-muted-foreground/80 italic">{req.notes}</p>}
                  <div className="mt-2 pt-2 border-t border-border">
                    <span className="font-mono-data text-[10px] text-muted-foreground/40">{req.id}</span>
                  </div>
                </DataCard>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
