import { useParams, Link } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Car, Cpu, Gauge, Wrench, FileText, Edit2, Check, X } from 'lucide-react';
import { DataCard, StatusBadge } from '@/components/DataComponents';
import { mockVehicles, mockLeads, mockOrders, mockFiles, mockRecommendations, mockDynoSimulations, fileCategoryLabels, orderStatusLabels, leadStatusLabels } from '@/lib/mock-data';
import { getConfiguredVehicles } from '@/lib/configurator-store';
import type { LeadStatus, OrderStatus } from '@/types/models';
import { useMemo } from 'react';
import { toast } from 'sonner';
import ActivityTimeline, { type ActivityEntry } from '@/components/ActivityTimeline';

const leadStatusToDisplay: Record<LeadStatus, 'success' | 'processing' | 'new' | 'warning' | 'error'> = {
  new: 'new', qualified: 'processing', in_progress: 'processing', converted: 'success', lost: 'error',
};

const orderStatusDisplay: Record<OrderStatus, 'new' | 'processing' | 'success' | 'warning'> = {
  draft: 'new', confirmed: 'processing', in_progress: 'processing', quality_check: 'warning', completed: 'success', delivered: 'success',
};

const transmissionLabels: Record<string, string> = {
  manual: 'Schaltgetriebe', automatic: 'Automatik', dsg: 'DSG', dct: 'DCT', cvt: 'CVT',
};
const fuelLabels: Record<string, string> = {
  petrol: 'Benzin', diesel: 'Diesel', hybrid: 'Hybrid', electric: 'Elektrisch',
};

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();

  const allVehicles = useMemo(() => {
    const configured = getConfiguredVehicles();
    const existingIds = new Set(mockVehicles.map(v => v.id));
    const unique = configured.filter(v => !existingIds.has(v.id));
    return [...mockVehicles, ...unique];
  }, []);

  const vehicle = allVehicles.find(v => v.id === id);

  const [notes, setNotes] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');
  const [editingVin, setEditingVin] = useState(false);
  const [vinDraft, setVinDraft] = useState(vehicle?.vin ?? '');
  const [vin, setVin] = useState(vehicle?.vin ?? '');
  const [apiTrace, setApiTrace] = useState<string[]>([]);
  const [activities, setActivities] = useState<ActivityEntry[]>(() => {
    const initial: ActivityEntry[] = [];
    if (vehicle) {
      initial.push({ id: 'creation', timestamp: new Date(vehicle.created_at), type: 'creation', label: 'Fahrzeug erstellt' });
    }
    return initial;
  });
  const addActivity = useCallback((entry: Omit<ActivityEntry, 'id' | 'timestamp'>) => {
    setActivities(prev => [{ ...entry, id: crypto.randomUUID(), timestamp: new Date() }, ...prev]);
  }, []);

  if (!vehicle) {
    return (
      <div className="p-6">
        <Link to="/admin/vehicles" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Zurück zu Fahrzeuge
        </Link>
        <p className="text-muted-foreground">Fahrzeug nicht gefunden.</p>
      </div>
    );
  }

  const leads = mockLeads.filter(l => l.vehicle_id === vehicle.id);
  const orders = mockOrders.filter(o => o.vehicle_id === vehicle.id);
  const files = mockFiles.filter(f => f.vehicle_id === vehicle.id);
  const recommendations = mockRecommendations.filter(r => r.vehicle_id === vehicle.id);
  const dynoSims = mockDynoSimulations.filter(d => d.vehicle_id === vehicle.id);
  const createdDate = new Date(vehicle.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const handleSaveNotes = () => {
    setNotes(notesDraft);
    setEditingNotes(false);
    const trace = `PATCH /api/v1/vehicles/${vehicle.id} → 200 OK { notes: "${notesDraft.slice(0, 40)}..." }`;
    setApiTrace(prev => [trace, ...prev]);
    addActivity({ type: 'note_edit', label: 'Notizen aktualisiert', detail: notesDraft.slice(0, 80) });
    toast.success('Notizen gespeichert');
  };

  const handleSaveVin = () => {
    const oldVin = vin;
    setVin(vinDraft);
    setEditingVin(false);
    const trace = `PATCH /api/v1/vehicles/${vehicle.id} → 200 OK { vin: "${vinDraft}" }`;
    setApiTrace(prev => [trace, ...prev]);
    addActivity({ type: 'field_edit', label: 'VIN aktualisiert', oldValue: oldVin || '–', newValue: vinDraft });
    toast.success('VIN aktualisiert');
  };

  return (
    <div className="p-6">
      <Link to="/admin/vehicles" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Zurück zu Fahrzeuge
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Car className="h-5 w-5 text-destructive" />
              <h1 className="text-xl font-bold text-foreground">{vehicle.brand} {vehicle.model}</h1>
            </div>
            <p className="text-sm text-muted-foreground">{vehicle.year} · {vehicle.engine_code}</p>
          </div>
          <span className="font-mono-data text-xs text-muted-foreground">{vehicle.id}</span>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Technical Specs */}
          <DataCard>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Technische Daten</h3>
            <div className="space-y-3">
              <InfoRow icon={<Cpu className="h-3.5 w-3.5" />} label="ECU-Typ" value={vehicle.ecu_type} mono />
              <InfoRow icon={<Wrench className="h-3.5 w-3.5" />} label="Motorcode" value={vehicle.engine_code} mono />
              <InfoRow label="Getriebe" value={transmissionLabels[vehicle.transmission]} />
              <InfoRow label="Kraftstoff" value={fuelLabels[vehicle.fuel_type]} />
              <InfoRow label="Erstellt" value={createdDate} />
            </div>
          </DataCard>

          {/* Performance */}
          <DataCard>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Leistungsdaten</h3>
            <div className="space-y-3">
              <InfoRow icon={<Gauge className="h-3.5 w-3.5" />} label="Serien-PS" value={`${vehicle.stock_hp} PS`} />
              <InfoRow icon={<Gauge className="h-3.5 w-3.5" />} label="Serien-Nm" value={`${vehicle.stock_nm} Nm`} />
              {vehicle.owner_id && <InfoRow label="Besitzer" value={vehicle.owner_id} mono />}

              {/* Editable VIN */}
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground">VIN</span>
                  {editingVin ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <input value={vinDraft} onChange={e => setVinDraft(e.target.value)} maxLength={17} placeholder="WVWZZZ..."
                        className="flex-1 px-2 py-1 text-sm rounded-sm bg-input border border-border text-foreground font-mono-data focus:outline-none focus:ring-1 focus:ring-ring" />
                      <button onClick={handleSaveVin} className="text-destructive hover:text-destructive/80"><Check className="h-3.5 w-3.5" /></button>
                      <button onClick={() => setEditingVin(false)} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm text-foreground font-mono-data">{vin || '–'}</p>
                      <button onClick={() => { setVinDraft(vin); setEditingVin(true); }} className="text-muted-foreground hover:text-foreground"><Edit2 className="h-3 w-3" /></button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Dyno Simulations */}
            {dynoSims.length > 0 && (
              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Dyno-Simulationen</p>
                {dynoSims.map(sim => (
                  <div key={sim.id} className="mb-2">
                    <p className="text-sm font-medium text-foreground">{sim.label}</p>
                    <p className="text-xs text-muted-foreground">Peak: {sim.peak_hp} PS @ {sim.peak_hp_rpm} rpm · {sim.peak_nm} Nm @ {sim.peak_nm_rpm} rpm</p>
                  </div>
                ))}
              </div>
            )}
          </DataCard>

          {/* Recommendations */}
          <DataCard>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Empfehlungen</h3>
            {recommendations.length > 0 ? (
              <div className="space-y-3">
                {recommendations.map(rec => (
                  <div key={rec.id} className="border-b border-border pb-2 last:border-0 last:pb-0">
                    <p className="text-sm font-medium text-foreground">{rec.stage_label}</p>
                    <p className="text-xs text-destructive font-semibold">+{rec.delta_hp} PS · +{rec.delta_nm} Nm</p>
                    <p className="text-xs text-muted-foreground">→ {rec.estimated_hp} PS / {rec.estimated_nm} Nm</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {rec.components.map(c => (
                        <span key={c} className="px-1.5 py-0.5 rounded-sm bg-secondary text-secondary-foreground text-[10px]">{c}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Keine Empfehlungen vorhanden</p>
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
                <textarea value={notesDraft} onChange={e => setNotesDraft(e.target.value)} rows={3} maxLength={1000} placeholder="Notizen zum Fahrzeug hinzufügen..."
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

        {/* Linked Leads */}
        {leads.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Verknüpfte Leads ({leads.length})</h3>
            <div className="space-y-2">
              {leads.map(lead => (
                <Link to={`/admin/leads/${lead.id}`} key={lead.id}>
                  <DataCard className="hover:border-muted-foreground/30 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{lead.name}</p>
                        <p className="text-xs text-muted-foreground">{lead.email}</p>
                      </div>
                      <StatusBadge status={leadStatusToDisplay[lead.status]} label={leadStatusLabels[lead.status]} />
                    </div>
                  </DataCard>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Files */}
        {files.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Dateien ({files.length})</h3>
            <div className="space-y-2">
              {files.map(file => (
                <DataCard key={file.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground font-mono-data">{file.filename}</p>
                        <p className="text-xs text-muted-foreground">{fileCategoryLabels[file.category]} · {(file.size_bytes / 1024 / 1024).toFixed(1)} MB</p>
                      </div>
                    </div>
                    <span className="font-mono-data text-[10px] text-muted-foreground/40">{file.checksum_sha256}</span>
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

        {/* Activity Timeline */}
        <ActivityTimeline activities={activities} />

        {/* API Trace */}
        <div className="text-[11px] text-muted-foreground/60 font-mono space-y-0.5 mt-8">
          <p>GET /api/v1/vehicles/{vehicle.id} → 200 OK</p>
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
