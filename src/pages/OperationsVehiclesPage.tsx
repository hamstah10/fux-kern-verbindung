import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Car, XCircle } from 'lucide-react';
import { DataCard } from '@/components/DataComponents';
import { getAllVehicles } from '@/lib/vehicle-database';

const allVehicles = getAllVehicles();

export default function OperationsVehiclesPage() {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return allVehicles;
    const q = search.toLowerCase();
    return allVehicles.filter(v => {
      const haystack = `${v.brand} ${v.model} ${v.engineCode} ${v.fuelType} ${v.ecuType ?? ''}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [search]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold text-foreground mb-1">Fahrzeugdatenbank</h1>
        <p className="text-sm text-muted-foreground mb-6">{filtered.length} Fahrzeuge in der Datenbank</p>

        <div className="relative max-w-sm mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Marke, Modell, Motorcode..."
            className="w-full pl-9 pr-8 py-2 text-sm rounded-sm bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <XCircle className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="space-y-2">
          {filtered.map((v, i) => (
            <motion.div key={`${v.brand}-${v.model}-${v.engineCode}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.02, 0.5) }}>
              <DataCard>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{v.brand} {v.model}</p>
                        <p className="text-xs text-muted-foreground">{v.fuelType === 'petrol' ? 'Benzin' : v.fuelType === 'diesel' ? 'Diesel' : v.fuelType === 'hybrid' ? 'Hybrid' : 'Elektro'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Motorcode</p>
                      <p className="text-sm font-mono-data text-foreground">{v.engineCode}</p>
                    </div>
                    {v.ecuType && (
                      <div>
                        <p className="text-xs text-muted-foreground">ECU</p>
                        <p className="text-sm font-mono-data text-foreground">{v.ecuType}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Serie</p>
                    <p className="text-sm font-mono-data text-foreground">{v.stockHp} PS / {v.stockNm} Nm</p>
                  </div>
                </div>
              </DataCard>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground italic py-8 text-center">Keine Fahrzeuge gefunden</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
