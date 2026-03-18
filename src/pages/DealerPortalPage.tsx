import { SectionHeader, DataCard, StatCard, StatusBadge } from '@/components/DataComponents';
import { mockDealers, mockDealerRequests, mockLeads, mockVehicles, mockFiles, dealerRequestStatusLabels, fileCategoryLabels } from '@/lib/mock-data';
import { motion } from 'framer-motion';
import { Building2, CheckCircle, FileText, Shield, Star } from 'lucide-react';
import type { DealerRequestStatus } from '@/types/models';

const drStatusDisplay: Record<DealerRequestStatus, 'new' | 'processing' | 'success' | 'error'> = {
  pending: 'new', accepted: 'processing', in_progress: 'processing', completed: 'success', rejected: 'error',
};

export default function DealerPortalPage() {
  const dealer = mockDealers[0]; // Simulated logged-in dealer
  const requests = mockDealerRequests.filter(r => r.dealer_id === dealer.id);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <SectionHeader title="Partner Hub" sub={`${dealer.name} – Werkstattportal`} />

      {/* Dealer Profile */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <DataCard className="glass">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">{dealer.name}</h3>
                {dealer.verified && <CheckCircle className="h-4 w-4 text-emerald-400" />}
              </div>
              <p className="text-sm text-muted-foreground">{dealer.city}, {dealer.region}</p>
            </div>
            <div className="flex items-center gap-1 text-primary">
              <Star className="h-4 w-4 fill-current" />
              <span className="font-bold">{dealer.rating}</span>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            {dealer.protocol_equipment.map(eq => (
              <span key={eq} className="px-2 py-0.5 text-xs rounded-sm bg-secondary text-secondary-foreground">{eq}</span>
            ))}
          </div>
        </DataCard>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard label="Offene Anfragen" value={requests.filter(r => r.status !== 'completed' && r.status !== 'rejected').length} delay={0} />
        <StatCard label="Abgeschlossen" value={dealer.completed_jobs} delay={0.05} />
        <StatCard label="Bewertung" value={dealer.rating} sub="von 5.0" delay={0.1} />
      </div>

      {/* Request Stack */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-foreground mb-3">Anfragen</h2>
        <div className="space-y-3">
          {requests.map((req, i) => {
            const lead = mockLeads.find(l => l.id === req.lead_id);
            const vehicle = mockVehicles.find(v => v.id === req.vehicle_id);
            return (
              <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <DataCard className="py-6">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{lead?.name || req.lead_id}</h3>
                      {vehicle && <p className="text-xs text-muted-foreground">{vehicle.brand} {vehicle.model} · {vehicle.engine_code}</p>}
                    </div>
                    <StatusBadge status={drStatusDisplay[req.status]} label={dealerRequestStatusLabels[req.status]} />
                  </div>
                  <div className="flex gap-4 text-xs mb-3">
                    <span className="text-muted-foreground">Equipment: {req.protocol_equipment.join(', ')}</span>
                    <span className="text-muted-foreground">~{req.estimated_duration_hours}h</span>
                  </div>
                  {req.notes && <p className="text-xs text-muted-foreground/80 italic mb-3">{req.notes}</p>}
                  {req.status === 'pending' && (
                    <button className="px-4 py-2 text-sm rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                      Angebot erstellen
                    </button>
                  )}
                </DataCard>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Files */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4" /> Dateien & Freigaben
        </h2>
        <DataCard>
          <div className="divide-y divide-border">
            {mockFiles.slice(0, 2).map(file => (
              <div key={file.id} className="flex items-center gap-3 py-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-foreground">{file.filename}</p>
                  <p className="text-xs text-muted-foreground font-mono-data">{fileCategoryLabels[file.category]}</p>
                </div>
                <Shield className="h-3 w-3 text-muted-foreground" />
              </div>
            ))}
          </div>
        </DataCard>
      </div>
    </div>
  );
}
