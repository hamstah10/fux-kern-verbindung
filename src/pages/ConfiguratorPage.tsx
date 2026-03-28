import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateRecommendation } from '@/lib/configurator-store';
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

export default function ConfiguratorPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

    // Simulate API latency
    await new Promise((r) => setTimeout(r, 1800));

    const vehicle: Vehicle = {
      id: `v-${crypto.randomUUID().slice(0, 8)}`,
      created_at: new Date().toISOString(),
      ...form,
    };

    const result = generateRecommendation(vehicle);
    navigate(`/configurator/${result.id}`);
  };

  const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

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
            Gib deine Fahrzeugdaten ein und erhalte eine vorläufige, fahrzeugspezifische
            Leistungsprognose – generiert durch unsere AI-Engine.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                      Empfehlung generieren
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
