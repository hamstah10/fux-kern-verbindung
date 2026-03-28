import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Zap, ArrowRight, Loader2, Shield, AlertTriangle, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateRecommendation, stageConfigs } from '@/lib/configurator-store';
import type { Vehicle } from '@/types/models';

const brands = ['Volkswagen', 'BMW', 'Mercedes-Benz', 'Audi', 'Porsche', 'Ford', 'Seat', 'Skoda'];
const transmissions: Vehicle['transmission'][] = ['manual', 'automatic', 'dsg', 'dct', 'cvt'];
const fuelTypes: Vehicle['fuel_type'][] = ['petrol', 'diesel', 'hybrid', 'electric'];

const transmissionLabels: Record<string, string> = {
  manual: 'Schaltgetriebe',
  automatic: 'Automatik',
  dsg: 'DSG',
  dct: 'DCT',
  cvt: 'CVT',
};

const fuelLabels: Record<string, string> = {
  petrol: 'Benzin',
  diesel: 'Diesel',
  hybrid: 'Hybrid',
  electric: 'Elektrisch',
};

const riskIcons: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  low: { icon: <Shield className="h-4 w-4" />, color: 'text-[hsl(var(--success))]', label: 'Niedrig' },
  medium: { icon: <AlertTriangle className="h-4 w-4" />, color: 'text-[hsl(var(--warning))]', label: 'Mittel' },
  high: { icon: <AlertTriangle className="h-4 w-4" />, color: 'text-[hsl(var(--destructive))]', label: 'Hoch' },
};

export default function ConfiguratorPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedStage, setSelectedStage] = useState(1);
  const [form, setForm] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    engine_code: '',
    ecu_type: '',
    transmission: 'manual' as Vehicle['transmission'],
    fuel_type: 'petrol' as Vehicle['fuel_type'],
    stock_hp: 0,
    stock_nm: 0,
  });

  const isValid =
    form.brand.trim() !== '' &&
    form.model.trim() !== '' &&
    form.engine_code.trim() !== '' &&
    form.stock_hp > 0 &&
    form.stock_nm > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800));

    const vehicle: Vehicle = {
      id: `v-${crypto.randomUUID().slice(0, 8)}`,
      created_at: new Date().toISOString(),
      ...form,
    };

    const result = generateRecommendation(vehicle, selectedStage);
    navigate(`/configurator/${result.id}`);
  };

  const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Preview estimates based on current HP/Nm input
  const previewHp = form.stock_hp > 0
    ? Math.round(form.stock_hp * stageConfigs[selectedStage - 1].hpMultiplier)
    : null;
  const previewNm = form.stock_nm > 0
    ? Math.round(form.stock_nm * stageConfigs[selectedStage - 1].nmMultiplier)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-lg font-bold tracking-tight text-foreground">
            Tuning<span className="text-primary">Fux</span>
          </a>
          <span className="text-xs text-muted-foreground font-mono tracking-wider uppercase">
            Konfigurator
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Car className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Fahrzeug konfigurieren</h1>
          </div>
          <p className="text-muted-foreground text-sm mb-8 max-w-xl">
            Gib deine Fahrzeugdaten ein, wähle deine Tuning-Stufe und erhalte eine vorläufige,
            fahrzeugspezifische Leistungsprognose – generiert durch unsere AI-Engine.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Stage Selector */}
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
                Tuning-Stufe wählen
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {stageConfigs.map((cfg) => {
                  const isActive = selectedStage === cfg.stageId;
                  const riskInfo = riskIcons[cfg.risk];
                  return (
                    <button
                      key={cfg.stageId}
                      type="button"
                      onClick={() => setSelectedStage(cfg.stageId)}
                      className={`relative text-left p-4 rounded-md border transition-all ${
                        isActive
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border bg-card hover:border-muted-foreground/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                          Stage {cfg.stageId}
                        </span>
                        <span className={`flex items-center gap-1 text-[10px] ${riskInfo.color}`}>
                          {riskInfo.icon}
                          {riskInfo.label}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-foreground mb-1">
                        {cfg.label.split(' – ')[1]}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        +{Math.round(cfg.hpMultiplier * 100)}% PS · +{Math.round(cfg.nmMultiplier * 100)}% Nm
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {cfg.components.slice(0, 3).map((c) => (
                          <span key={c} className="px-1.5 py-0.5 rounded-sm bg-secondary text-secondary-foreground text-[10px]">
                            {c}
                          </span>
                        ))}
                        {cfg.components.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded-sm bg-secondary text-secondary-foreground text-[10px]">
                            +{cfg.components.length - 3}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 1: Brand + Model + Year */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Marke" required>
                <select
                  value={form.brand}
                  onChange={(e) => updateField('brand', e.target.value)}
                  className="field-input"
                >
                  <option value="">Marke wählen</option>
                  {brands.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </Field>
              <Field label="Modell" required>
                <input
                  type="text"
                  value={form.model}
                  onChange={(e) => updateField('model', e.target.value)}
                  placeholder="z. B. Golf 8 GTI"
                  className="field-input"
                />
              </Field>
              <Field label="Baujahr">
                <input
                  type="number"
                  value={form.year}
                  onChange={(e) => updateField('year', Number(e.target.value))}
                  min={2000}
                  max={2026}
                  className="field-input"
                />
              </Field>
            </div>

            {/* Row 2: Engine + ECU */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Motorcode" required>
                <input
                  type="text"
                  value={form.engine_code}
                  onChange={(e) => updateField('engine_code', e.target.value)}
                  placeholder="z. B. DNUA, B58B30O1"
                  className="field-input font-mono"
                />
              </Field>
              <Field label="ECU-Typ">
                <input
                  type="text"
                  value={form.ecu_type}
                  onChange={(e) => updateField('ecu_type', e.target.value)}
                  placeholder="z. B. Bosch MG1CS111"
                  className="field-input font-mono"
                />
              </Field>
            </div>

            {/* Row 3: Transmission + Fuel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Getriebe">
                <select
                  value={form.transmission}
                  onChange={(e) => updateField('transmission', e.target.value as Vehicle['transmission'])}
                  className="field-input"
                >
                  {transmissions.map((t) => (
                    <option key={t} value={t}>{transmissionLabels[t]}</option>
                  ))}
                </select>
              </Field>
              <Field label="Kraftstoff">
                <select
                  value={form.fuel_type}
                  onChange={(e) => updateField('fuel_type', e.target.value as Vehicle['fuel_type'])}
                  className="field-input"
                >
                  {fuelTypes.map((f) => (
                    <option key={f} value={f}>{fuelLabels[f]}</option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Row 4: HP + NM */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Serien-PS" required>
                <input
                  type="number"
                  value={form.stock_hp || ''}
                  onChange={(e) => updateField('stock_hp', Number(e.target.value))}
                  placeholder="z. B. 245"
                  className="field-input"
                />
              </Field>
              <Field label="Serien-Nm" required>
                <input
                  type="number"
                  value={form.stock_nm || ''}
                  onChange={(e) => updateField('stock_nm', Number(e.target.value))}
                  placeholder="z. B. 370"
                  className="field-input"
                />
              </Field>
            </div>

            {/* Live Preview */}
            <AnimatePresence>
              {previewHp !== null && previewNm !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-4 p-3 rounded-md border border-border bg-card"
                >
                  <Gauge className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-xs text-muted-foreground">Stage {selectedStage} Prognose:</span>
                  <span className="text-sm font-bold text-primary">+{previewHp} PS</span>
                  <span className="text-sm font-bold text-[hsl(210_80%_55%)]">+{previewNm} Nm</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    → {form.stock_hp + previewHp} PS / {form.stock_nm + previewNm} Nm
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <AnimatePresence>
              <motion.div layout className="pt-4">
                <Button
                  type="submit"
                  disabled={!isValid || loading}
                  className="w-full md:w-auto gap-2"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      AI-Empfehlung wird generiert…
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Stage {selectedStage} Empfehlung generieren
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </motion.div>
            </AnimatePresence>
          </form>
        </motion.div>
      </main>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
        {label}
        {required && <span className="text-primary ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}
