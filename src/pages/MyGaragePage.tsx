import { SectionHeader, DataCard, StatusBadge, StatCard } from '@/components/DataComponents';
import { mockVehicles, mockRecommendations, mockDynoSimulations, mockFiles, mockOrders, fileCategoryLabels, orderStatusLabels } from '@/lib/mock-data';
import { motion } from 'framer-motion';
import { Car, Sparkles, Activity, FileText, ShoppingCart, Download, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { OrderStatus } from '@/types/models';

const orderStatusDisplay: Record<OrderStatus, 'new' | 'processing' | 'success' | 'warning'> = {
  draft: 'new', confirmed: 'processing', in_progress: 'processing', quality_check: 'warning', completed: 'success', delivered: 'success',
};

export default function MyGaragePage() {
  const userVehicles = mockVehicles.filter(v => v.owner_id);
  const userFiles = mockFiles;
  const userOrders = mockOrders;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <SectionHeader title="MyGarage" sub="Deine Fahrzeuge, Empfehlungen und Auftragsstatus" />

      {/* Vehicle Cards */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Car className="h-4 w-4 text-destructive" /> Meine Fahrzeuge
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {userVehicles.map((v, i) => {
            const rec = mockRecommendations.find(r => r.vehicle_id === v.id);
            const dyno = mockDynoSimulations.find(d => d.vehicle_id === v.id);

            return (
              <motion.div key={v.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <DataCard className="glass">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{v.brand} {v.model}</h3>
                      <p className="text-xs text-muted-foreground">{v.year} · {v.engine_code} · {v.ecu_type}</p>
                    </div>
                    {rec && (
                      <StatusBadge status="success" label={`${rec.stage_label.split('–')[0].trim()}`} />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                    <div>
                      <span className="text-muted-foreground">Serie</span>
                      <p className="font-mono-data text-foreground">{v.stock_hp} PS / {v.stock_nm} Nm</p>
                    </div>
                    {rec && (
                      <div>
                        <span className="text-muted-foreground">Prognose</span>
                        <p className="font-mono-data text-destructive">{rec.estimated_hp} PS / {rec.estimated_nm} Nm</p>
                      </div>
                    )}
                  </div>

                  {dyno && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground border-t border-border pt-2">
                      <Activity className="h-3 w-3" />
                      <span>Peak: {dyno.peak_hp} PS @ {dyno.peak_hp_rpm} rpm</span>
                    </div>
                  )}
                </DataCard>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Orders */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-destructive" /> Auftragsstatus
        </h2>
        <div className="space-y-2">
          {userOrders.map((order, i) => {
            const vehicle = mockVehicles.find(v => v.id === order.vehicle_id);
            return (
              <motion.div key={order.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <DataCard>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground">{order.items.join(', ')}</p>
                      {vehicle && <p className="text-xs text-muted-foreground">{vehicle.brand} {vehicle.model}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono-data text-sm text-foreground">€{order.total_eur.toLocaleString('de-DE')}</span>
                      <StatusBadge status={orderStatusDisplay[order.status]} label={orderStatusLabels[order.status]} />
                    </div>
                  </div>
                </DataCard>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Files */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4 text-destructive" /> File Vault
        </h2>
        <DataCard>
          <div className="divide-y divide-border">
            {userFiles.map((file) => (
              <div key={file.id} className="flex items-center gap-3 py-2">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-foreground">{file.filename}</p>
                  <p className="text-xs text-muted-foreground font-mono-data">SHA256: {file.checksum_sha256.slice(0, 16)}... · {(file.size_bytes / 1024 / 1024).toFixed(1)} MB</p>
                </div>
                <span className="text-xs text-muted-foreground">{fileCategoryLabels[file.category]}</span>
                <button className="p-1.5 rounded-sm hover:bg-secondary transition-colors">
                  <Download className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        </DataCard>
      </div>

      {/* Recommendation History */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-destructive" /> Empfehlungshistorie
        </h2>
        {mockRecommendations.map((rec) => {
          const vehicle = mockVehicles.find(v => v.id === rec.vehicle_id);
          return (
            <DataCard key={rec.id} className="mb-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{rec.stage_label}</p>
                  {vehicle && <p className="text-xs text-muted-foreground">{vehicle.brand} {vehicle.model} · +{rec.delta_hp} PS / +{rec.delta_nm} Nm</p>}
                </div>
                <span className="text-xs text-muted-foreground">{new Date(rec.created_at).toLocaleDateString('de-DE')}</span>
              </div>
              <p className="text-[10px] text-muted-foreground/60 mt-1 italic">{rec.disclaimer}</p>
            </DataCard>
          );
        })}
      </div>
    </div>
  );
}
