import { useParams, Link } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Building2, CheckCircle, Star, MapPin, Wrench, Shield, BarChart3, Edit2, Check, X } from 'lucide-react';
import { DataCard, StatusBadge } from '@/components/DataComponents';
import { mockDealers, mockDealerRequests, mockLeads, mockVehicles, dealerRequestStatusLabels } from '@/lib/mock-data';
import type { DealerRequestStatus } from '@/types/models';
import { toast } from 'sonner';
import ActivityTimeline, { type ActivityEntry } from '@/components/ActivityTimeline';

const drStatusDisplay: Record<DealerRequestStatus, 'new' | 'processing' | 'success' | 'error'> = {
  pending: 'new', accepted: 'processing', in_progress: 'processing', completed: 'success', rejected: 'error',
};

export default function PartnerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dealer = mockDealers.find(d => d.id === id);

  const [notes, setNotes] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');
  const [apiTrace, setApiTrace] = useState<string[]>([]);
  const [activities, setActivities] = useState<ActivityEntry[]>(() => {
    const initial: ActivityEntry[] = [];
    if (dealer) {
      initial.push({ id: 'creation', timestamp: new Date(), type: 'creation', label: 'Partner erstellt' });
    }
    return initial;
  });
  const addActivity = useCallback((entry: Omit<ActivityEntry, 'id' | 'timestamp'>) => {
    setActivities(prev => [{ ...entry, id: crypto.randomUUID(), timestamp: new Date() }, ...prev]);
  }, []);

  if (!dealer) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Link to="/admin/partners" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Zurück zu Partner
        </Link>
        <p className="text-muted-foreground">Partner nicht gefunden.</p>
      </div>
    );
  }

  const requests = mockDealerRequests.filter(dr => dr.dealer_id === dealer.id);
  const completionRate = dealer.completed_jobs > 0
    ? Math.round((dealer.completed_jobs / (dealer.completed_jobs + dealer.active_requests)) * 100)
    : 0;

  const handleSaveNotes = () => {
    setNotes(notesDraft);
    setEditingNotes(false);
    const trace = `PATCH /api/v1/dealers/${dealer.id} → 200 OK { notes: "${notesDraft.slice(0, 40)}..." }`;
    setApiTrace(prev => [trace, ...prev]);
    addActivity({ type: 'note_edit', label: 'Notizen aktualisiert', detail: notesDraft.slice(0, 80) });
    toast.success('Notizen gespeichert');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Link to="/admin/partners" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Zurück zu Partner
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-5 w-5 text-destructive" />
              <h1 className="text-xl font-bold text-foreground">{dealer.name}</h1>
              {dealer.verified && <CheckCircle className="h-4 w-4 text-[hsl(var(--success))]" />}
            </div>
            <p className="text-sm text-muted-foreground">{dealer.city}, {dealer.region}</p>
          </div>
          <div className="flex items-center gap-1 text-[hsl(var(--warning))]">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-lg font-bold">{dealer.rating}</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          <StatMini label="Aktive Anfragen" value={String(dealer.active_requests)} />
          <StatMini label="Abgeschlossene Jobs" value={String(dealer.completed_jobs)} />
          <StatMini label="Abschlussrate" value={`${completionRate}%`} />
          <StatMini label="Bewertung" value={String(dealer.rating)} />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Info */}
          <DataCard>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Partner-Informationen</h3>
            <div className="space-y-3">
              <InfoRow icon={<Building2 className="h-3.5 w-3.5" />} label="Name" value={dealer.name} />
              <InfoRow icon={<MapPin className="h-3.5 w-3.5" />} label="Standort" value={`${dealer.city}, ${dealer.region}`} />
              <InfoRow icon={<Shield className="h-3.5 w-3.5" />} label="Verifiziert" value={dealer.verified ? 'Ja' : 'Nein'} />
              <InfoRow icon={<BarChart3 className="h-3.5 w-3.5" />} label="Abschlussrate" value={`${completionRate}%`} />
            </div>
          </DataCard>

          {/* Equipment */}
          <DataCard>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Protokoll-Equipment</h3>
            <div className="space-y-2">
              {dealer.protocol_equipment.map(eq => (
                <div key={eq} className="flex items-center gap-2">
                  <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="px-2.5 py-1 rounded-sm bg-secondary text-secondary-foreground text-xs font-medium">{eq}</span>
                </div>
              ))}
            </div>
          </DataCard>
        </div>

        {/* Notes */}
        <DataCard className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notizen</h3>
            {!editingNotes && (
              <button onClick={() => { setNotesDraft(notes); setEditingNotes(true); }} className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-xs">
                <Edit2 className="h-3 w-3" /> {notes ? 'Bearbeiten' : 'Hinzufügen'}
              </button>
            )}
          </div>
          <AnimatePresence mode="wait">
            {editingNotes ? (
              <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <textarea value={notesDraft} onChange={e => setNotesDraft(e.target.value)} rows={3} maxLength={1000} placeholder="Notizen zum Partner hinzufügen..."
                  className="w-full px-3 py-2 text-sm rounded-sm bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
                <div className="flex gap-1.5 mt-2">
                  <button onClick={handleSaveNotes} className="px-3 py-1.5 text-xs rounded-sm bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors flex items-center gap-1">
                    <Check className="h-3 w-3" /> Speichern
                  </button>
                  <button onClick={() => setEditingNotes(false)} className="px-3 py-1.5 text-xs rounded-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors flex items-center gap-1">
                    <X className="h-3 w-3" /> Abbrechen
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-sm text-foreground">{notes || <span className="text-muted-foreground italic">Keine Notizen vorhanden</span>}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </DataCard>

        {/* Dealer Requests */}
        {requests.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Werkstattanfragen ({requests.length})</h3>
            <div className="space-y-2">
              {requests.map(req => {
                const lead = mockLeads.find(l => l.id === req.lead_id);
                const vehicle = mockVehicles.find(v => v.id === req.vehicle_id);
                return (
                  <Link to={`/admin/dealer-requests/${req.id}`} key={req.id}>
                    <DataCard className="hover:border-muted-foreground/30 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">{lead?.name || req.lead_id}</p>
                          <p className="text-xs text-muted-foreground">
                            {vehicle ? `${vehicle.brand} ${vehicle.model}` : req.vehicle_id} · Equipment: {req.protocol_equipment.join(', ')}
                          </p>
                        </div>
                        <StatusBadge status={drStatusDisplay[req.status]} label={dealerRequestStatusLabels[req.status]} />
                      </div>
                    </DataCard>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Activity Timeline */}
        <ActivityTimeline activities={activities} />

        {/* API Trace */}
        <div className="text-[11px] text-muted-foreground/60 font-mono space-y-0.5 mt-8">
          <p>GET /api/v1/dealers/{dealer.id} → 200 OK</p>
          {apiTrace.map((t, i) => <p key={i}>{t}</p>)}
        </div>
      </motion.div>
    </div>
  );
}

function StatMini({ label, value }: { label: string; value: string }) {
  return (
    <DataCard>
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold font-mono-data text-foreground">{value}</p>
    </DataCard>
  );
}

function InfoRow({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      {icon && <span className="text-muted-foreground mt-0.5">{icon}</span>}
      <div>
        <span className="text-xs text-muted-foreground">{label}</span>
        <p className="text-sm text-foreground">{value}</p>
      </div>
    </div>
  );
}
