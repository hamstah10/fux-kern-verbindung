import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, User, Mail, Phone, Car, Euro, ExternalLink, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DataCard, StatusBadge } from '@/components/DataComponents';
import { mockLeads, mockVehicles, mockOrders, leadStatusLabels, orderStatusLabels } from '@/lib/mock-data';
import type { LeadStatus } from '@/types/models';

const leadStatusToDisplay: Record<LeadStatus, 'success' | 'processing' | 'new' | 'warning' | 'error'> = {
  new: 'new', qualified: 'processing', in_progress: 'processing', converted: 'success', lost: 'error',
};

export default function OperationsCustomersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');

  const allStatuses: Array<LeadStatus | 'all'> = ['all', 'new', 'qualified', 'in_progress', 'converted', 'lost'];

  const filtered = mockLeads.filter(lead => {
    if (statusFilter !== 'all' && lead.status !== statusFilter) return false;
    if (search) {
      const vehicle = lead.vehicle_id ? mockVehicles.find(v => v.id === lead.vehicle_id) : undefined;
      const haystack = `${lead.name} ${lead.email} ${lead.phone ?? ''} ${vehicle?.brand ?? ''} ${vehicle?.model ?? ''}`.toLowerCase();
      if (!haystack.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold text-foreground mb-1">Kunden</h1>
        <p className="text-sm text-muted-foreground mb-6">{filtered.length} von {mockLeads.length} Kunden</p>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Name, E-Mail, Fahrzeug..."
              className="w-full pl-9 pr-8 py-2 text-sm rounded-sm bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <XCircle className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="flex gap-1">
            {allStatuses.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1.5 text-xs rounded-sm transition-all ${
                  statusFilter === s
                    ? 'bg-destructive text-destructive-foreground font-medium'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {s === 'all' ? 'Alle' : leadStatusLabels[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Customer List */}
        <div className="space-y-2">
          {filtered.map((lead, i) => {
            const vehicle = lead.vehicle_id ? mockVehicles.find(v => v.id === lead.vehicle_id) : undefined;
            const orders = mockOrders.filter(o => o.lead_id === lead.id);
            const totalRevenue = orders.reduce((sum, o) => sum + o.total_eur, 0);

            return (
              <motion.div key={lead.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <DataCard className="hover:border-muted-foreground/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      {/* Avatar */}
                      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-foreground">
                          {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      {/* Info */}
                      <div>
                        <p className="text-sm font-medium text-foreground">{lead.name}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" /> {lead.email}
                          </span>
                          {lead.phone && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" /> {lead.phone}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Vehicle */}
                      {vehicle && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Car className="h-3.5 w-3.5" />
                          <span>{vehicle.brand} {vehicle.model}</span>
                        </div>
                      )}
                      {/* Revenue */}
                      {totalRevenue > 0 && (
                        <div className="flex items-center gap-1 text-xs font-mono-data text-foreground">
                          <Euro className="h-3 w-3 text-muted-foreground" />
                          €{totalRevenue.toLocaleString('de-DE')}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={leadStatusToDisplay[lead.status]} label={leadStatusLabels[lead.status]} />
                      <Link to={`/admin/leads/${lead.id}`} className="text-muted-foreground hover:text-foreground transition-colors">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </DataCard>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground italic py-8 text-center">Keine Kunden gefunden</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
