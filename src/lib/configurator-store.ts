import type { Vehicle, Recommendation, DynoDataPoint } from '@/types/models';

export interface StageConfig {
  stageId: number;
  label: string;
  hpMultiplier: number;
  nmMultiplier: number;
  risk: 'low' | 'medium' | 'high';
  components: string[];
  basePrice: number;
  componentPrices: Record<string, number>;
  description: (v: Vehicle) => string;
}

export function formatPrice(value: number): string {
  return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}

export function getStageTotalPrice(cfg: StageConfig): number {
  return cfg.basePrice + Object.values(cfg.componentPrices).reduce((sum, p) => sum + p, 0);
}

export const stageConfigs: StageConfig[] = [
  {
    stageId: 1,
    label: 'Stage 1 – ECU Optimierung',
    hpMultiplier: 0.22,
    nmMultiplier: 0.20,
    risk: 'low',
    components: ['ECU-Remap', 'Ladedruck-Optimierung', 'Kennfeld-Anpassung'],
    basePrice: 499,
    componentPrices: {
      'ECU-Remap': 499,
      'Ladedruck-Optimierung': 0,
      'Kennfeld-Anpassung': 0,
    },
    description: (v) =>
      `Kennfeldoptimierung für ${v.brand} ${v.model} (${v.engine_code}). Anpassung von Zündung, Ladedruck und Einspritzmenge bei seriennaher Abstimmung mit vollem Komforterhalt.`,
  },
  {
    stageId: 2,
    label: 'Stage 2 – Performance',
    hpMultiplier: 0.35,
    nmMultiplier: 0.30,
    risk: 'medium',
    components: ['ECU-Remap', 'Downpipe', 'Ladeluftkühler-Upgrade', 'Ansaugung', 'Ladedruck-Optimierung'],
    basePrice: 799,
    componentPrices: {
      'ECU-Remap': 799,
      'Downpipe': 890,
      'Ladeluftkühler-Upgrade': 650,
      'Ansaugung': 380,
      'Ladedruck-Optimierung': 0,
    },
    description: (v) =>
      `Performance-Paket für ${v.brand} ${v.model} (${v.engine_code}). Erweiterte Kennfeldoptimierung in Kombination mit Hardware-Upgrades für signifikant gesteigerte Leistung bei kontrolliertem Risiko.`,
  },
  {
    stageId: 3,
    label: 'Stage 3 – Track Ready',
    hpMultiplier: 0.55,
    nmMultiplier: 0.45,
    risk: 'high',
    components: ['ECU-Remap', 'Turbo-Upgrade', 'Downpipe', 'Ladeluftkühler', 'Ansaugung', 'Kraftstoffpumpe', 'Kupplung/Getriebe-Upgrade'],
    basePrice: 1.299,
    componentPrices: {
      'ECU-Remap': 1299,
      'Turbo-Upgrade': 2890,
      'Downpipe': 890,
      'Ladeluftkühler': 650,
      'Ansaugung': 380,
      'Kraftstoffpumpe': 490,
      'Kupplung/Getriebe-Upgrade': 1890,
    },
    description: (v) =>
      `Track-Ready-Umbau für ${v.brand} ${v.model} (${v.engine_code}). Maximale Leistungsausbeute durch Turbo-Upgrade und vollständige Hardware-Modifikation. Für erfahrene Fahrer und Rennstreckeneinsatz.`,
  },
];

export interface ConfiguratorResult {
  id: string;
  createdAt: string;
  vehicle: Vehicle;
  selectedStage: number;
  stages: {
    recommendation: Recommendation;
    dynoPoints: DynoDataPoint[];
  }[];
}

// In-memory store (simulates API persistence)
const store = new Map<string, ConfiguratorResult>();

export function saveResult(result: ConfiguratorResult): void {
  store.set(result.id, result);
}

export function getResult(id: string): ConfiguratorResult | undefined {
  return store.get(id);
}

export function generateDynoCurve(
  peakHp: number,
  peakNm: number,
  peakHpRpm: number,
  peakNmRpm: number
): DynoDataPoint[] {
  const points: DynoDataPoint[] = [];
  for (let rpm = 1500; rpm <= 7000; rpm += 250) {
    const hpFactor =
      Math.sin(((rpm - 1000) / (peakHpRpm - 1000)) * (Math.PI / 2)) *
      (rpm <= peakHpRpm ? 1 : Math.max(0.7, 1 - (rpm - peakHpRpm) / 3000));
    const nmFactor =
      Math.sin(((rpm - 1000) / (peakNmRpm - 1000)) * (Math.PI / 2)) *
      (rpm <= peakNmRpm ? 1 : Math.max(0.6, 1 - (rpm - peakNmRpm) / 2500));
    points.push({
      rpm,
      power: Math.round(peakHp * Math.max(0.1, hpFactor)),
      torque: Math.round(peakNm * Math.max(0.15, nmFactor)),
    });
  }
  return points;
}

// Simulates AI recommendation generation for all stages
export function generateRecommendation(vehicle: Vehicle, selectedStage: number = 1): ConfiguratorResult {
  const id = crypto.randomUUID();

  const stages = stageConfigs.map((cfg) => {
    const deltaHp = Math.round(vehicle.stock_hp * cfg.hpMultiplier);
    const deltaNm = Math.round(vehicle.stock_nm * cfg.nmMultiplier);
    const estimatedHp = vehicle.stock_hp + deltaHp;
    const estimatedNm = vehicle.stock_nm + deltaNm;

    const recommendation: Recommendation = {
      id: `rec-${id.slice(0, 8)}-s${cfg.stageId}`,
      created_at: new Date().toISOString(),
      vehicle_id: vehicle.id,
      stage_id: cfg.stageId,
      stage_label: cfg.label,
      delta_hp: deltaHp,
      delta_nm: deltaNm,
      estimated_hp: estimatedHp,
      estimated_nm: estimatedNm,
      risk_assessment: cfg.risk,
      description: cfg.description(vehicle),
      disclaimer:
        'Alle Werte sind fahrzeugspezifische Prognosen basierend auf Referenzmessungen vergleichbarer Fahrzeuge. Tatsächliche Ergebnisse können je nach Zustand, Laufleistung und Umgebungsbedingungen abweichen.',
      components: cfg.components,
    };

    const peakHpRpm = vehicle.fuel_type === 'diesel' ? 4200 : 5500;
    const peakNmRpm = vehicle.fuel_type === 'diesel' ? 2200 : 3200;
    const dynoPoints = generateDynoCurve(estimatedHp, estimatedNm, peakHpRpm, peakNmRpm);

    return { recommendation, dynoPoints };
  });

  const result: ConfiguratorResult = {
    id,
    createdAt: new Date().toISOString(),
    vehicle,
    selectedStage,
    stages,
  };

  saveResult(result);
  return result;
}
