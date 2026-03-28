import { SectionHeader, DataCard } from '@/components/DataComponents';
import { mockDynoSimulations, mockVehicles } from '@/lib/mock-data';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function DynoPage() {
  return (
    <div className="p-6">
      <SectionHeader title="Dyno-Simulationen" sub="Leistungsprognosen auf Basis von Referenzmessungen – vorläufig und fahrzeugabhängig" />

      <div className="space-y-6">
        {mockDynoSimulations.map((sim, i) => {
          const vehicle = mockVehicles.find(v => v.id === sim.vehicle_id);

          return (
            <motion.div key={sim.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <DataCard>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{sim.label}</h3>
                    {vehicle && <p className="text-xs text-muted-foreground">{vehicle.engine_code} · {vehicle.ecu_type}</p>}
                  </div>
                  <div className="flex gap-4 text-right">
                    <div>
                      <p className="text-xs text-muted-foreground">Peak PS</p>
                      <p className="text-lg font-bold font-mono-data text-foreground">{sim.peak_hp} <span className="text-xs text-muted-foreground">@ {sim.peak_hp_rpm} rpm</span></p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Peak Nm</p>
                      <p className="text-lg font-bold font-mono-data text-foreground">{sim.peak_nm} <span className="text-xs text-muted-foreground">@ {sim.peak_nm_rpm} rpm</span></p>
                    </div>
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sim.data_points} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5% 15%)" />
                      <XAxis dataKey="rpm" tick={{ fontSize: 10, fill: 'hsl(240 5% 50%)' }} tickFormatter={v => `${v}`} />
                      <YAxis tick={{ fontSize: 10, fill: 'hsl(240 5% 50%)' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(240 8% 7%)', border: '1px solid hsl(0 0% 100% / 0.05)', borderRadius: '4px', fontSize: '12px' }}
                        labelFormatter={v => `${v} rpm`}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Line type="monotone" dataKey="power" name="Leistung (PS)" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="torque" name="Drehmoment (Nm)" stroke="hsl(210 80% 55%)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-3 pt-2 border-t border-border grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Ansaugtemp.</span>
                    <p className="font-mono-data text-foreground">{sim.environmental_factors.intake_temp_c}°C</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Luftdruck</span>
                    <p className="font-mono-data text-foreground">{sim.environmental_factors.ambient_pressure_hpa} hPa</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Kraftstoff</span>
                    <p className="font-mono-data text-foreground">{sim.environmental_factors.fuel_quality}</p>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-border">
                  <span className="font-mono-data text-[10px] text-muted-foreground/40">{sim.id} · POST /api/v1/dyno-simulations → 201 CREATED</span>
                </div>
              </DataCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
