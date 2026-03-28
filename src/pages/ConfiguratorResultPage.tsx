import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Car, Zap, AlertTriangle, ArrowLeft, Share2, Gauge,
  Shield, Clock, Copy, Check,
} from 'lucide-react';
import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { getResult } from '@/lib/configurator-store';

const riskLabels: Record<string, { label: string; color: string }> = {
  low: { label: 'Niedrig', color: 'text-[hsl(var(--success))]' },
  medium: { label: 'Mittel', color: 'text-[hsl(var(--warning))]' },
  high: { label: 'Hoch', color: 'text-[hsl(var(--destructive))]' },
};

export default function ConfiguratorResultPage() {
  const { id } = useParams<{ id: string }>();
  const result = id ? getResult(id) : undefined;
  const [copied, setCopied] = useState(false);

  if (!result) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <AlertTriangle className="h-8 w-8 text-muted-foreground" />
        <p className="text-muted-foreground">Konfiguration nicht gefunden.</p>
        <Link to="/configurator">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Neue Konfiguration starten
          </Button>
        </Link>
      </div>
    );
  }

  const { vehicle, recommendation: rec, dynoPoints } = result;
  const risk = riskLabels[rec.risk_assessment];

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-lg font-bold tracking-tight text-foreground">
            Tuning<span className="text-primary">Fux</span>
          </a>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleCopyLink} className="gap-1.5 text-xs">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Kopiert' : 'Link teilen'}
            </Button>
            <Link to="/configurator">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <ArrowLeft className="h-3.5 w-3.5" />
                Neue Konfiguration
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Vehicle Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Car className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                {vehicle.engine_code} · {vehicle.ecu_type || 'ECU unbekannt'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {vehicle.brand} {vehicle.model}{' '}
              <span className="text-muted-foreground font-normal">({vehicle.year})</span>
            </h1>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-sm bg-primary/10 text-primary text-xs font-semibold">
              {rec.stage_label}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              ID: {result.id.slice(0, 8)}
            </span>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <StatCard
            icon={<Gauge className="h-4 w-4" />}
            label="Prognose PS"
            value={`${rec.estimated_hp} PS`}
            sub={`+${rec.delta_hp} PS`}
          />
          <StatCard
            icon={<Zap className="h-4 w-4" />}
            label="Prognose Nm"
            value={`${rec.estimated_nm} Nm`}
            sub={`+${rec.delta_nm} Nm`}
          />
          <StatCard
            icon={<Shield className="h-4 w-4" />}
            label="Risiko"
            value={risk.label}
            valueClass={risk.color}
          />
          <StatCard
            icon={<Clock className="h-4 w-4" />}
            label="Erstellt"
            value={new Date(result.createdAt).toLocaleDateString('de-DE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          />
        </motion.div>

        {/* Dyno Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card border border-border rounded-md p-6"
        >
          <h2 className="text-sm font-semibold text-foreground mb-4">
            Prognostizierte Leistungskurve
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dynoPoints}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5% 16%)" />
                <XAxis
                  dataKey="rpm"
                  stroke="hsl(240 5% 40%)"
                  tick={{ fill: 'hsl(240 5% 50%)', fontSize: 11 }}
                  label={{ value: 'RPM', position: 'insideBottom', offset: -4, fill: 'hsl(240 5% 50%)', fontSize: 11 }}
                />
                <YAxis
                  stroke="hsl(240 5% 40%)"
                  tick={{ fill: 'hsl(240 5% 50%)', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(240 8% 7%)',
                    border: '1px solid hsl(240 5% 16%)',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                  labelFormatter={(rpm) => `${rpm} RPM`}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="power"
                  name="PS"
                  stroke="hsl(22 90% 55%)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="torque"
                  name="Nm"
                  stroke="hsl(210 80% 55%)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Description + Components */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="bg-card border border-border rounded-md p-6">
            <h3 className="text-sm font-semibold text-foreground mb-2">Beschreibung</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{rec.description}</p>
          </div>
          <div className="bg-card border border-border rounded-md p-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Komponenten</h3>
            <div className="flex flex-wrap gap-2">
              {rec.components.map((c) => (
                <span
                  key={c}
                  className="px-2.5 py-1 rounded-sm bg-secondary text-secondary-foreground text-xs font-medium"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex items-start gap-3 p-4 rounded-md border border-border bg-card"
        >
          <AlertTriangle className="h-4 w-4 text-[hsl(var(--warning))] shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">{rec.disclaimer}</p>
        </motion.div>

        {/* API Trace */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-[11px] text-muted-foreground/60 font-mono space-y-0.5"
        >
          <p>POST /api/v1/configurator/generate → 201 Created</p>
          <p>
            GET /api/v1/configurator/{result.id.slice(0, 8)} → 200 OK
          </p>
          <p>
            Response: {JSON.stringify({ recommendation_id: rec.id, vehicle_id: vehicle.id }).slice(0, 80)}
          </p>
        </motion.div>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  valueClass?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-md p-4">
      <div className="flex items-center gap-1.5 mb-2 text-muted-foreground">{icon}<span className="text-[10px] uppercase tracking-wider font-medium">{label}</span></div>
      <p className={`text-lg font-bold ${valueClass ?? 'text-foreground'}`}>{value}</p>
      {sub && <p className="text-xs text-primary font-semibold mt-0.5">{sub}</p>}
    </div>
  );
}
