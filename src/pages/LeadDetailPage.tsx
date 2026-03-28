import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, Mail, Phone, Car, Building2, Calendar, Tag, MessageSquare, Edit2, Check, X, Plus } from 'lucide-react';
import { SectionHeader, DataCard, StatusBadge } from '@/components/DataComponents';
import { mockLeads, mockVehicles, mockOrders, mockDealerRequests, mockFiles, mockRecommendations, sourceLabels, leadStatusLabels, orderStatusLabels, dealerRequestStatusLabels } from '@/lib/mock-data';
import type { LeadStatus } from '@/types/models';
import { toast } from 'sonner';

const leadStatusToDisplay: Record<LeadStatus, 'success' | 'processing' | 'new' | 'warning' | 'error'> = {
  new: 'new', qualified: 'processing', in_progress: 'processing', converted: 'success', lost: 'error',
};

const orderStatusDisplay: Record<string, 'new' | 'processing' | 'success' | 'warning'> = {
  draft: 'new', confirmed: 'processing', in_progress: 'processing', quality_check: 'warning', completed: 'success', delivered: 'success',
};

const drStatusDisplay: Record<string, 'new' | 'processing' | 'success' | 'error'> = {
  pending: 'new', accepted: 'processing', in_progress: 'processing', completed: 'success', rejected: 'error',
};

const allStatuses: LeadStatus[] = ['new', 'qualified', 'in_progress', 'converted', 'lost'];

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const leadData = mockLeads.find(l => l.id === id);

  const [status, setStatus] = useState<LeadStatus>(leadData?.status ?? 'new');
  const [notes, setNotes] = useState(leadData?.notes ?? '');
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(notes);
  const [editingContact, setEditingContact] = useState(false);
  const [contactName, setContactName] = useState(leadData?.name ?? '');
  const [contactEmail, setContactEmail] = useState(leadData?.email ?? '');
  const [contactPhone, setContactPhone] = useState(leadData?.phone ?? '');
  const [apiTrace, setApiTrace] = useState<string[]>([]);

  if (!leadData) {
    return (
      <div className="p-6">
        <Link to="/admin/leads" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Zurück zu Leads
        </Link>
        <p className="text-muted-foreground">Lead nicht gefunden.</p>
      </div>
    );
  }

  const vehicle = leadData.vehicle_id ? mockVehicles.find(v => v.id === leadData.vehicle_id) : undefined;
  const orders = mockOrders.filter(o => o.lead_id === leadData.id);
  const dealerRequests = mockDealerRequests.filter(dr => dr.lead_id === leadData.id);
  const recommendations = mockRecommendations.filter(r => r.lead_id === leadData.id);

  const createdDate = new Date(leadData.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const updatedDate = new Date(leadData.updated_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const handleStatusChange = (newStatus: LeadStatus) => {
    setStatus(newStatus);
    const trace = `PATCH /api/v1/leads/${leadData.id} → 200 OK { status: "${newStatus}" }`;
    setApiTrace(prev => [trace, ...prev]);
    toast.success(`Status geändert: ${leadStatusLabels[newStatus]}`);
  };

  const handleSaveNotes = () => {
    setNotes(notesDraft);
    setEditingNotes(false);
    const trace = `PATCH /api/v1/leads/${leadData.id} → 200 OK { notes: "${notesDraft.slice(0, 40)}..." }`;
    setApiTrace(prev => [trace, ...prev]);
    toast.success('Notizen gespeichert');
  };

  const handleSaveContact = () => {
    setEditingContact(false);
    const trace = `PATCH /api/v1/leads/${leadData.id} → 200 OK { name: "${contactName}", email: "${contactEmail}" }`;
    setApiTrace(prev => [trace, ...prev]);
    toast.success('Kontaktdaten aktualisiert');
  };

  return (
    <div className="p-6">
      <Link to="/admin/leads" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Zurück zu Leads
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground">{contactName}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{contactEmail}</p>
          </div>
          <StatusBadge status={leadStatusToDisplay[status]} label={leadStatusLabels[status]} />
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
                  status === s
                    ? 'bg-destructive text-destructive-foreground font-medium'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {leadStatusLabels[s]}
              </button>
            ))}
          </div>
        </DataCard>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Contact Info */}
          <DataCard>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kontaktdaten</h3>
              <button onClick={() => { setEditingContact(!editingContact); }} className="text-muted-foreground hover:text-foreground transition-colors">
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            </div>
            {editingContact ? (
              <div className="space-y-2">
                <input value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Name"
                  className="w-full px-2 py-1.5 text-sm rounded-sm bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
                <input value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="E-Mail"
                  className="w-full px-2 py-1.5 text-sm rounded-sm bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
                <input value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="Telefon"
                  className="w-full px-2 py-1.5 text-sm rounded-sm bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
                <div className="flex gap-1.5 pt-1">
                  <button onClick={handleSaveContact} className="px-3 py-1 text-xs rounded-sm bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors flex items-center gap-1">
                    <Check className="h-3 w-3" /> Speichern
                  </button>
                  <button onClick={() => setEditingContact(false)} className="px-3 py-1 text-xs rounded-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors flex items-center gap-1">
                    <X className="h-3 w-3" /> Abbrechen
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <InfoRow icon={<User className="h-3.5 w-3.5" />} label="Name" value={contactName} />
                <InfoRow icon={<Mail className="h-3.5 w-3.5" />} label="E-Mail" value={contactEmail} />
                <InfoRow icon={<Phone className="h-3.5 w-3.5" />} label="Telefon" value={contactPhone || '–'} />
                <InfoRow icon={<Calendar className="h-3.5 w-3.5" />} label="Erstellt" value={createdDate} />
                <InfoRow icon={<Calendar className="h-3.5 w-3.5" />} label="Aktualisiert" value={updatedDate} />
              </div>
            )}
          </DataCard>

          {/* Source Info */}
          <DataCard>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quelle & Tracking</h3>
            <div className="space-y-3">
              <InfoRow icon={<Tag className="h-3.5 w-3.5" />} label="Kanal" value={sourceLabels[leadData.source_metadata.type]} />
              {leadData.source_metadata.campaign && (
                <InfoRow icon={<Tag className="h-3.5 w-3.5" />} label="Kampagne" value={leadData.source_metadata.campaign} mono />
              )}
              {leadData.source_metadata.click_id && (
                <InfoRow icon={<Tag className="h-3.5 w-3.5" />} label="Click ID" value={leadData.source_metadata.click_id} mono />
              )}
              {leadData.source_metadata.referrer && (
                <InfoRow icon={<User className="h-3.5 w-3.5" />} label="Empfohlen von" value={leadData.source_metadata.referrer} />
              )}
              {leadData.assigned_dealer_id && (
                <InfoRow icon={<Building2 className="h-3.5 w-3.5" />} label="Händler" value={leadData.assigned_dealer_id} mono />
              )}
            </div>
          </DataCard>

          {/* Vehicle */}
          <DataCard>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Fahrzeug</h3>
            {vehicle ? (
              <div className="space-y-3">
                <InfoRow icon={<Car className="h-3.5 w-3.5" />} label="Fahrzeug" value={`${vehicle.brand} ${vehicle.model}`} />
                <InfoRow label="Baujahr" value={String(vehicle.year)} />
                <InfoRow label="Motorcode" value={vehicle.engine_code} mono />
                <InfoRow label="ECU" value={vehicle.ecu_type} mono />
                <InfoRow label="Leistung" value={`${vehicle.stock_hp} PS / ${vehicle.stock_nm} Nm`} />
                {vehicle.vin && <InfoRow label="VIN" value={vehicle.vin} mono />}
                <Link to={`/admin/vehicles/${vehicle.id}`} className="text-xs text-destructive hover:underline mt-2 block">
                  Fahrzeug-Details →
                </Link>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Kein Fahrzeug zugeordnet</p>
            )}
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
                <textarea
                  value={notesDraft}
                  onChange={e => setNotesDraft(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  placeholder="Notizen zum Lead hinzufügen..."
                  className="w-full px-3 py-2 text-sm rounded-sm bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                />
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

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Empfehlungen ({recommendations.length})</h3>
            <div className="space-y-2">
              {recommendations.map(rec => (
                <DataCard key={rec.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{rec.stage_label}</p>
                      <p className="text-xs text-muted-foreground">+{rec.delta_hp} PS · +{rec.delta_nm} Nm → {rec.estimated_hp} PS / {rec.estimated_nm} Nm</p>
                    </div>
                    <span className="font-mono-data text-[10px] text-muted-foreground/40">{rec.id}</span>
                  </div>
                </DataCard>
              ))}
            </div>
          </div>
        )}

        {/* Orders */}
        {orders.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Aufträge ({orders.length})</h3>
            <div className="space-y-2">
              {orders.map(order => (
                <Link to={`/admin/orders/${order.id}`} key={order.id}>
                  <DataCard className="hover:border-muted-foreground/30 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">€{order.total_eur.toLocaleString('de-DE')}</p>
                        <p className="text-xs text-muted-foreground">{order.items.join(', ')}</p>
                      </div>
                      <StatusBadge status={orderStatusDisplay[order.status]} label={orderStatusLabels[order.status]} />
                    </div>
                  </DataCard>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Dealer Requests */}
        {dealerRequests.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Werkstattanfragen ({dealerRequests.length})</h3>
            <div className="space-y-2">
              {dealerRequests.map(dr => (
                <Link to={`/admin/dealer-requests/${dr.id}`} key={dr.id}>
                  <DataCard className="hover:border-muted-foreground/30 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{dr.dealer_id}</p>
                        <p className="text-xs text-muted-foreground">Equipment: {dr.protocol_equipment.join(', ')} · ~{dr.estimated_duration_hours}h</p>
                      </div>
                      <StatusBadge status={drStatusDisplay[dr.status]} label={dealerRequestStatusLabels[dr.status]} />
                    </div>
                  </DataCard>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* API Trace */}
        <div className="text-[11px] text-muted-foreground/60 font-mono space-y-0.5 mt-8">
          <p>GET /api/v1/leads/{leadData.id} → 200 OK</p>
          {apiTrace.map((t, i) => <p key={i}>{t}</p>)}
        </div>
      </motion.div>
    </div>
  );
}

function InfoRow({ icon, label, value, mono }: { icon?: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      {icon && <span className="text-muted-foreground mt-0.5">{icon}</span>}
      <div>
        <span className="text-xs text-muted-foreground">{label}</span>
        <p className={`text-sm text-foreground ${mono ? 'font-mono-data' : ''}`}>{value}</p>
      </div>
    </div>
  );
}
