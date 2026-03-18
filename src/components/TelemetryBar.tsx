import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockTelemetry } from '@/lib/mock-data';
import type { TelemetryEntry } from '@/types/models';

const methodColor: Record<string, string> = {
  GET: 'text-emerald-400',
  POST: 'text-blue-400',
  PUT: 'text-amber-400',
  PATCH: 'text-amber-400',
  DELETE: 'text-red-400',
};

const statusColor = (s: number) => {
  if (s >= 200 && s < 300) return 'text-emerald-400';
  if (s >= 400 && s < 500) return 'text-amber-400';
  return 'text-red-400';
};

export function TelemetryBar() {
  const [expanded, setExpanded] = useState(false);
  const latest = mockTelemetry[0];
  const entries = expanded ? mockTelemetry : [latest];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[hsl(var(--telemetry-bg))] border-t border-border">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left"
      >
        <div className="flex items-center gap-3 px-4 py-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="telemetry-entry">API TELEMETRY</span>
          <TelemetryLine entry={latest} />
          <span className="ml-auto telemetry-entry opacity-50">
            {expanded ? '▼' : '▲'} {mockTelemetry.length} requests
          </span>
        </div>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="max-h-48 overflow-y-auto px-4 py-1">
              {mockTelemetry.slice(1).map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 py-0.5">
                  <TelemetryLine entry={entry} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TelemetryLine({ entry }: { entry: TelemetryEntry }) {
  return (
    <span className="telemetry-entry flex items-center gap-2">
      <span className={`font-semibold ${methodColor[entry.method] || ''}`}>[{entry.method}]</span>
      <span className="text-muted-foreground">{entry.endpoint}</span>
      <span className="text-muted-foreground">...</span>
      <span className={statusColor(entry.status)}>{entry.status} {entry.status === 201 ? 'CREATED' : entry.status === 200 ? 'OK' : 'ERROR'}</span>
      <span className="text-muted-foreground/60">({entry.duration_ms}ms)</span>
    </span>
  );
}
