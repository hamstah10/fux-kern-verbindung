import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionHeader, StatCard, StatusBadge, DataCard, ErrorState, LoadingBar } from '@/components/DataComponents';
import { mockApiEvents, mockLeads, mockOrders, mockDealerRequests, sourceLabels, leadStatusLabels } from '@/lib/mock-data';
import type { ApiEvent, LeadStatus } from '@/types/models';
import { Users, ShoppingCart, TrendingUp, AlertTriangle } from 'lucide-react';

const statusMap: Record<string, 'success' | 'processing' | 'error' | 'warning'> = {
  success: 'success', processing: 'processing', error: 'error', warning: 'warning',
};

const leadStatusToDisplay: Record<LeadStatus, 'success' | 'processing' | 'new' | 'warning' | 'error'> = {
  new: 'new', qualified: 'processing', in_progress: 'processing', converted: 'success', lost: 'error',
};

export default function AdminDashboard() {
  const [showLoading, setShowLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  const activeLeads = mockLeads.filter(l => l.status !== 'lost' && l.status !== 'converted').length;
  const openRequests = mockDealerRequests.filter(r => r.status !== 'completed' && r.status !== 'rejected').length;
  const revenue = mockOrders.reduce((sum, o) => sum + o.total_eur, 0);

  return (
    <div className="p-6">
      {showLoading && <LoadingBar />}

      <SectionHeader
        title="Command Center"
        sub="Echtzeit-Überblick aller Operationen und API-Aktivitäten"
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <StatCard label="Aktive Leads" value={activeLeads} sub="Letzte 30 Tage" delay={0} />
        <StatCard label="Offene Requests" value={openRequests} sub="Werkstattanfragen" delay={0.05} />
        <StatCard label="Konversionsrate" value="42%" sub="+8% vs. Vormonat" delay={0.1} />
        <StatCard label="Umsatz" value={`€${revenue.toLocaleString('de-DE')}`} sub="Laufendes Quartal" delay={0.15} />
      </div>

      {/* Demo Controls */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => { setShowLoading(true); setTimeout(() => setShowLoading(false), 1500); }}
          className="px-3 py-1.5 text-xs rounded-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
          Synchronisiere Daten...
        </button>
        <button onClick={() => setShowError(!showError)}
          className="px-3 py-1.5 text-xs rounded-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
          {showError ? 'Fehler ausblenden' : 'Validation Error anzeigen'}
        </button>
      </div>

      <AnimatePresence>
        {showError && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4">
            <ErrorState
              code="ERR_VIN_INVALID: Checksum mismatch at position 9"
              message="Die VIN 'WVWZZZ3CZWE12345X' konnte nicht validiert werden. Prüfziffer stimmt nicht mit ISO 3779 überein."
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-3 gap-4">
        {/* Event Feed */}
        <div className="col-span-2">
          <DataCard>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-foreground">Live API-Feed</h2>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Echtzeit
              </span>
            </div>
            <div className="space-y-1">
              {mockApiEvents.map((event, i) => (
                <EventRow key={event.id} event={event} index={i} />
              ))}
            </div>
          </DataCard>
        </div>

        {/* Lead Pipeline */}
        <div>
          <DataCard>
            <h2 className="text-sm font-semibold text-foreground mb-3">Lead Pipeline</h2>
            <div className="space-y-2">
              {mockLeads.slice(0, 5).map((lead) => (
                <div key={lead.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm text-foreground">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">{sourceLabels[lead.source_metadata.type]}</p>
                  </div>
                  <StatusBadge
                    status={leadStatusToDisplay[lead.status]}
                    label={leadStatusLabels[lead.status]}
                  />
                </div>
              ))}
            </div>
          </DataCard>
        </div>
      </div>
    </div>
  );
}

function EventRow({ event, index }: { event: ApiEvent; index: number }) {
  const time = new Date(event.timestamp);
  const timeStr = time.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="flex items-center gap-3 py-1.5 px-2 rounded-sm hover:bg-muted/30 transition-colors"
    >
      <span className="font-mono-data text-[10px] text-muted-foreground/60 w-16 shrink-0">{timeStr}</span>
      <StatusBadge status={statusMap[event.status] || 'success'} label={event.type} />
      <span className="text-xs text-muted-foreground truncate flex-1">{event.description}</span>
      <span className="font-mono-data text-[10px] text-muted-foreground/40">{event.entity_id}</span>
    </motion.div>
  );
}
