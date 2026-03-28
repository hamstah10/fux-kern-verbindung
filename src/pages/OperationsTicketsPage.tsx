import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, XCircle, MessageSquare, Clock, User, AlertCircle, CheckCircle, X as XIcon, Filter } from 'lucide-react';
import { DataCard, StatusBadge } from '@/components/DataComponents';
import { mockLeads } from '@/lib/mock-data';
import { toast } from 'sonner';

type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';

interface Ticket {
  id: string;
  subject: string;
  customer_name: string;
  customer_email: string;
  priority: TicketPriority;
  status: TicketStatus;
  category: string;
  created_at: string;
  last_reply_at: string;
  messages: number;
}

const priorityColors: Record<TicketPriority, string> = {
  low: 'text-muted-foreground',
  medium: 'text-[hsl(var(--processing))]',
  high: 'text-[hsl(var(--warning))]',
  urgent: 'text-destructive',
};
const priorityLabels: Record<TicketPriority, string> = { low: 'Niedrig', medium: 'Mittel', high: 'Hoch', urgent: 'Dringend' };
const statusDisplay: Record<TicketStatus, 'new' | 'processing' | 'warning' | 'success' | 'error'> = {
  open: 'new', in_progress: 'processing', waiting: 'warning', resolved: 'success', closed: 'success',
};
const statusLabels: Record<TicketStatus, string> = { open: 'Offen', in_progress: 'In Bearbeitung', waiting: 'Warte auf Antwort', resolved: 'Gelöst', closed: 'Geschlossen' };
const allStatuses: Array<TicketStatus | 'all'> = ['all', 'open', 'in_progress', 'waiting', 'resolved', 'closed'];

const ago = (mins: number) => new Date(Date.now() - mins * 60000).toISOString();

const mockTickets: Ticket[] = [
  { id: 'TK-001', subject: 'Stage 2 Map läuft unrund im Teillastbereich', customer_name: mockLeads[0]?.name ?? 'Max Mustermann', customer_email: mockLeads[0]?.email ?? 'max@test.de', priority: 'high', status: 'open', category: 'Tuning-Problem', created_at: ago(120), last_reply_at: ago(45), messages: 3 },
  { id: 'TK-002', subject: 'Rechnung für Dyno-Session fehlt', customer_name: mockLeads[1]?.name ?? 'Lisa M.', customer_email: mockLeads[1]?.email ?? 'lisa@test.de', priority: 'medium', status: 'in_progress', category: 'Abrechnung', created_at: ago(1440), last_reply_at: ago(360), messages: 5 },
  { id: 'TK-003', subject: 'Wann ist mein ECU-File fertig?', customer_name: mockLeads[2]?.name ?? 'Tom S.', customer_email: mockLeads[2]?.email ?? 'tom@test.de', priority: 'low', status: 'waiting', category: 'Status-Anfrage', created_at: ago(2880), last_reply_at: ago(1440), messages: 2 },
  { id: 'TK-004', subject: 'Fehlerspeicher nach Remap – P0299 Boost Pressure', customer_name: mockLeads[3]?.name ?? 'Julia K.', customer_email: mockLeads[3]?.email ?? 'julia@test.de', priority: 'urgent', status: 'open', category: 'Tuning-Problem', created_at: ago(30), last_reply_at: ago(15), messages: 1 },
  { id: 'TK-005', subject: 'Partner-Werkstatt in Hamburg gesucht', customer_name: mockLeads[4]?.name ?? 'Paul B.', customer_email: mockLeads[4]?.email ?? 'paul@test.de', priority: 'low', status: 'resolved', category: 'Allgemein', created_at: ago(10080), last_reply_at: ago(7200), messages: 4 },
  { id: 'TK-006', subject: 'DSG-Anpassung nicht gespeichert', customer_name: mockLeads[0]?.name ?? 'Max M.', customer_email: mockLeads[0]?.email ?? 'max@test.de', priority: 'high', status: 'in_progress', category: 'Tuning-Problem', created_at: ago(600), last_reply_at: ago(180), messages: 7 },
  { id: 'TK-007', subject: 'Garantiefrage nach Stage 1', customer_name: mockLeads[1]?.name ?? 'Lisa M.', customer_email: mockLeads[1]?.email ?? 'lisa@test.de', priority: 'medium', status: 'closed', category: 'Allgemein', created_at: ago(20160), last_reply_at: ago(14400), messages: 6 },
];

export default function OperationsTicketsPage() {
  const [tickets, setTickets] = useState(mockTickets);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const filtered = tickets.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (search) {
      const haystack = `${t.id} ${t.subject} ${t.customer_name} ${t.customer_email} ${t.category}`.toLowerCase();
      if (!haystack.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  const handleStatusChange = useCallback((ticketId: string, newStatus: TicketStatus) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
    setSelectedTicket(prev => prev?.id === ticketId ? { ...prev, status: newStatus } : prev);
    toast.success(`Ticket ${ticketId} → ${statusLabels[newStatus]}`);
  }, []);

  const openCount = tickets.filter(t => t.status === 'open').length;
  const urgentCount = tickets.filter(t => t.priority === 'urgent' && t.status !== 'closed' && t.status !== 'resolved').length;

  return (
    <div className="p-6 h-[calc(100vh-3.5rem)] flex flex-col">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col flex-1 min-h-0">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-foreground">Support-Tickets</h1>
          {urgentCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-destructive font-medium">
              <AlertCircle className="h-3.5 w-3.5" /> {urgentCount} dringend
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-5">{openCount} offen · {filtered.length} angezeigt</p>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Ticket, Betreff, Kunde..."
              className="w-full pl-9 pr-8 py-1.5 text-sm rounded-sm bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <XCircle className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Filter className="h-3.5 w-3.5 text-muted-foreground mr-1" />
            {allStatuses.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2 py-1 text-[10px] rounded-sm transition-all ${
                  statusFilter === s ? 'bg-destructive text-destructive-foreground font-medium' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {s === 'all' ? 'Alle' : statusLabels[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex gap-0 min-h-0">
          {/* Ticket List */}
          <div className={`flex-1 overflow-y-auto space-y-2 pr-1 ${selectedTicket ? 'max-w-[calc(100%-400px)]' : ''}`}>
            {filtered.map((ticket, i) => {
              const timeAgo = formatTimeAgo(ticket.last_reply_at);
              return (
                <motion.div key={ticket.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <button onClick={() => setSelectedTicket(ticket)} className="w-full text-left">
                    <DataCard className={`transition-all hover:border-muted-foreground/30 cursor-pointer ${
                      selectedTicket?.id === ticket.id ? 'ring-1 ring-destructive border-destructive/50' : ''
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-mono-data text-muted-foreground">{ticket.id}</span>
                            <span className={`text-[10px] font-semibold ${priorityColors[ticket.priority]}`}>● {priorityLabels[ticket.priority]}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-secondary text-secondary-foreground">{ticket.category}</span>
                          </div>
                          <p className="text-sm font-medium text-foreground truncate">{ticket.subject}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <User className="h-3 w-3" /> {ticket.customer_name}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MessageSquare className="h-3 w-3" /> {ticket.messages}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" /> {timeAgo}
                            </span>
                          </div>
                        </div>
                        <StatusBadge status={statusDisplay[ticket.status]} label={statusLabels[ticket.status]} />
                      </div>
                    </DataCard>
                  </button>
                </motion.div>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground italic py-8 text-center">Keine Tickets gefunden</p>
            )}
          </div>

          {/* Detail Panel */}
          <AnimatePresence>
            {selectedTicket && (
              <TicketDetailPanel
                ticket={selectedTicket}
                onClose={() => setSelectedTicket(null)}
                onStatusChange={handleStatusChange}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function TicketDetailPanel({ ticket, onClose, onStatusChange }: {
  ticket: Ticket;
  onClose: () => void;
  onStatusChange: (id: string, status: TicketStatus) => void;
}) {
  const created = new Date(ticket.created_at).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const lastReply = formatTimeAgo(ticket.last_reply_at);

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 400, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="shrink-0 overflow-hidden ml-3"
    >
      <div className="w-[400px] h-full border border-border rounded-sm bg-card overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">{ticket.id}</span>
            <StatusBadge status={statusDisplay[ticket.status]} label={statusLabels[ticket.status]} />
          </div>
          <button onClick={onClose} className="p-1.5 rounded-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Subject */}
          <div>
            <p className="text-base font-medium text-foreground">{ticket.subject}</p>
            <span className={`text-xs font-semibold ${priorityColors[ticket.priority]}`}>● {priorityLabels[ticket.priority]}</span>
            <span className="text-xs text-muted-foreground ml-2">{ticket.category}</span>
          </div>

          {/* Customer */}
          <div>
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Kunde</h4>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-xs font-bold text-foreground">{ticket.customer_name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
              </div>
              <div>
                <p className="text-sm text-foreground">{ticket.customer_name}</p>
                <p className="text-xs text-muted-foreground">{ticket.customer_email}</p>
              </div>
            </div>
          </div>

          {/* Status Change */}
          <div>
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Status ändern</h4>
            <div className="flex flex-wrap gap-1">
              {(['open', 'in_progress', 'waiting', 'resolved', 'closed'] as TicketStatus[]).map(s => (
                <button
                  key={s}
                  onClick={() => onStatusChange(ticket.id, s)}
                  className={`px-2 py-1 text-[10px] rounded-sm transition-all ${
                    ticket.status === s ? 'bg-destructive text-destructive-foreground font-medium' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {statusLabels[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Metadata */}
          <div>
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Details</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Erstellt</p>
                  <p className="text-sm text-foreground">{created}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Nachrichten</p>
                  <p className="text-sm text-foreground">{ticket.messages}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Letzte Antwort</p>
                  <p className="text-sm text-foreground">{lastReply}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Reply Placeholder */}
          <div>
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Schnellantwort</h4>
            <textarea
              rows={3}
              placeholder="Antwort schreiben..."
              className="w-full px-3 py-2 text-sm rounded-sm bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
            <button
              onClick={() => toast.success('Antwort gesendet (Demo)')}
              className="mt-2 px-3 py-1.5 text-xs rounded-sm bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors flex items-center gap-1"
            >
              <CheckCircle className="h-3 w-3" /> Senden
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function formatTimeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `vor ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `vor ${hours}h`;
  const days = Math.floor(hours / 24);
  return `vor ${days}d`;
}
