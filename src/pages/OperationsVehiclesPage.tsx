import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, ChevronRight, Loader2, AlertCircle, Zap, Settings2, Info } from 'lucide-react';
import { DataCard } from '@/components/DataComponents';
import {
  isConfigured,
  fetchTypes, fetchBrands, fetchSeries, fetchModels, fetchEngines, fetchEngineDetails,
  type VehicleType, type VehicleBrand, type VehicleSeries, type VehicleModel, type VehicleEngine, type EngineDetails,
} from '@/lib/fahrzeugdatenbank-api';

type Step = 'type' | 'brand' | 'series' | 'model' | 'engine' | 'details';

const STEP_LABELS: Record<Step, string> = {
  type: 'Fahrzeugtyp',
  brand: 'Marke',
  series: 'Baureihe',
  model: 'Modell',
  engine: 'Motor',
  details: 'Details',
};

interface Selection {
  type?: VehicleType;
  brand?: VehicleBrand;
  series?: VehicleSeries;
  model?: VehicleModel;
  engine?: VehicleEngine;
}

export default function OperationsVehiclesPage() {
  const [step, setStep] = useState<Step>('type');
  const [selection, setSelection] = useState<Selection>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data for each step
  const [types, setTypes] = useState<VehicleType[]>([]);
  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [series, setSeries] = useState<VehicleSeries[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [engines, setEngines] = useState<VehicleEngine[]>([]);
  const [details, setDetails] = useState<EngineDetails | null>(null);

  const configured = isConfigured();

  const loadData = useCallback(async (loader: () => Promise<void>) => {
    setLoading(true);
    setError(null);
    try {
      await loader();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load types on mount
  useEffect(() => {
    if (!configured) return;
    loadData(async () => {
      const data = await fetchTypes();
      setTypes(data);
    });
  }, [configured, loadData]);

  const selectType = (t: VehicleType) => {
    setSelection({ type: t });
    setStep('brand');
    loadData(async () => {
      const data = await fetchBrands(t.id);
      setBrands(data);
    });
  };

  const selectBrand = (b: VehicleBrand) => {
    setSelection(prev => ({ ...prev, brand: b }));
    setStep('series');
    loadData(async () => {
      const data = await fetchSeries(b.id);
      setSeries(data);
    });
  };

  const selectSeries = (s: VehicleSeries) => {
    setSelection(prev => ({ ...prev, series: s }));
    setStep('model');
    loadData(async () => {
      const data = await fetchModels(s.id);
      setModels(data);
    });
  };

  const selectModel = (m: VehicleModel) => {
    setSelection(prev => ({ ...prev, model: m }));
    setStep('engine');
    loadData(async () => {
      const data = await fetchEngines(m.id);
      setEngines(data);
    });
  };

  const selectEngine = (e: VehicleEngine) => {
    setSelection(prev => ({ ...prev, engine: e }));
    setStep('details');
    loadData(async () => {
      const data = await fetchEngineDetails(e.id);
      setDetails(data);
    });
  };

  const goToStep = (targetStep: Step) => {
    if (targetStep === 'type') {
      setSelection({});
      setStep('type');
    } else if (targetStep === 'brand' && selection.type) {
      setSelection({ type: selection.type });
      setStep('brand');
    } else if (targetStep === 'series' && selection.brand) {
      setSelection({ type: selection.type, brand: selection.brand });
      setStep('series');
    } else if (targetStep === 'model' && selection.series) {
      setSelection({ type: selection.type, brand: selection.brand, series: selection.series });
      setStep('model');
    } else if (targetStep === 'engine' && selection.model) {
      setSelection({ type: selection.type, brand: selection.brand, series: selection.series, model: selection.model });
      setStep('engine');
    }
  };

  const steps: Step[] = ['type', 'brand', 'series', 'model', 'engine', 'details'];
  const currentStepIdx = steps.indexOf(step);

  // Build breadcrumb items
  const breadcrumbItems: { step: Step; label: string }[] = [];
  breadcrumbItems.push({ step: 'type', label: selection.type?.name ?? STEP_LABELS.type });
  if (currentStepIdx >= 1) breadcrumbItems.push({ step: 'brand', label: selection.brand?.name ?? STEP_LABELS.brand });
  if (currentStepIdx >= 2) breadcrumbItems.push({ step: 'series', label: selection.series?.name ?? STEP_LABELS.series });
  if (currentStepIdx >= 3) breadcrumbItems.push({ step: 'model', label: selection.model?.name ?? STEP_LABELS.model });
  if (currentStepIdx >= 4) breadcrumbItems.push({ step: 'engine', label: selection.engine?.name ?? STEP_LABELS.engine });
  if (currentStepIdx >= 5) breadcrumbItems.push({ step: 'details', label: 'Details' });

  if (!configured) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-1">Fahrzeugdatenbank</h1>
        <p className="text-sm text-muted-foreground mb-6">API-Anbindung an verwaltung.tuningfux.de</p>
        <DataCard>
          <div className="flex items-start gap-3 p-2">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">API nicht konfiguriert</p>
              <p className="text-xs text-muted-foreground">
                Trage den API Token und die Token ID in <code className="text-xs bg-secondary px-1 py-0.5 rounded-sm">src/lib/fahrzeugdatenbank-api.ts</code> ein.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Tokens werden unter <strong>Verwaltung → API Tokens</strong> auf verwaltung.tuningfux.de erstellt.
              </p>
            </div>
          </div>
        </DataCard>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold text-foreground mb-1">Fahrzeugdatenbank</h1>
        <p className="text-sm text-muted-foreground mb-4">API-Anbindung an verwaltung.tuningfux.de</p>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1 mb-6 flex-wrap">
          {breadcrumbItems.map((item, i) => (
            <div key={item.step} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/50" />}
              <button
                onClick={() => item.step !== step && goToStep(item.step)}
                disabled={item.step === step}
                className={`px-2.5 py-1.5 text-xs rounded-sm transition-all ${
                  item.step === step
                    ? 'bg-destructive text-destructive-foreground font-medium'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-pointer'
                }`}
              >
                {item.label}
              </button>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <DataCard className="mb-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">{error}</p>
            </div>
          </DataCard>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
          </div>
        )}

        {/* Content */}
        {!loading && (
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 'type' && (
                <SelectionGrid items={types} onSelect={selectType} icon={<Car className="h-4 w-4" />} />
              )}
              {step === 'brand' && (
                <SelectionGrid items={brands} onSelect={selectBrand} icon={<Car className="h-4 w-4" />} />
              )}
              {step === 'series' && (
                <SelectionGrid items={series} onSelect={selectSeries} icon={<Car className="h-4 w-4" />} />
              )}
              {step === 'model' && (
                <SelectionGrid items={models} onSelect={selectModel} icon={<Car className="h-4 w-4" />} />
              )}
              {step === 'engine' && (
                <SelectionGrid items={engines} onSelect={selectEngine} icon={<Zap className="h-4 w-4" />} />
              )}
              {step === 'details' && details && (
                <EngineDetailsView details={details} />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}

function SelectionGrid<T extends { id: number; name: string }>({ items, onSelect, icon }: {
  items: T[];
  onSelect: (item: T) => void;
  icon: React.ReactNode;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground italic py-8 text-center">Keine Einträge gefunden</p>;
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((item, i) => (
        <motion.div key={item.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.02, 0.4) }}>
          <div onClick={() => onSelect(item)} className="cursor-pointer">
            <DataCard className="hover:border-muted-foreground/30 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{icon}</span>
                <span className="text-sm font-medium text-foreground">{item.name}</span>
              </div>
            </DataCard>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function EngineDetailsView({ details }: { details: EngineDetails }) {
  const engine = details.engine as Record<string, unknown>;
  const brand = details.brand as Record<string, unknown>;
  const series = details.series as Record<string, unknown>;
  const stages = details.stages as Array<Record<string, unknown>>;
  const ecus = details.ecus as Array<Record<string, unknown>>;
  const gearboxes = details.gearboxes as Array<Record<string, unknown>>;

  return (
    <div className="space-y-6">
      {/* Engine Info */}
      <DataCard>
        <div className="flex items-start gap-3">
          <Zap className="h-5 w-5 text-destructive mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground mb-2">Motor</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(engine).map(([key, value]) => (
                <div key={key}>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{key}</p>
                  <p className="text-sm text-foreground font-mono-data">{String(value ?? '–')}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DataCard>

      {/* Brand & Series */}
      <div className="grid grid-cols-2 gap-3">
        <DataCard>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Marke</h3>
          {Object.entries(brand).map(([key, value]) => (
            <div key={key} className="mb-1">
              <span className="text-[10px] text-muted-foreground">{key}: </span>
              <span className="text-xs text-foreground font-mono-data">{String(value ?? '–')}</span>
            </div>
          ))}
        </DataCard>
        <DataCard>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Baureihe</h3>
          {Object.entries(series).map(([key, value]) => (
            <div key={key} className="mb-1">
              <span className="text-[10px] text-muted-foreground">{key}: </span>
              <span className="text-xs text-foreground font-mono-data">{String(value ?? '–')}</span>
            </div>
          ))}
        </DataCard>
      </div>

      {/* Stages */}
      {stages.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
            <Zap className="h-3.5 w-3.5" /> Tuning-Stufen ({stages.length})
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {stages.map((stage, i) => (
              <DataCard key={i}>
                <p className="text-sm font-semibold text-foreground mb-1">{String(stage.name ?? stage.label ?? `Stage ${i + 1}`)}</p>
                {Object.entries(stage).filter(([k]) => !['name', 'label'].includes(k)).map(([key, value]) => (
                  <div key={key} className="mb-0.5">
                    <span className="text-[10px] text-muted-foreground">{key}: </span>
                    <span className="text-xs text-foreground font-mono-data">{typeof value === 'object' ? JSON.stringify(value) : String(value ?? '–')}</span>
                  </div>
                ))}
              </DataCard>
            ))}
          </div>
        </div>
      )}

      {/* ECUs */}
      {ecus.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
            <Settings2 className="h-3.5 w-3.5" /> Steuergeräte ({ecus.length})
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {ecus.map((ecu, i) => (
              <DataCard key={i}>
                <p className="text-sm font-medium text-foreground">{String(ecu.name ?? ecu.type ?? `ECU ${i + 1}`)}</p>
                {Object.entries(ecu).filter(([k]) => !['name', 'type'].includes(k)).map(([key, value]) => (
                  <div key={key} className="mb-0.5">
                    <span className="text-[10px] text-muted-foreground">{key}: </span>
                    <span className="text-xs text-foreground font-mono-data">{typeof value === 'object' ? JSON.stringify(value) : String(value ?? '–')}</span>
                  </div>
                ))}
              </DataCard>
            ))}
          </div>
        </div>
      )}

      {/* Gearboxes */}
      {gearboxes.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
            <Info className="h-3.5 w-3.5" /> Getriebe ({gearboxes.length})
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {gearboxes.map((gb, i) => (
              <DataCard key={i}>
                <p className="text-sm font-medium text-foreground">{String(gb.name ?? gb.type ?? `Getriebe ${i + 1}`)}</p>
              </DataCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
