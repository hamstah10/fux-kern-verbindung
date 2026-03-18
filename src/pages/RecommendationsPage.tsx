import { SectionHeader, DataCard, StatusBadge } from '@/components/DataComponents';
import { mockRecommendations, mockVehicles } from '@/lib/mock-data';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const riskDisplay: Record<string, { status: 'success' | 'warning' | 'error'; label: string }> = {
  low: { status: 'success', label: 'Geringes Risiko' },
  medium: { status: 'warning', label: 'Mittleres Risiko' },
  high: { status: 'error', label: 'Hohes Risiko' },
};

export default function RecommendationsPage() {
  return (
    <div className="p-6">
      <SectionHeader title="Empfehlungen" sub="AI-generierte Tuning-Empfehlungen – alle Werte sind fahrzeugspezifische Prognosen" />

      <div className="space-y-4">
        {mockRecommendations.map((rec, i) => {
          const vehicle = mockVehicles.find(v => v.id === rec.vehicle_id);
          const risk = riskDisplay[rec.risk_assessment];

          return (
            <motion.div key={rec.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <DataCard>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">{rec.stage_label}</h3>
                    </div>
                    {vehicle && (
                      <p className="text-xs text-muted-foreground">{vehicle.brand} {vehicle.model} · {vehicle.engine_code} · {vehicle.ecu_type}</p>
                    )}
                  </div>
                  <StatusBadge status={risk.status} label={risk.label} />
                </div>

                <div className="grid grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Prognose PS</p>
                    <p className="text-2xl font-bold font-mono-data text-foreground">{rec.estimated_hp}</p>
                    <p className="text-xs text-emerald-400">+{rec.delta_hp} PS</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Prognose Nm</p>
                    <p className="text-2xl font-bold font-mono-data text-foreground">{rec.estimated_nm}</p>
                    <p className="text-xs text-emerald-400">+{rec.delta_nm} Nm</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">Komponenten</p>
                    <div className="flex flex-wrap gap-1">
                      {rec.components.map(c => (
                        <span key={c} className="px-2 py-0.5 text-xs rounded-sm bg-secondary text-secondary-foreground">{c}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-2">{rec.description}</p>
                <p className="text-[10px] text-muted-foreground/60 italic">{rec.disclaimer}</p>

                <div className="mt-3 pt-2 border-t border-border flex items-center justify-between">
                  <span className="font-mono-data text-[10px] text-muted-foreground/40">{rec.id} · {new Date(rec.created_at).toLocaleString('de-DE')}</span>
                  <span className="font-mono-data text-[10px] text-muted-foreground/40">POST /api/v1/recommendations/generate → 201</span>
                </div>
              </DataCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
