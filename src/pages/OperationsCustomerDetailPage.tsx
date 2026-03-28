import { useParams, Link } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, Mail, Phone, Car, Euro, Calendar, Edit2, Check, X } from 'lucide-react';
import { DataCard, StatusBadge } from '@/components/DataComponents';
import { mockLeads, mockVehicles, mockOrders, leadStatusLabels, orderStatusLabels } from '@/lib/mock-data';
import type { LeadStatus } from '@/types/models';
import { toast } from 'sonner';
import { PinToTabButton } from '@/components/PinToTabButton';

const leadStatusToDisplay: Record<LeadStatus, 'success' | 'processing' | 'new' | 'warning' | 'error'> = {
  new: 'new', qualified: 'processing', in_progress: 'processing', converted: 'success', lost: 'error',
};
const orderStatusDisplay: Record<string, 'new' | 'processing' | 'success' | 'warning'> = {
  draft: 'new', confirmed: 'processing', in_progress: 'processing', quality_check: 'warning', completed: 'success', delivered: 'success',
};
const allStatuses: LeadStatus[] = ['new', 'qualified', 'in_progress', 'converted', 'lost'];

export default function OperationsCustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const lead = mockLeads.find(l => l.id === id);

  const [status, setStatus] = useState<LeadStatus>(lead?.status ?? 'new');
  const [notes, setNotes] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');

  if (!lead) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Link to="/operations/customers" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Zurück zu Kunden
        </Link>
        <p className="text-muted-foreground">Kunde nicht gefunden.</p>
      </div>
    );
  }

  const vehicle = lead.vehicle_id ? mockVehicles.find(v => v.id === lead.vehicle_id) : undefined;
  const orders = mockOrders.filter(o => o.lead_id === lead.id);
  const totalRevenue = orders.reduce((sum, o) => sum + o.total_eur, 0);
  const createdDate = new Date(lead.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const handleStatusChange = (newStatus: LeadStatus) => {
    setStatus(newStatus);
    toast.success(`Status geändert: ${leadStatusLabels[newStatus]}`);
  };

  const handleSaveNotes = () => {
    setNotes(notesDraft);
    setEditingNotes(false);
    toast.success('Notizen gespeichert');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Link to="/operations/customers" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Zurück zu Kunden
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-base font-bold text-foreground">
                {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{lead.name}</h1>
              <p className="text-sm text-muted-foreground">{lead.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <PinToTabButton type="customer" label={lead.name} path={`/operations/customers/${lead.id}`} />
            <StatusBadge status={leadStatusToDisplay[status]} label={leadStatusLabels[status]} />
          </div>
        </div>

        {/* Status */}
        <DataCard className="mb-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Status ändern</h3>
          <div className="flex gap-1.5">
            {allStatuses.map(s => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={`px-3 py-1.5 text-xs rounded-sm transition-all ${
                  status === s ? 'bg-destructive text-destructive-foreground font-medium' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {leadStatusLabels[s]}
              </button>
            ))}
          </div>
        </DataCard>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Contact */}
          <DataCard>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Kontaktdaten</h3>
            <div className="space-y-3">
              <InfoRow icon={<User className="h-3.5 w-3.5" />} label="Name" value={lead.name} />
              <InfoRow icon={<Mail className="h-3.5 w-3.5" />} label="E-Mail" value={lead.email} />
              <InfoRow icon={<Phone className="h-3.5 w-3.5" />} label="Telefon" value={lead.phone || '–'} />
              <InfoRow icon={<Calendar className="h-3.5 w-3.5" />} label="Kunde seit" value={createdDate} />
            </div>
          </DataCard>

          {/* Vehicle */}
          <DataCard>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Fahrzeug</h3>
            {vehicle ? (
              <div className="space-y-3">
                <InfoRow icon={<Car className="h-3.5 w-3.5" />} label="Fahrzeug" value={`${vehicle.brand} ${vehicle.model}`} />
                <InfoRow label="Baujahr" value={String(vehicle.year)} />
                <InfoRow label="Motorcode" value={vehicle.engine_code} />
                <InfoRow label="Leistung" value={`${vehicle.stock_hp} PS / ${vehicle.stock_nm} Nm`} />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Kein Fahrzeug zugeordnet</p>
            )}
          </DataCard>

          {/* Revenue */}
          <DataCard>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Umsatz</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Euro className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold text-foreground">€{totalRevenue.toLocaleString('de-DE')}</span>
              </div>
              <p className="text-xs text-muted-foreground">{orders.length} Aufträge</p>
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
                <textarea value={notesDraft} onChange={e => setNotesDraft(e.target.value)} rows={3} placeholder="Notizen hinzufügen..."
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

        {/* Orders */}
        {orders.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Aufträge ({orders.length})</h3>
            <div className="space-y-2">
              {orders.map(order => (
                <Link to={`/operations/orders/${order.id}`} key={order.id}>
                  <DataCard className="hover:border-muted-foreground/30 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground font-mono-data">{order.id}</p>
                        <p className="text-xs text-muted-foreground">{order.items.join(', ')}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-foreground font-mono-data">€{order.total_eur.toLocaleString('de-DE')}</span>
                        <StatusBadge status={orderStatusDisplay[order.status]} label={orderStatusLabels[order.status]} />
                      </div>
                    </div>
                  </DataCard>
                </Link>
              ))}
            </div>
          </div>
        )}
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
