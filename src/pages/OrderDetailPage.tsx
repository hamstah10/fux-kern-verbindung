import { useParams, Link } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Calendar, Euro, Package, User, Car, Building2, Check, X, Edit2 } from 'lucide-react';
import { DataCard, StatusBadge } from '@/components/DataComponents';
import { mockOrders, mockVehicles, mockLeads, mockDealers, mockRecommendations, orderStatusLabels } from '@/lib/mock-data';
import type { OrderStatus } from '@/types/models';
import { toast } from 'sonner';
import ActivityTimeline, { type ActivityEntry } from '@/components/ActivityTimeline';

const orderStatusDisplay: Record<OrderStatus, 'new' | 'processing' | 'success' | 'warning'> = {
  draft: 'new', confirmed: 'processing', in_progress: 'processing', quality_check: 'warning', completed: 'success', delivered: 'success',
};

const statusSteps: OrderStatus[] = ['draft', 'confirmed', 'in_progress', 'quality_check', 'completed', 'delivered'];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const order = mockOrders.find(o => o.id === id);

  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order?.status ?? 'draft');
  const [notes, setNotes] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');
  const [apiTrace, setApiTrace] = useState<string[]>([]);
  const [activities, setActivities] = useState<ActivityEntry[]>(() => {
    const initial: ActivityEntry[] = [];
    if (order) {
      initial.push({ id: 'creation', timestamp: new Date(order.created_at), type: 'creation', label: 'Auftrag erstellt' });
    }
    return initial;
  });
  const addActivity = useCallback((entry: Omit<ActivityEntry, 'id' | 'timestamp'>) => {
    setActivities(prev => [{ ...entry, id: crypto.randomUUID(), timestamp: new Date() }, ...prev]);
  }, []);

  if (!order) {
    return (
      <div className="p-6">
        <Link to="/admin/orders" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Zurück zu Aufträge
        </Link>
        <p className="text-muted-foreground">Auftrag nicht gefunden.</p>
      </div>
    );
  }

  const vehicle = mockVehicles.find(v => v.id === order.vehicle_id);
  const lead = mockLeads.find(l => l.id === order.lead_id);
  const dealer = order.dealer_id ? mockDealers.find(d => d.id === order.dealer_id) : undefined;
  const recommendation = mockRecommendations.find(r => r.id === order.recommendation_id);
  const createdDate = new Date(order.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const updatedDate = new Date(order.updated_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const currentStepIndex = statusSteps.indexOf(currentStatus);

  const handleStatusChange = (newStatus: OrderStatus) => {
    const oldStatus = currentStatus;
    setCurrentStatus(newStatus);
    const trace = `PATCH /api/v1/orders/${order.id} → 200 OK { status: "${newStatus}" }`;
    setApiTrace(prev => [trace, ...prev]);
    addActivity({ type: 'status_change', label: 'Auftragsstatus geändert', oldValue: orderStatusLabels[oldStatus], newValue: orderStatusLabels[newStatus] });
    toast.success(`Auftragsstatus geändert: ${orderStatusLabels[newStatus]}`);
  };

  const handleSaveNotes = () => {
    setNotes(notesDraft);
    setEditingNotes(false);
    const trace = `PATCH /api/v1/orders/${order.id} → 200 OK { notes: "${notesDraft.slice(0, 40)}..." }`;
    setApiTrace(prev => [trace, ...prev]);
    addActivity({ type: 'note_edit', label: 'Notizen aktualisiert', detail: notesDraft.slice(0, 80) });
    toast.success('Notizen gespeichert');
  };

  return (
    <div className="p-6">
      <Link to="/admin/orders" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Zurück zu Aufträge
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart className="h-5 w-5 text-destructive" />
              <h1 className="text-xl font-bold text-foreground">Auftrag {order.id}</h1>
            </div>
            <p className="text-sm text-muted-foreground">{lead?.name || order.lead_id} · {vehicle ? `${vehicle.brand} ${vehicle.model}` : order.vehicle_id}</p>
          </div>
          <StatusBadge status={orderStatusDisplay[currentStatus]} label={orderStatusLabels[currentStatus]} />
        </div>

        {/* Status Pipeline – clickable */}
        <DataCard className="mb-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Status-Pipeline (klicken zum Ändern)</h3>
          <div className="flex items-center gap-1">
            {statusSteps.map((step, i) => (
              <button
                key={step}
                onClick={() => handleStatusChange(step)}
                className="flex-1 group cursor-pointer"
              >
                <div className={`h-2 rounded-sm transition-colors ${i <= currentStepIndex ? 'bg-destructive' : 'bg-secondary group-hover:bg-destructive/30'}`} />
                <p className={`text-[10px] mt-1 transition-colors ${i <= currentStepIndex ? 'text-foreground font-medium' : 'text-muted-foreground group-hover:text-foreground'}`}>
                  {orderStatusLabels[step]}
                </p>
              </button>
            ))}
          </div>
        </DataCard>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Order Info */}
          <DataCard>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Auftragsdetails</h3>
            <div className="space-y-3">
              <InfoRow icon={<Euro className="h-3.5 w-3.5" />} label="Gesamtsumme" value={`€${order.total_eur.toLocaleString('de-DE')}`} />
              <InfoRow icon={<Calendar className="h-3.5 w-3.5" />} label="Erstellt" value={createdDate} />
              <InfoRow icon={<Calendar className="h-3.5 w-3.5" />} label="Aktualisiert" value={updatedDate} />
            </div>
          </DataCard>

          {/* Items */}
          <DataCard>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Positionen</h3>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Package className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
            {recommendation && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">Empfehlung</p>
                <p className="text-sm font-medium text-foreground">{recommendation.stage_label}</p>
                <p className="text-xs text-destructive font-semibold">+{recommendation.delta_hp} PS · +{recommendation.delta_nm} Nm</p>
              </div>
            )}
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
                      <p className="text-xs text-muted-foreground">{dealer.city}</p>
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
                <textarea value={notesDraft} onChange={e => setNotesDraft(e.target.value)} rows={3} maxLength={1000} placeholder="Notizen zum Auftrag hinzufügen..."
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

        {/* Activity Timeline */}
        <ActivityTimeline activities={activities} />

        {/* API Trace */}
        <div className="text-[11px] text-muted-foreground/60 font-mono space-y-0.5 mt-8">
          <p>GET /api/v1/orders/{order.id} → 200 OK</p>
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
