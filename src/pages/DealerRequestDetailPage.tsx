import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Shield, Calendar, Clock, Wrench, User, Car, Building2, MessageSquare, Edit2, Check, X } from 'lucide-react';
import { DataCard, StatusBadge } from '@/components/DataComponents';
import { mockDealerRequests, mockLeads, mockVehicles, mockDealers, dealerRequestStatusLabels } from '@/lib/mock-data';
import type { DealerRequestStatus } from '@/types/models';
import { toast } from 'sonner';

const drStatusDisplay: Record<DealerRequestStatus, 'new' | 'processing' | 'success' | 'error'> = {
  pending: 'new', accepted: 'processing', in_progress: 'processing', completed: 'success', rejected: 'error',
};

const allStatuses: DealerRequestStatus[] = ['pending', 'accepted', 'in_progress', 'completed', 'rejected'];
const statusSteps: DealerRequestStatus[] = ['pending', 'accepted', 'in_progress', 'completed'];

export default function DealerRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const request = mockDealerRequests.find(r => r.id === id);

  const [currentStatus, setCurrentStatus] = useState<DealerRequestStatus>(request?.status ?? 'pending');
  const [notes, setNotes] = useState(request?.notes ?? '');
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(notes);
  const [estimatedHours, setEstimatedHours] = useState(request?.estimated_duration_hours ?? 0);
  const [editingHours, setEditingHours] = useState(false);
  const [hoursDraft, setHoursDraft] = useState(String(estimatedHours));
  const [apiTrace, setApiTrace] = useState<string[]>([]);

  if (!request) {
    return (
      <div className="p-6">
        <Link to="/admin/dealer-requests" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Zurück zu Dealer Requests
        </Link>
        <p className="text-muted-foreground">Anfrage nicht gefunden.</p>
      </div>
    );
  }

  const lead = mockLeads.find(l => l.id === request.lead_id);
  const vehicle = mockVehicles.find(v => v.id === request.vehicle_id);
  const dealer = mockDealers.find(d => d.id === request.dealer_id);
  const createdDate = new Date(request.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const updatedDate = new Date(request.updated_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const currentStepIndex = currentStatus === 'rejected' ? -1 : statusSteps.indexOf(currentStatus);

  const handleStatusChange = (newStatus: DealerRequestStatus) => {
    setCurrentStatus(newStatus);
    const trace = `PATCH /api/v1/dealer-requests/${request.id} → 200 OK { status: "${newStatus}" }`;
    setApiTrace(prev => [trace, ...prev]);
    toast.success(`Status geändert: ${dealerRequestStatusLabels[newStatus]}`);
  };

  const handleSaveNotes = () => {
    setNotes(notesDraft);
    setEditingNotes(false);
    const trace = `PATCH /api/v1/dealer-requests/${request.id} → 200 OK { notes: "${notesDraft.slice(0, 40)}..." }`;
    setApiTrace(prev => [trace, ...prev]);
    toast.success('Notizen gespeichert');
  };

  const handleSaveHours = () => {
    const parsed = parseFloat(hoursDraft);
    if (!isNaN(parsed) && parsed > 0) {
      setEstimatedHours(parsed);
      setEditingHours(false);
      const trace = `PATCH /api/v1/dealer-requests/${request.id} → 200 OK { estimated_duration_hours: ${parsed} }`;
      setApiTrace(prev => [trace, ...prev]);
      toast.success('Geschätzte Dauer aktualisiert');
    }
  };

  return (
    <div className="p-6">
      <Link to="/admin/dealer-requests" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Zurück zu Dealer Requests
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-5 w-5 text-destructive" />
              <h1 className="text-xl font-bold text-foreground">Werkstattanfrage {request.id}</h1>
            </div>
            <p className="text-sm text-muted-foreground">{dealer?.name || request.dealer_id}</p>
          </div>
          <StatusBadge status={drStatusDisplay[currentStatus]} label={dealerRequestStatusLabels[currentStatus]} />
        </div>

        {/* Status Changer */}
        <DataCard className="mb-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Status ändern</h3>
          <div className="flex gap-1.5">
            {allStatuses.map(s => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={`px-3 py-1.5 text-xs rounded-sm transition-all ${
                  currentStatus === s
                    ? s === 'rejected' ? 'bg-destructive/20 text-destructive font-medium ring-1 ring-destructive' : 'bg-destructive text-destructive-foreground font-medium'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {dealerRequestStatusLabels[s]}
              </button>
            ))}
          </div>
        </DataCard>

        {/* Status Pipeline */}
        {currentStatus !== 'rejected' && (
          <DataCard className="mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Pipeline-Fortschritt</h3>
            <div className="flex items-center gap-1">
              {statusSteps.map((step, i) => (
                <div key={step} className="flex-1">
                  <div className={`h-2 rounded-sm ${i <= currentStepIndex ? 'bg-destructive' : 'bg-secondary'}`} />
                  <p className={`text-[10px] mt-1 ${i <= currentStepIndex ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    {dealerRequestStatusLabels[step]}
                  </p>
                </div>
              ))}
            </div>
          </DataCard>
        )}

        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Request Details */}
          <DataCard>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Anfrage-Details</h3>
            <div className="space-y-3">
              <InfoRow icon={<Calendar className="h-3.5 w-3.5" />} label="Erstellt" value={createdDate} />
              <InfoRow icon={<Calendar className="h-3.5 w-3.5" />} label="Aktualisiert" value={updatedDate} />
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground mt-0.5"><Clock className="h-3.5 w-3.5" /></span>
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground">Geschätzte Dauer</span>
                  {editingHours ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <input value={hoursDraft} onChange={e => setHoursDraft(e.target.value)} type="number" min="0.5" step="0.5"
                        className="w-20 px-2 py-1 text-sm rounded-sm bg-input border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
                      <span className="text-xs text-muted-foreground">Stunden</span>
                      <button onClick={handleSaveHours} className="text-destructive hover:text-destructive/80"><Check className="h-3.5 w-3.5" /></button>
                      <button onClick={() => setEditingHours(false)} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm text-foreground">~{estimatedHours} Stunden</p>
                      <button onClick={() => { setHoursDraft(String(estimatedHours)); setEditingHours(true); }} className="text-muted-foreground hover:text-foreground"><Edit2 className="h-3 w-3" /></button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DataCard>

          {/* Equipment */}
          <DataCard>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Protokoll-Equipment</h3>
            <div className="space-y-2">
              {request.protocol_equipment.map(eq => (
                <div key={eq} className="flex items-center gap-2">
                  <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="px-2.5 py-1 rounded-sm bg-secondary text-secondary-foreground text-xs font-medium">{eq}</span>
                </div>
              ))}
            </div>
          </DataCard>

          {/* Linked Entities */}
          <DataCard>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Verknüpfungen</h3>
            <div className="space-y-3">
              {lead && (
                <Link to={`/admin/leads/${lead.id}`} className="block hover:bg-muted/20 rounded-sm p-1.5 -m-1.5 transition-colors">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-foreground">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">{lead.email}</p>
                    </div>
                  </div>
                </Link>
              )}
              {vehicle && (
                <Link to={`/admin/vehicles/${vehicle.id}`} className="block hover:bg-muted/20 rounded-sm p-1.5 -m-1.5 transition-colors">
                  <div className="flex items-center gap-2">
                    <Car className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-foreground">{vehicle.brand} {vehicle.model}</p>
                      <p className="text-xs text-muted-foreground">{vehicle.engine_code} · {vehicle.year}</p>
                    </div>
                  </div>
                </Link>
              )}
              {dealer && (
                <Link to={`/admin/partners/${dealer.id}`} className="block hover:bg-muted/20 rounded-sm p-1.5 -m-1.5 transition-colors">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-foreground">{dealer.name}</p>
                      <p className="text-xs text-muted-foreground">{dealer.city}, {dealer.region}</p>
                    </div>
                  </div>
                </Link>
              )}
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
                <textarea value={notesDraft} onChange={e => setNotesDraft(e.target.value)} rows={3} maxLength={1000} placeholder="Notizen zur Anfrage hinzufügen..."
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

        {/* API Trace */}
        <div className="text-[11px] text-muted-foreground/60 font-mono space-y-0.5 mt-8">
          <p>GET /api/v1/dealer-requests/{request.id} → 200 OK</p>
          {apiTrace.map((t, i) => <p key={i}>{t}</p>)}
        </div>
      </motion.div>
    </div>
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
