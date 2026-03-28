import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SectionHeader, StatusBadge, DataCard, EmptyState } from '@/components/DataComponents';
import { mockLeads, sourceLabels, leadStatusLabels } from '@/lib/mock-data';
import type { Lead, LeadStatus } from '@/types/models';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, ExternalLink } from 'lucide-react';

const leadStatusToDisplay: Record<LeadStatus, 'success' | 'processing' | 'new' | 'warning' | 'error'> = {
  new: 'new', qualified: 'processing', in_progress: 'processing', converted: 'success', lost: 'error',
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [filter, setFilter] = useState<LeadStatus | 'all'>('all');
  const [showCreate, setShowCreate] = useState(false);

  const filtered = filter === 'all' ? leads : leads.filter(l => l.status === filter);
  const counts = {
    all: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    in_progress: leads.filter(l => l.status === 'in_progress').length,
    converted: leads.filter(l => l.status === 'converted').length,
    lost: leads.filter(l => l.status === 'lost').length,
  };

  const updateStatus = (id: string, status: LeadStatus) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status, updated_at: new Date().toISOString() } : l));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <SectionHeader title="Leads" sub="Lead-Management und Source-Tracking" />
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 rounded-sm text-primary-foreground text-sm font-medium transition-colors bg-destructive"
        >
          <Plus className="h-4 w-4" />
          Lead anlegen
        </button>
      </div>

      {/* Inline Create */}
      {showCreate && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4">
          <CreateLeadForm onCreated={(lead) => { setLeads(prev => [lead, ...prev]); setShowCreate(false); }} onCancel={() => setShowCreate(false)} />
        </motion.div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-4 border-b border-border pb-2">
        {(['all', 'new', 'qualified', 'in_progress', 'converted', 'lost'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs rounded-sm transition-colors ${filter === s ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {s === 'all' ? 'Alle' : leadStatusLabels[s]} ({counts[s]})
          </button>
        ))}
      </div>

      {/* Lead Table */}
      <DataCard>
        {filtered.length === 0 ? (
          <EmptyState message="Keine Leads in dieser Kategorie" />
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((lead, i) => (
              <LeadRow key={lead.id} lead={lead} index={i} onStatusChange={updateStatus} />
            ))}
          </div>
        )}
      </DataCard>
    </div>
  );
}

function LeadRow({ lead, index, onStatusChange }: { lead: Lead; index: number; onStatusChange: (id: string, s: LeadStatus) => void }) {
  const [expanded, setExpanded] = useState(false);
  const timeAgo = getTimeAgo(lead.created_at);

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <div className="flex items-center gap-4 py-3 px-2 cursor-pointer hover:bg-muted/20 transition-colors" onClick={() => setExpanded(!expanded)}>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{lead.name}</p>
          <p className="text-xs text-muted-foreground">{lead.email}</p>
        </div>
        <span className="text-xs text-muted-foreground">{sourceLabels[lead.source_metadata.type]}</span>
        <StatusBadge status={leadStatusToDisplay[lead.status]} label={leadStatusLabels[lead.status]} />
        <span className="text-xs text-muted-foreground font-mono-data w-20 text-right">{timeAgo}</span>
        <Link to={`/admin/leads/${lead.id}`} onClick={e => e.stopPropagation()} className="text-muted-foreground hover:text-foreground transition-colors">
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
      {expanded && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pb-3 border-t border-border/50 bg-muted/10">
          <div className="grid grid-cols-3 gap-4 py-3 text-xs">
            <div>
              <span className="text-muted-foreground">Quelle:</span>
              <p className="text-foreground font-mono-data">{JSON.stringify(lead.source_metadata, null, 0)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Fahrzeug:</span>
              <p className="text-foreground font-mono-data">{lead.vehicle_id || '–'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Händler:</span>
              <p className="text-foreground font-mono-data">{lead.assigned_dealer_id || '–'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {lead.status !== 'converted' && lead.status !== 'lost' && (
              <>
                {lead.status === 'new' && (
                  <StatusButton label="Qualifizieren" onClick={() => onStatusChange(lead.id, 'qualified')} />
                )}
                {lead.status === 'qualified' && (
                  <StatusButton label="In Bearbeitung" onClick={() => onStatusChange(lead.id, 'in_progress')} />
                )}
                {lead.status === 'in_progress' && (
                  <StatusButton label="Konvertieren" onClick={() => onStatusChange(lead.id, 'converted')} />
                )}
                <StatusButton label="Als verloren markieren" onClick={() => onStatusChange(lead.id, 'lost')} variant="destructive" />
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function StatusButton({ label, onClick, variant }: { label: string; onClick: () => void; variant?: 'destructive' }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`px-3 py-1.5 text-xs rounded-sm transition-colors ${
        variant === 'destructive'
          ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
          : 'bg-primary/10 text-primary hover:bg-primary/20'
      }`}
    >
      {label}
    </button>
  );
}

function CreateLeadForm({ onCreated, onCancel }: { onCreated: (lead: Lead) => void; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [source, setSource] = useState<string>('organic');

  const handleSubmit = () => {
    if (!name || !email) return;
    const newLead: Lead = {
      id: `l-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'new',
      name, email,
      source_metadata: { type: source as any },
    };
    onCreated(newLead);
  };

  return (
    <DataCard>
      <h3 className="text-sm font-semibold text-foreground mb-3">Neuen Lead anlegen</h3>
      <div className="grid grid-cols-3 gap-3 mb-3">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="px-3 py-2 text-sm rounded-sm bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="E-Mail" className="px-3 py-2 text-sm rounded-sm bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
        <select value={source} onChange={e => setSource(e.target.value)} className="px-3 py-2 text-sm rounded-sm bg-input border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
          {Object.entries(sourceLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <div className="flex gap-2">
        <button onClick={handleSubmit} className="px-4 py-2 text-xs rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          POST /api/v1/leads → 201 CREATED
        </button>
        <button onClick={onCancel} className="px-4 py-2 text-xs rounded-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
          Abbrechen
        </button>
      </div>
    </DataCard>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}
