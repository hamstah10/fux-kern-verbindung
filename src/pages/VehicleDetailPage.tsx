import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Car, Cpu, Gauge, Wrench, FileText, Users } from 'lucide-react';
import { DataCard, StatusBadge } from '@/components/DataComponents';
import { mockVehicles, mockLeads, mockOrders, mockFiles, mockRecommendations, mockDynoSimulations, fileCategoryLabels, orderStatusLabels, leadStatusLabels } from '@/lib/mock-data';
import { getConfiguredVehicles } from '@/lib/configurator-store';
import type { LeadStatus, OrderStatus } from '@/types/models';
import { useMemo } from 'react';

const leadStatusToDisplay: Record<LeadStatus, 'success' | 'processing' | 'new' | 'warning' | 'error'> = {
  new: 'new', qualified: 'processing', in_progress: 'processing', converted: 'success', lost: 'error',
};

const orderStatusDisplay: Record<OrderStatus, 'new' | 'processing' | 'success' | 'warning'> = {
  draft: 'new', confirmed: 'processing', in_progress: 'processing', quality_check: 'warning', completed: 'success', delivered: 'success',
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

  const transmissionLabels: Record<string, string> = {
    manual: 'Schaltgetriebe', automatic: 'Automatik', dsg: 'DSG', dct: 'DCT', cvt: 'CVT',
  };
  const fuelLabels: Record<string, string> = {
    petrol: 'Benzin', diesel: 'Diesel', hybrid: 'Hybrid', electric: 'Elektrisch',
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
              {vehicle.vin && <InfoRow label="VIN" value={vehicle.vin} mono />}
              {vehicle.owner_id && <InfoRow label="Besitzer" value={vehicle.owner_id} mono />}
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

        {/* API Trace */}
        <div className="text-[11px] text-muted-foreground/60 font-mono space-y-0.5 mt-8">
          <p>GET /api/v1/vehicles/{vehicle.id} → 200 OK</p>
          <p>Response: {JSON.stringify({ id: vehicle.id, brand: vehicle.brand, model: vehicle.model, engine_code: vehicle.engine_code }).slice(0, 120)}</p>
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
