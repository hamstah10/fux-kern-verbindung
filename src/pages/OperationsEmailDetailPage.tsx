import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Send, Paperclip, Star, StarOff, ArrowRight, Clock, User } from 'lucide-react';
import { DataCard } from '@/components/DataComponents';
import { mockLeads } from '@/lib/mock-data';
import { toast } from 'sonner';
import { PinToTabButton } from '@/components/PinToTabButton';

type EmailFolder = 'inbox' | 'sent';

interface EmailMessage {
  id: string;
  folder: EmailFolder;
  from_name: string;
  from_email: string;
  to_name: string;
  to_email: string;
  subject: string;
  preview: string;
  body: string;
  timestamp: string;
  read: boolean;
  starred: boolean;
  attachment?: string;
}

const ago = (mins: number) => new Date(Date.now() - mins * 60000).toISOString();

const mockEmails: EmailMessage[] = [
  { id: 'em-001', folder: 'inbox', from_name: mockLeads[0]?.name ?? 'Max M.', from_email: mockLeads[0]?.email ?? 'max@test.de', to_name: 'Operations', to_email: 'ops@tuningfux.de', subject: 'Frage zur Stage 2 Map', preview: 'Hallo, ich habe eine Frage bezüglich der Stage 2 Map für meinen Golf GTI...', body: 'Hallo,\n\nich habe eine Frage bezüglich der Stage 2 Map für meinen Golf GTI. Im Teillastbereich bei ca. 2500rpm scheint die Map unrund zu laufen. Könnt ihr das prüfen?\n\nVielen Dank!\nMax', timestamp: ago(25), read: false, starred: true },
  { id: 'em-002', folder: 'inbox', from_name: mockLeads[1]?.name ?? 'Lisa M.', from_email: mockLeads[1]?.email ?? 'lisa@test.de', to_name: 'Operations', to_email: 'ops@tuningfux.de', subject: 'Rechnung Dyno-Session #4521', preview: 'Könntet ihr mir bitte die Rechnung für die Dyno-Session vom 15.03. nochmal zusenden?', body: 'Hallo Team,\n\nkönntet ihr mir bitte die Rechnung für die Dyno-Session vom 15.03. nochmal zusenden? Ich habe sie leider nicht mehr.\n\nDanke im Voraus!\nLisa', timestamp: ago(180), read: true, starred: false },
  { id: 'em-003', folder: 'sent', from_name: 'Operations', from_email: 'ops@tuningfux.de', to_name: mockLeads[2]?.name ?? 'Tom S.', to_email: mockLeads[2]?.email ?? 'tom@test.de', subject: 'Re: ECU-File Status Update', preview: 'Dein ECU-File befindet sich aktuell in der Qualitätsprüfung...', body: 'Hallo Tom,\n\ndein ECU-File befindet sich aktuell in der Qualitätsprüfung und sollte bis morgen Nachmittag fertig sein. Wir melden uns, sobald es zum Download bereit steht.\n\nViele Grüße\nTuningFux Operations', timestamp: ago(420), read: true, starred: false },
  { id: 'em-004', folder: 'inbox', from_name: mockLeads[3]?.name ?? 'Julia K.', from_email: mockLeads[3]?.email ?? 'julia@test.de', to_name: 'Operations', to_email: 'ops@tuningfux.de', subject: 'P0299 nach Remap – dringend!', preview: 'Nach dem Remap zeigt mein Fehlerspeicher P0299 Ladedruck zu niedrig an...', body: 'Hallo!\n\nNach dem Remap zeigt mein Fehlerspeicher P0299 Ladedruck zu niedrig an. Das Auto geht in den Notlauf. Bitte dringend um Hilfe!\n\nJulia', timestamp: ago(15), read: false, starred: true, attachment: 'fehlerspeicher_screenshot.png' },
  { id: 'em-005', folder: 'sent', from_name: 'Operations', from_email: 'ops@tuningfux.de', to_name: mockLeads[0]?.name ?? 'Max M.', to_email: mockLeads[0]?.email ?? 'max@test.de', subject: 'Re: DSG-Anpassung Bestätigung', preview: 'Wir haben die DSG-Anpassung für deinen Golf GTI erfolgreich durchgeführt...', body: 'Hallo Max,\n\nwir haben die DSG-Anpassung für deinen Golf GTI erfolgreich durchgeführt. Die neuen Schaltpunkte sind optimiert für die Stage 2 Map.\n\nBitte teste und gib uns Feedback!\n\nViele Grüße\nTuningFux Operations', timestamp: ago(720), read: true, starred: false },
  { id: 'em-006', folder: 'inbox', from_name: mockLeads[4]?.name ?? 'Paul B.', from_email: mockLeads[4]?.email ?? 'paul@test.de', to_name: 'Operations', to_email: 'ops@tuningfux.de', subject: 'Partner-Werkstatt Empfehlung Hamburg', preview: 'Danke für die Empfehlung! Ich werde mich bei der Werkstatt melden...', body: 'Hallo,\n\ndanke für die Empfehlung! Ich werde mich bei der Werkstatt in Hamburg melden und einen Termin vereinbaren.\n\nGrüße\nPaul', timestamp: ago(4320), read: true, starred: false },
];

export default function OperationsEmailDetailPage() {
  const { id } = useParams<{ id: string }>();
  const email = mockEmails.find(e => e.id === id);
  const [starred, setStarred] = useState(email?.starred ?? false);
  const [replyText, setReplyText] = useState('');

  if (!email) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Link to="/operations/email" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Zurück zu E-Mail
        </Link>
        <p className="text-muted-foreground">E-Mail nicht gefunden.</p>
      </div>
    );
  }

  const timestamp = new Date(email.timestamp).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const handleReply = () => {
    if (!replyText.trim()) return;
    toast.success('Antwort gesendet (Demo)');
    setReplyText('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Link to="/operations/email" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Zurück zu E-Mail
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground">{email.subject}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {email.folder === 'inbox' ? `Von ${email.from_name}` : `An ${email.to_name}`} · {timestamp}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setStarred(s => !s)} className="text-muted-foreground hover:text-[hsl(var(--warning))] transition-colors">
              {starred
                ? <Star className="h-5 w-5 fill-[hsl(var(--warning))] text-[hsl(var(--warning))]" />
                : <StarOff className="h-5 w-5" />
              }
            </button>
            <PinToTabButton type="email" label={email.subject.slice(0, 30)} path={`/operations/email/${email.id}`} />
          </div>
        </div>

        {/* From/To */}
        <DataCard className="mb-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-foreground">
                {email.from_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{email.from_name}</span>
                <span className="text-xs text-muted-foreground">&lt;{email.from_email}&gt;</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm text-foreground">{email.to_name}</span>
                <span className="text-xs text-muted-foreground">&lt;{email.to_email}&gt;</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{timestamp}</span>
              </div>
            </div>
          </div>
        </DataCard>

        {/* Attachment */}
        {email.attachment && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-sm bg-secondary/50 border border-border mb-6">
            <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-foreground font-mono-data">{email.attachment}</span>
          </div>
        )}

        {/* Body */}
        <DataCard className="mb-6">
          <div className="text-sm text-foreground whitespace-pre-line leading-relaxed">
            {email.body}
          </div>
        </DataCard>

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
            <Send className="h-3 w-3" /> Antworten
          </button>
        </DataCard>
      </motion.div>
    </div>
  );
}
