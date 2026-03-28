import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Car, Zap, AlertTriangle, ArrowLeft, Share2, Gauge,
  Shield, Clock, Copy, Check, Euro, Layers,
} from 'lucide-react';
import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { getResult, stageConfigs, getStageTotalPrice, formatPrice } from '@/lib/configurator-store';

// Merge all stage dyno data into one dataset for comparison chart
function mergedCompareData(stages: { dynoPoints: { rpm: number; power: number; torque: number }[] }[]) {
  const s1 = stages[0]?.dynoPoints ?? [];
  const s2 = stages[1]?.dynoPoints ?? [];
  const s3 = stages[2]?.dynoPoints ?? [];
  return s1.map((p, i) => ({
    rpm: p.rpm,
    ps1: p.power,
    nm1: p.torque,
    ps2: s2[i]?.power ?? 0,
    nm2: s2[i]?.torque ?? 0,
    ps3: s3[i]?.power ?? 0,
    nm3: s3[i]?.torque ?? 0,
  }));
}

const riskLabels: Record<string, { label: string; color: string }> = {
  low: { label: 'Niedrig', color: 'text-[hsl(var(--success))]' },
  medium: { label: 'Mittel', color: 'text-[hsl(var(--warning))]' },
  high: { label: 'Hoch', color: 'text-[hsl(var(--destructive))]' },
};

export default function ConfiguratorResultPage() {
  const { id } = useParams<{ id: string }>();
  const result = id ? getResult(id) : undefined;
  const [copied, setCopied] = useState(false);
  const [activeStage, setActiveStage] = useState(result?.selectedStage ?? 1);
  const [compareMode, setCompareMode] = useState(false);

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

  const { vehicle, stages } = result;
  const stageData = stages[activeStage - 1];
  const rec = stageData.recommendation;
  const dynoPoints = stageData.dynoPoints;
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
            Tuning<span className="text-destructive">Fux</span>
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
              <Car className="h-4 w-4 text-destructive" />
              <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                {vehicle.engine_code} · {vehicle.ecu_type || 'ECU unbekannt'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {vehicle.brand} {vehicle.model}{' '}
              <span className="text-muted-foreground font-normal">({vehicle.year})</span>
            </h1>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            ID: {result.id.slice(0, 8)}
          </span>
        </motion.div>

        {/* Stage Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="flex gap-2"
        >
          {stageConfigs.map((cfg) => {
            const isActive = activeStage === cfg.stageId;
            const stageRec = stages[cfg.stageId - 1].recommendation;
            return (
              <button
                key={cfg.stageId}
                onClick={() => setActiveStage(cfg.stageId)}
                className={`flex-1 p-3 rounded-md border text-left transition-all ${
                  isActive
                    ? 'border-destructive bg-destructive/5 ring-1 ring-destructive'
                    : 'border-border bg-card hover:border-muted-foreground/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-destructive' : 'text-muted-foreground'}`}>
                    Stage {cfg.stageId}
                  </span>
                  <span className={`text-[10px] ${riskLabels[cfg.risk].color}`}>
                    {riskLabels[cfg.risk].label}
                  </span>
                </div>
                <p className="text-sm font-bold text-foreground">
                  {stageRec.estimated_hp} PS / {stageRec.estimated_nm} Nm
                </p>
                <p className="text-[10px] text-destructive font-semibold">
                  +{stageRec.delta_hp} PS · +{stageRec.delta_nm} Nm
                </p>
                <p className="text-xs font-bold text-foreground mt-1">
                  {formatPrice(getStageTotalPrice(cfg))}
                </p>
              </button>
            );
          })}
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">
              {compareMode ? 'Stage-Vergleich – Alle Kurven' : `Prognostizierte Leistungskurve \u2013 ${rec.stage_label}`}
            </h2>
            <button
              type="button"
              onClick={() => setCompareMode((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-all ${
                compareMode
                  ? 'border-destructive bg-destructive/10 text-destructive'
                  : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              {compareMode ? 'Einzelansicht' : 'Vergleichsmodus'}
            </button>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {compareMode ? (
                <LineChart data={mergedCompareData(stages)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5% 16%)" />
                  <XAxis
                    dataKey="rpm"
                    stroke="hsl(240 5% 40%)"
                    tick={{ fill: 'hsl(240 5% 50%)', fontSize: 11 }}
                    label={{ value: 'RPM', position: 'insideBottom', offset: -4, fill: 'hsl(240 5% 50%)', fontSize: 11 }}
                  />
                  <YAxis stroke="hsl(240 5% 40%)" tick={{ fill: 'hsl(240 5% 50%)', fontSize: 11 }} />
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
                  {/* Stage 1 */}
                  <Line type="monotone" dataKey="ps1" name="S1 PS" stroke="hsl(var(--destructive))" strokeWidth={1.5} dot={false} strokeDasharray="6 3" />
                  <Line type="monotone" dataKey="nm1" name="S1 Nm" stroke="hsl(210 80% 55%)" strokeWidth={1.5} dot={false} strokeDasharray="6 3" />
                  {/* Stage 2 */}
                  <Line type="monotone" dataKey="ps2" name="S2 PS" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} strokeDasharray="3 2" />
                  <Line type="monotone" dataKey="nm2" name="S2 Nm" stroke="hsl(210 80% 55%)" strokeWidth={2} dot={false} strokeDasharray="3 2" />
                  {/* Stage 3 */}
                  <Line type="monotone" dataKey="ps3" name="S3 PS" stroke="hsl(var(--destructive))" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="nm3" name="S3 Nm" stroke="hsl(210 80% 55%)" strokeWidth={2.5} dot={false} />
                </LineChart>
              ) : (
                <LineChart data={dynoPoints}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5% 16%)" />
                  <XAxis
                    dataKey="rpm"
                    stroke="hsl(240 5% 40%)"
                    tick={{ fill: 'hsl(240 5% 50%)', fontSize: 11 }}
                    label={{ value: 'RPM', position: 'insideBottom', offset: -4, fill: 'hsl(240 5% 50%)', fontSize: 11 }}
                  />
                  <YAxis stroke="hsl(240 5% 40%)" tick={{ fill: 'hsl(240 5% 50%)', fontSize: 11 }} />
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
                  <Line type="monotone" dataKey="power" name="PS" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="torque" name="Nm" stroke="hsl(210 80% 55%)" strokeWidth={2} dot={false} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
          {compareMode && (
            <div className="flex items-center justify-center gap-6 mt-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-6 border-t-2 border-dashed border-destructive" /> Stage 1 (dünn)</span>
              <span className="flex items-center gap-1.5"><span className="w-6 border-t-2 border-destructive" style={{ borderStyle: 'dotted' }} /> Stage 2 (mittel)</span>
              <span className="flex items-center gap-1.5"><span className="w-6 border-t-2 border-destructive" /> Stage 3 (fett)</span>
            </div>
          )}
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
            <h3 className="text-sm font-semibold text-foreground mb-3">Komponenten & Preise</h3>
            <div className="space-y-2">
              {rec.components.map((c) => {
                const price = stageConfigs[activeStage - 1].componentPrices[c] ?? 0;
                return (
                  <div key={c} className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-sm bg-secondary text-secondary-foreground text-xs font-medium">
                      {c}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {price > 0 ? formatPrice(price) : 'inkl.'}
                    </span>
                  </div>
                );
              })}
              <div className="border-t border-border pt-2 mt-3 flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">Gesamt</span>
                <span className="text-sm font-bold text-destructive">
                  {formatPrice(getStageTotalPrice(stageConfigs[activeStage - 1]))}
                </span>
              </div>
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
          <p>POST /api/v1/configurator/generate → 201 Created (stages: 1–3)</p>
          <p>
            GET /api/v1/configurator/{result.id.slice(0, 8)} → 200 OK
          </p>
          <p>
            Response: {JSON.stringify({ recommendation_id: rec.id, stage: activeStage, vehicle_id: vehicle.id }).slice(0, 100)}
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
      {sub && <p className="text-xs text-destructive font-semibold mt-0.5">{sub}</p>}
    </div>
  );
}
