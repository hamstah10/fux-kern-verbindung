import type {
  Lead, Vehicle, Recommendation, DynoSimulation, DealerRequest,
  FileMeta, Dealer, Order, TelemetryEntry, ApiEvent, DynoDataPoint
} from '@/types/models';

// Helpers
const uuid = () => crypto.randomUUID();
const ago = (mins: number) => new Date(Date.now() - mins * 60000).toISOString();

// Vehicles
export const mockVehicles: Vehicle[] = [
  {
    id: 'v-001', created_at: ago(10080), owner_id: 'u-001',
    vin: 'WVWZZZ3CZWE123456', brand: 'Volkswagen', model: 'Golf 8 GTI',
    year: 2023, engine_code: 'DNUA', ecu_type: 'Bosch MG1CS111',
    transmission: 'dsg', fuel_type: 'petrol', stock_hp: 245, stock_nm: 370,
  },
  {
    id: 'v-002', created_at: ago(8640), owner_id: 'u-002',
    vin: 'WBA8E9C50JA765432', brand: 'BMW', model: '340i G20',
    year: 2022, engine_code: 'B58B30O1', ecu_type: 'Bosch MG1CS024',
    transmission: 'automatic', fuel_type: 'petrol', stock_hp: 374, stock_nm: 500,
  },
  {
    id: 'v-003', created_at: ago(7200), owner_id: 'u-003',
    brand: 'Mercedes-Benz', model: 'C43 AMG W206',
    year: 2024, engine_code: 'M139L', ecu_type: 'Bosch MED17.7.2',
    transmission: 'automatic', fuel_type: 'petrol', stock_hp: 408, stock_nm: 500,
  },
  {
    id: 'v-004', created_at: ago(4320),
    brand: 'Audi', model: 'RS3 8Y',
    year: 2023, engine_code: 'DAZA', ecu_type: 'Bosch MG1CS008',
    transmission: 'dsg', fuel_type: 'petrol', stock_hp: 400, stock_nm: 500,
  },
];

// Leads
export const mockLeads: Lead[] = [
  {
    id: 'l-001', created_at: ago(120), updated_at: ago(45), status: 'new',
    name: 'Markus Brenner', email: 'markus.b@mail.de', phone: '+49 170 1234567',
    source_metadata: { type: 'meta_ads', campaign: 'stage2_summer_24', click_id: 'fbclid_abc123' },
    vehicle_id: 'v-001',
  },
  {
    id: 'l-002', created_at: ago(360), updated_at: ago(180), status: 'qualified',
    name: 'Julia Stahl', email: 'j.stahl@web.de',
    source_metadata: { type: 'tiktok_ads', campaign: 'dyno_viral_q1' },
    vehicle_id: 'v-002',
  },
  {
    id: 'l-003', created_at: ago(1440), updated_at: ago(720), status: 'in_progress',
    name: 'Tobias Feld', email: 'tfeld@gmail.com', phone: '+49 151 9876543',
    source_metadata: { type: 'organic' },
    vehicle_id: 'v-003', assigned_dealer_id: 'd-001',
  },
  {
    id: 'l-004', created_at: ago(4320), updated_at: ago(2880), status: 'converted',
    name: 'Sarah Klein', email: 'sarah.k@outlook.de',
    source_metadata: { type: 'whatsapp' },
    vehicle_id: 'v-004', assigned_dealer_id: 'd-002',
  },
  {
    id: 'l-005', created_at: ago(7200), updated_at: ago(7000), status: 'lost',
    name: 'Rene Wolff', email: 'rene.w@t-online.de',
    source_metadata: { type: 'referral', referrer: 'Markus Brenner' },
    notes: 'Preisvorstellung zu hoch',
  },
];

// Recommendations
export const mockRecommendations: Recommendation[] = [
  {
    id: 'r-001', created_at: ago(100), vehicle_id: 'v-001', lead_id: 'l-001',
    stage_id: 1, stage_label: 'Stage 1 – ECU Optimierung',
    delta_hp: 55, delta_nm: 80, estimated_hp: 300, estimated_nm: 450,
    risk_assessment: 'low',
    description: 'Kennfeldoptimierung der Zündung, Ladedruck und Einspritzmenge. Seriennahe Abstimmung mit vollem Komforterhalt.',
    disclaimer: 'Alle Werte sind fahrzeugspezifische Prognosen basierend auf Referenzmessungen vergleichbarer Fahrzeuge.',
    components: ['ECU-Remap', 'Ladedruck-Optimierung', 'Kennfeld-Anpassung'],
  },
  {
    id: 'r-002', created_at: ago(300), vehicle_id: 'v-002', lead_id: 'l-002',
    stage_id: 2, stage_label: 'Stage 2 – Performance Paket',
    delta_hp: 76, delta_nm: 100, estimated_hp: 450, estimated_nm: 600,
    risk_assessment: 'medium',
    description: 'Erweiterte Kennfeldoptimierung mit Downpipe und Ladeluftkühler-Upgrade. Höhere thermische Belastung – Ölkühler empfohlen.',
    disclaimer: 'Alle Werte sind fahrzeugspezifische Prognosen basierend auf Referenzmessungen vergleichbarer Fahrzeuge.',
    components: ['ECU-Remap', 'Downpipe', 'Ladeluftkühler', 'Ölkühler'],
  },
];

// Generate dyno curve
function generateDynoCurve(peakHp: number, peakNm: number, peakHpRpm: number, peakNmRpm: number): DynoDataPoint[] {
  const points: DynoDataPoint[] = [];
  for (let rpm = 1500; rpm <= 7000; rpm += 250) {
    const hpFactor = Math.sin(((rpm - 1000) / (peakHpRpm - 1000)) * (Math.PI / 2)) * (rpm <= peakHpRpm ? 1 : Math.max(0.7, 1 - (rpm - peakHpRpm) / 3000));
    const nmFactor = Math.sin(((rpm - 1000) / (peakNmRpm - 1000)) * (Math.PI / 2)) * (rpm <= peakNmRpm ? 1 : Math.max(0.6, 1 - (rpm - peakNmRpm) / 2500));
    points.push({
      rpm,
      power: Math.round(peakHp * Math.max(0.1, hpFactor)),
      torque: Math.round(peakNm * Math.max(0.15, nmFactor)),
    });
  }
  return points;
}

export const mockDynoSimulations: DynoSimulation[] = [
  {
    id: 'ds-001', created_at: ago(90), vehicle_id: 'v-001', recommendation_id: 'r-001',
    label: 'Golf 8 GTI – Stage 1 Prognose',
    data_points: generateDynoCurve(300, 450, 5500, 3200),
    environmental_factors: { intake_temp_c: 28, ambient_pressure_hpa: 1013, fuel_quality: 'Super Plus (ROZ 98)' },
    peak_hp: 300, peak_nm: 450, peak_hp_rpm: 5500, peak_nm_rpm: 3200,
  },
  {
    id: 'ds-002', created_at: ago(280), vehicle_id: 'v-002', recommendation_id: 'r-002',
    label: 'BMW 340i – Stage 2 Prognose',
    data_points: generateDynoCurve(450, 600, 5800, 2800),
    environmental_factors: { intake_temp_c: 24, ambient_pressure_hpa: 1018, fuel_quality: 'Super Plus (ROZ 98)' },
    peak_hp: 450, peak_nm: 600, peak_hp_rpm: 5800, peak_nm_rpm: 2800,
  },
];

// Dealers
export const mockDealers: Dealer[] = [
  {
    id: 'd-001', name: 'Performance Werkstatt München', city: 'München', region: 'Bayern',
    protocol_equipment: ['Autotuner', 'Flex', 'KTag'],
    active_requests: 3, completed_jobs: 187, rating: 4.8, verified: true,
  },
  {
    id: 'd-002', name: 'SpeedTech Hamburg', city: 'Hamburg', region: 'Hamburg',
    protocol_equipment: ['Autotuner', 'CMD Flash'],
    active_requests: 5, completed_jobs: 124, rating: 4.6, verified: true,
  },
  {
    id: 'd-003', name: 'TurboLogic Stuttgart', city: 'Stuttgart', region: 'Baden-Württemberg',
    protocol_equipment: ['Flex', 'KTag', 'Trasdata'],
    active_requests: 1, completed_jobs: 89, rating: 4.9, verified: true,
  },
];

// Dealer Requests
export const mockDealerRequests: DealerRequest[] = [
  {
    id: 'dr-001', created_at: ago(60), updated_at: ago(30),
    lead_id: 'l-003', vehicle_id: 'v-003', dealer_id: 'd-001',
    status: 'accepted', protocol_equipment: ['Autotuner'],
    estimated_duration_hours: 3, notes: 'Termin am Freitag 14:00 bestätigt',
  },
  {
    id: 'dr-002', created_at: ago(2880), updated_at: ago(2880),
    lead_id: 'l-004', vehicle_id: 'v-004', dealer_id: 'd-002',
    status: 'completed', protocol_equipment: ['Autotuner', 'CMD Flash'],
    estimated_duration_hours: 4,
  },
];

// Files
export const mockFiles: FileMeta[] = [
  {
    id: 'f-001', created_at: ago(50), filename: 'DNUA_stock_read.bin',
    category: 'ecu_original', size_bytes: 4194304, checksum_sha256: 'a1b2c3d4e5f6...',
    vehicle_id: 'v-001', uploaded_by: 'system', mime_type: 'application/octet-stream',
  },
  {
    id: 'f-002', created_at: ago(40), filename: 'DNUA_stage1_v2.bin',
    category: 'ecu_modified', size_bytes: 4194304, checksum_sha256: 'f6e5d4c3b2a1...',
    vehicle_id: 'v-001', uploaded_by: 'admin', mime_type: 'application/octet-stream',
  },
  {
    id: 'f-003', created_at: ago(80), filename: 'Dyno_Golf8GTI_Stage1.pdf',
    category: 'dyno_report', size_bytes: 2456789, checksum_sha256: '9876543210ab...',
    vehicle_id: 'v-001', uploaded_by: 'system', mime_type: 'application/pdf',
  },
];

// Orders
export const mockOrders: Order[] = [
  {
    id: 'o-001', created_at: ago(1440), updated_at: ago(720),
    lead_id: 'l-003', vehicle_id: 'v-003', dealer_id: 'd-001',
    status: 'in_progress', recommendation_id: 'r-002',
    total_eur: 1890, items: ['ECU-Remap Stage 2', 'Downpipe Einbau', 'Diagnose'],
  },
  {
    id: 'o-002', created_at: ago(4320), updated_at: ago(2880),
    lead_id: 'l-004', vehicle_id: 'v-004', dealer_id: 'd-002',
    status: 'completed', recommendation_id: 'r-001',
    total_eur: 990, items: ['ECU-Remap Stage 1'],
  },
];

// Telemetry
export const mockTelemetry: TelemetryEntry[] = [
  { id: 't-1', timestamp: ago(1), method: 'POST', endpoint: '/api/v1/leads', status: 201, duration_ms: 142, entity_type: 'Lead', entity_id: 'l-001' },
  { id: 't-2', timestamp: ago(2), method: 'POST', endpoint: '/api/v1/recommendations/generate', status: 201, duration_ms: 890, entity_type: 'Recommendation', entity_id: 'r-001' },
  { id: 't-3', timestamp: ago(3), method: 'GET', endpoint: '/api/v1/vehicles/v-001', status: 200, duration_ms: 34, entity_type: 'Vehicle', entity_id: 'v-001' },
  { id: 't-4', timestamp: ago(5), method: 'PATCH', endpoint: '/api/v1/leads/l-002', status: 200, duration_ms: 67, entity_type: 'Lead', entity_id: 'l-002' },
  { id: 't-5', timestamp: ago(8), method: 'POST', endpoint: '/api/v1/dealer-requests', status: 201, duration_ms: 213, entity_type: 'DealerRequest', entity_id: 'dr-001' },
  { id: 't-6', timestamp: ago(10), method: 'GET', endpoint: '/api/v1/files/f-001/signed-url', status: 200, duration_ms: 28, entity_type: 'File', entity_id: 'f-001' },
  { id: 't-7', timestamp: ago(12), method: 'POST', endpoint: '/api/v1/dyno-simulations', status: 201, duration_ms: 1240, entity_type: 'DynoSimulation', entity_id: 'ds-001' },
];

// API Events
export const mockApiEvents: ApiEvent[] = [
  { id: 'e-1', timestamp: ago(1), type: 'lead.created', description: 'Lead erstellt via Meta Ads Kampagne', source: 'meta_ads', entity_type: 'Lead', entity_id: 'l-001', status: 'success' },
  { id: 'e-2', timestamp: ago(2), type: 'recommendation.generated', description: 'AI-Empfehlung generiert: Stage 1 für Golf 8 GTI', entity_type: 'Recommendation', entity_id: 'r-001', status: 'success' },
  { id: 'e-3', timestamp: ago(3), type: 'notification.sent', description: 'WhatsApp-Benachrichtigung an Markus Brenner', entity_type: 'Lead', entity_id: 'l-001', status: 'processing' },
  { id: 'e-4', timestamp: ago(5), type: 'lead.qualified', description: 'Lead qualifiziert – Fahrzeugdaten verifiziert', entity_type: 'Lead', entity_id: 'l-002', status: 'success' },
  { id: 'e-5', timestamp: ago(8), type: 'dealer_request.created', description: 'Werkstattanfrage an Performance Werkstatt München', entity_type: 'DealerRequest', entity_id: 'dr-001', status: 'success' },
  { id: 'e-6', timestamp: ago(10), type: 'file.uploaded', description: 'ECU-Originaldatei hochgeladen: DNUA_stock_read.bin', entity_type: 'File', entity_id: 'f-001', status: 'success' },
  { id: 'e-7', timestamp: ago(15), type: 'dyno.simulated', description: 'Dyno-Simulation abgeschlossen: 300 PS @ 5500 rpm', entity_type: 'DynoSimulation', entity_id: 'ds-001', status: 'success' },
  { id: 'e-8', timestamp: ago(20), type: 'validation.error', description: 'ERR_VIN_INVALID: Prüfsumme stimmt nicht überein', entity_type: 'Vehicle', entity_id: 'v-003', status: 'error' },
];

// Source label mapping
export const sourceLabels: Record<string, string> = {
  organic: 'Organisch',
  meta_ads: 'Meta Ads',
  tiktok_ads: 'TikTok Ads',
  whatsapp: 'WhatsApp',
  referral: 'Empfehlung',
};

export const leadStatusLabels: Record<string, string> = {
  new: 'Neu',
  qualified: 'Qualifiziert',
  in_progress: 'In Bearbeitung',
  converted: 'Konvertiert',
  lost: 'Verloren',
};

export const dealerRequestStatusLabels: Record<string, string> = {
  pending: 'Ausstehend',
  accepted: 'Angenommen',
  in_progress: 'In Bearbeitung',
  completed: 'Abgeschlossen',
  rejected: 'Abgelehnt',
};

export const orderStatusLabels: Record<string, string> = {
  received: 'Eingegangen',
  in_progress: 'In Bearbeitung',
  on_hold: 'On Hold',
  parked: 'Geparkt',
  completed: 'Abgeschlossen',
  rejected: 'Abgelehnt',
};

export const fileCategoryLabels: Record<string, string> = {
  ecu_original: 'ECU Original',
  ecu_modified: 'ECU Modifiziert',
  dyno_report: 'Dyno Report',
  invoice: 'Rechnung',
  protocol: 'Protokoll',
  other: 'Sonstige',
};
