import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SectionHeader, DataCard, StatusBadge } from '@/components/DataComponents';
import { mockVehicles } from '@/lib/mock-data';
import { getConfiguredVehicles } from '@/lib/configurator-store';
import type { Vehicle } from '@/types/models';
import { motion } from 'framer-motion';
import { Plus, Car, ExternalLink } from 'lucide-react';

export default function VehiclesPage() {
  const configuredVehicles = getConfiguredVehicles();
  const allVehicles = useMemo(() => {
    const existingIds = new Set(mockVehicles.map((v) => v.id));
    const unique = configuredVehicles.filter((v) => !existingIds.has(v.id));
    return [...mockVehicles, ...unique];
  }, [configuredVehicles]);
  const [vehicles, setVehicles] = useState<Vehicle[]>(allVehicles);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <SectionHeader title="Fahrzeuge" sub="Fahrzeugdatenbank mit ECU- und Motordaten" />
        <button onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 rounded-sm text-primary-foreground text-sm font-medium transition-colors bg-destructive">
          <Plus className="h-4 w-4" /> Fahrzeug anlegen
        </button>
      </div>

      {showCreate && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4">
          <CreateVehicleForm onCreated={(v) => { setVehicles(prev => [v, ...prev]); setShowCreate(false); }} onCancel={() => setShowCreate(false)} />
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {vehicles.map((v, i) => (
          <VehicleCard key={v.id} vehicle={v} index={i} />
        ))}
      </div>
    </div>
  );
}

function VehicleCard({ vehicle, index }: { vehicle: Vehicle; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to={`/admin/vehicles/${vehicle.id}`}>
        <DataCard className="glass hover:border-muted-foreground/30 transition-colors cursor-pointer">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">{vehicle.brand} {vehicle.model}</h3>
              <p className="text-xs text-muted-foreground">{vehicle.year} · {vehicle.engine_code}</p>
            </div>
            <Car className="h-5 w-5 text-muted-foreground/30" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <DataField label="ECU" value={vehicle.ecu_type} />
            <DataField label="Getriebe" value={vehicle.transmission.toUpperCase()} />
            <DataField label="Serie PS" value={`${vehicle.stock_hp} PS`} />
            <DataField label="Serie Nm" value={`${vehicle.stock_nm} Nm`} />
            {vehicle.vin && <DataField label="VIN" value={vehicle.vin} className="col-span-2" />}
          </div>
          <div className="mt-3 pt-2 border-t border-border">
            <span className="font-mono-data text-[10px] text-muted-foreground/40">{vehicle.id}</span>
          </div>
        </DataCard>
      </Link>
    </motion.div>
  );
}

function DataField({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <span className="text-muted-foreground">{label}</span>
      <p className="text-foreground font-mono-data">{value}</p>
    </div>
  );
}

function CreateVehicleForm({ onCreated, onCancel }: { onCreated: (v: Vehicle) => void; onCancel: () => void }) {
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('2024');
  const [engineCode, setEngineCode] = useState('');
  const [ecuType, setEcuType] = useState('');
  const [stockHp, setStockHp] = useState('');
  const [stockNm, setStockNm] = useState('');

  const handleSubmit = () => {
    if (!brand || !model) return;
    const v: Vehicle = {
      id: `v-${Date.now()}`, created_at: new Date().toISOString(),
      brand, model, year: parseInt(year), engine_code: engineCode || 'N/A',
      ecu_type: ecuType || 'N/A', transmission: 'manual', fuel_type: 'petrol',
      stock_hp: parseInt(stockHp) || 0, stock_nm: parseInt(stockNm) || 0,
    };
    onCreated(v);
  };

  return (
    <DataCard>
      <h3 className="text-sm font-semibold text-foreground mb-3">Neues Fahrzeug anlegen</h3>
      <div className="grid grid-cols-4 gap-3 mb-3">
        <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="Marke" className="px-3 py-2 text-sm rounded-sm bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
        <input value={model} onChange={e => setModel(e.target.value)} placeholder="Modell" className="px-3 py-2 text-sm rounded-sm bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
        <input value={engineCode} onChange={e => setEngineCode(e.target.value)} placeholder="Motorcode" className="px-3 py-2 text-sm rounded-sm bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
        <input value={ecuType} onChange={e => setEcuType(e.target.value)} placeholder="ECU-Typ" className="px-3 py-2 text-sm rounded-sm bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
        <input value={year} onChange={e => setYear(e.target.value)} placeholder="Baujahr" className="px-3 py-2 text-sm rounded-sm bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
        <input value={stockHp} onChange={e => setStockHp(e.target.value)} placeholder="Serie PS" className="px-3 py-2 text-sm rounded-sm bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
        <input value={stockNm} onChange={e => setStockNm(e.target.value)} placeholder="Serie Nm" className="px-3 py-2 text-sm rounded-sm bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
      </div>
      <div className="flex gap-2">
        <button onClick={handleSubmit} className="px-4 py-2 text-xs rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          POST /api/v1/vehicles → 201 CREATED
        </button>
        <button onClick={onCancel} className="px-4 py-2 text-xs rounded-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">Abbrechen</button>
      </div>
    </DataCard>
  );
}
