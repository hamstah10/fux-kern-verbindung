// TuningFux Core Domain Models

export type LeadStatus = 'new' | 'qualified' | 'in_progress' | 'converted' | 'lost';
export type SourceType = 'organic' | 'meta_ads' | 'tiktok_ads' | 'whatsapp' | 'referral';
export type DealerRequestStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'rejected';
export type OrderStatus = 'draft' | 'confirmed' | 'in_progress' | 'quality_check' | 'completed' | 'delivered';
export type FileCategory = 'ecu_original' | 'ecu_modified' | 'dyno_report' | 'invoice' | 'protocol' | 'other';

export interface SourceMetadata {
  type: SourceType;
  campaign?: string;
  click_id?: string;
  referrer?: string;
}

export interface Lead {
  id: string;
  created_at: string;
  updated_at: string;
  status: LeadStatus;
  name: string;
  email: string;
  phone?: string;
  source_metadata: SourceMetadata;
  vehicle_id?: string;
  notes?: string;
  assigned_dealer_id?: string;
}

export interface Vehicle {
  id: string;
  created_at: string;
  owner_id?: string;
  vin?: string;
  brand: string;
  model: string;
  year: number;
  engine_code: string;
  ecu_type: string;
  transmission: 'manual' | 'automatic' | 'dsg' | 'dct' | 'cvt';
  fuel_type: 'petrol' | 'diesel' | 'hybrid' | 'electric';
  stock_hp: number;
  stock_nm: number;
}

export interface Recommendation {
  id: string;
  created_at: string;
  vehicle_id: string;
  lead_id?: string;
  stage_id: number;
  stage_label: string;
  delta_hp: number;
  delta_nm: number;
  estimated_hp: number;
  estimated_nm: number;
  risk_assessment: 'low' | 'medium' | 'high';
  description: string;
  disclaimer: string;
  components: string[];
}

export interface DynoDataPoint {
  rpm: number;
  torque: number;
  power: number;
}

export interface DynoSimulation {
  id: string;
  created_at: string;
  vehicle_id: string;
  recommendation_id?: string;
  label: string;
  data_points: DynoDataPoint[];
  environmental_factors: {
    intake_temp_c: number;
    ambient_pressure_hpa: number;
    fuel_quality: string;
  };
  peak_hp: number;
  peak_nm: number;
  peak_hp_rpm: number;
  peak_nm_rpm: number;
}

export interface DealerRequest {
  id: string;
  created_at: string;
  updated_at: string;
  lead_id: string;
  vehicle_id: string;
  dealer_id: string;
  status: DealerRequestStatus;
  protocol_equipment: string[];
  estimated_duration_hours: number;
  notes?: string;
}

export interface FileMeta {
  id: string;
  created_at: string;
  filename: string;
  category: FileCategory;
  size_bytes: number;
  checksum_sha256: string;
  vehicle_id?: string;
  lead_id?: string;
  uploaded_by: string;
  mime_type: string;
}

export interface Dealer {
  id: string;
  name: string;
  city: string;
  region: string;
  protocol_equipment: string[];
  active_requests: number;
  completed_jobs: number;
  rating: number;
  verified: boolean;
}

export interface Order {
  id: string;
  created_at: string;
  updated_at: string;
  lead_id: string;
  vehicle_id: string;
  dealer_id?: string;
  status: OrderStatus;
  recommendation_id: string;
  total_eur: number;
  items: string[];
}

// API Telemetry
export interface TelemetryEntry {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  status: number;
  duration_ms: number;
  entity_type?: string;
  entity_id?: string;
}

// API Event Feed
export interface ApiEvent {
  id: string;
  timestamp: string;
  type: string;
  description: string;
  source?: SourceType;
  entity_type: string;
  entity_id: string;
  status: 'success' | 'processing' | 'error' | 'warning';
}
