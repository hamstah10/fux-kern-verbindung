import type { Vehicle, Recommendation, DynoDataPoint } from '@/types/models';

export interface ConfiguratorResult {
  id: string;
  createdAt: string;
  vehicle: Vehicle;
  recommendation: Recommendation;
  dynoPoints: DynoDataPoint[];
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

// Simulates AI recommendation generation
export function generateRecommendation(vehicle: Vehicle): ConfiguratorResult {
  const id = crypto.randomUUID();

  const stage1Hp = Math.round(vehicle.stock_hp * 0.22);
  const stage1Nm = Math.round(vehicle.stock_nm * 0.2);
  const estimatedHp = vehicle.stock_hp + stage1Hp;
  const estimatedNm = vehicle.stock_nm + stage1Nm;

  const riskLevel: 'low' | 'medium' | 'high' =
    stage1Hp / vehicle.stock_hp > 0.25 ? 'medium' : 'low';

  const recommendation: Recommendation = {
    id: `rec-${id.slice(0, 8)}`,
    created_at: new Date().toISOString(),
    vehicle_id: vehicle.id,
    stage_id: 1,
    stage_label: 'Stage 1 – ECU Optimierung',
    delta_hp: stage1Hp,
    delta_nm: stage1Nm,
    estimated_hp: estimatedHp,
    estimated_nm: estimatedNm,
    risk_assessment: riskLevel,
    description: `Kennfeldoptimierung für ${vehicle.brand} ${vehicle.model} (${vehicle.engine_code}). Anpassung von Zündung, Ladedruck und Einspritzmenge bei seriennaher Abstimmung mit vollem Komforterhalt.`,
    disclaimer:
      'Alle Werte sind fahrzeugspezifische Prognosen basierend auf Referenzmessungen vergleichbarer Fahrzeuge. Tatsächliche Ergebnisse können je nach Zustand, Laufleistung und Umgebungsbedingungen abweichen.',
    components: ['ECU-Remap', 'Ladedruck-Optimierung', 'Kennfeld-Anpassung'],
  };

  const peakHpRpm = vehicle.fuel_type === 'diesel' ? 4200 : 5500;
  const peakNmRpm = vehicle.fuel_type === 'diesel' ? 2200 : 3200;

  const result: ConfiguratorResult = {
    id,
    createdAt: new Date().toISOString(),
    vehicle,
    recommendation,
    dynoPoints: generateDynoCurve(estimatedHp, estimatedNm, peakHpRpm, peakNmRpm),
  };

  saveResult(result);
  return result;
}
