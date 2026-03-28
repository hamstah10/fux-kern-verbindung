import { useParams, Link } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageSquare, Clock, User, AlertCircle, CheckCircle, Mail } from 'lucide-react';
import { DataCard, StatusBadge } from '@/components/DataComponents';
import { mockLeads } from '@/lib/mock-data';
import { toast } from 'sonner';
import { PinToTabButton } from '@/components/PinToTabButton';

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
  low: 'text-muted-foreground', medium: 'text-[hsl(var(--processing))]', high: 'text-[hsl(var(--warning))]', urgent: 'text-destructive',
};
const priorityLabels: Record<TicketPriority, string> = { low: 'Niedrig', medium: 'Mittel', high: 'Hoch', urgent: 'Dringend' };
const statusDisplay: Record<TicketStatus, 'new' | 'processing' | 'warning' | 'success' | 'error'> = {
  open: 'new', in_progress: 'processing', waiting: 'warning', resolved: 'success', closed: 'success',
};
const statusLabels: Record<TicketStatus, string> = { open: 'Offen', in_progress: 'In Bearbeitung', waiting: 'Warte auf Antwort', resolved: 'Gelöst', closed: 'Geschlossen' };

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

function formatTimeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `vor ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `vor ${hours}h`;
  const days = Math.floor(hours / 24);
  return `vor ${days}d`;
}

export default function OperationsTicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const ticket = mockTickets.find(t => t.id === id);

  const [status, setStatus] = useState<TicketStatus>(ticket?.status ?? 'open');
  const [replyText, setReplyText] = useState('');

  if (!ticket) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Link to="/operations/tickets" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Zurück zu Tickets
        </Link>
        <p className="text-muted-foreground">Ticket nicht gefunden.</p>
      </div>
    );
  }

  const created = new Date(ticket.created_at).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const handleStatusChange = (newStatus: TicketStatus) => {
    setStatus(newStatus);
    toast.success(`Ticket ${ticket.id} → ${statusLabels[newStatus]}`);
  };

  const handleReply = () => {
    if (!replyText.trim()) return;
    toast.success('Antwort gesendet (Demo)');
    setReplyText('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Link to="/operations/tickets" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Zurück zu Tickets
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-mono-data text-muted-foreground">{ticket.id}</span>
              <span className={`text-xs font-semibold ${priorityColors[ticket.priority]}`}>● {priorityLabels[ticket.priority]}</span>
              <span className="text-xs px-1.5 py-0.5 rounded-sm bg-secondary text-secondary-foreground">{ticket.category}</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">{ticket.subject}</h1>
          </div>
          <div className="flex items-center gap-3">
            <PinToTabButton type="ticket" label={`${ticket.id} – ${ticket.subject.slice(0, 25)}`} path={`/operations/tickets/${ticket.id}`} />
            <StatusBadge status={statusDisplay[status]} label={statusLabels[status]} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Customer */}
          <DataCard>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Kunde</h3>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-xs font-bold text-foreground">{ticket.customer_name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{ticket.customer_name}</p>
                <p className="text-xs text-muted-foreground">{ticket.customer_email}</p>
              </div>
            </div>
          </DataCard>

          {/* Details */}
          <DataCard>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Details</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Erstellt:</span>
                <span className="text-sm text-foreground">{created}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Nachrichten:</span>
                <span className="text-sm text-foreground">{ticket.messages}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Letzte Antwort:</span>
                <span className="text-sm text-foreground">{formatTimeAgo(ticket.last_reply_at)}</span>
              </div>
            </div>
          </DataCard>

          {/* Status Change */}
          <DataCard>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Status ändern</h3>
            <div className="flex flex-wrap gap-1">
              {(['open', 'in_progress', 'waiting', 'resolved', 'closed'] as TicketStatus[]).map(s => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={`px-2.5 py-1.5 text-xs rounded-sm transition-all ${
                    status === s ? 'bg-destructive text-destructive-foreground font-medium' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {statusLabels[s]}
                </button>
              ))}
            </div>
          </DataCard>
        </div>

        {/* Reply */}
        <DataCard>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Antwort schreiben</h3>
          <textarea
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            rows={4}
            placeholder="Antwort schreiben..."
            className="w-full px-3 py-2 text-sm rounded-sm bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          />
          <button
            onClick={handleReply}
            className="mt-2 px-3 py-1.5 text-xs rounded-sm bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors flex items-center gap-1"
          >
            <CheckCircle className="h-3 w-3" /> Senden
          </button>
        </DataCard>
      </motion.div>
    </div>
  );
}
