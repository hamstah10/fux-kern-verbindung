import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, XCircle, Mail, Send, Inbox, Clock, User, Paperclip, Star, StarOff, ArrowRight, X } from 'lucide-react';
import { DataCard } from '@/components/DataComponents';
import { mockLeads } from '@/lib/mock-data';

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

export default function OperationsEmailPage() {
  const [folder, setFolder] = useState<EmailFolder>('inbox');
  const [search, setSearch] = useState('');
  const [emails, setEmails] = useState(mockEmails);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);

  const folderEmails = emails.filter(e => e.folder === folder);
  const filtered = folderEmails.filter(e => {
    if (!search) return true;
    const haystack = `${e.from_name} ${e.from_email} ${e.to_name} ${e.to_email} ${e.subject} ${e.preview}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const unreadCount = emails.filter(e => e.folder === 'inbox' && !e.read).length;

  const handleSelect = (email: EmailMessage) => {
    setSelectedEmail(email);
    if (!email.read) {
      setEmails(prev => prev.map(e => e.id === email.id ? { ...e, read: true } : e));
    }
  };

  const handleToggleStar = (emailId: string) => {
    setEmails(prev => prev.map(e => e.id === emailId ? { ...e, starred: !e.starred } : e));
    setSelectedEmail(prev => prev?.id === emailId ? { ...prev, starred: !prev.starred } : prev);
  };

  return (
    <div className="p-6 h-[calc(100vh-3.5rem)] flex flex-col max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col flex-1 min-h-0">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-foreground">E-Mail</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-5">{unreadCount} ungelesen</p>

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex gap-1">
            <button
              onClick={() => { setFolder('inbox'); setSelectedEmail(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-sm transition-all ${
                folder === 'inbox' ? 'bg-destructive text-destructive-foreground font-medium' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <Inbox className="h-3.5 w-3.5" /> Posteingang
              {unreadCount > 0 && folder !== 'inbox' && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold">{unreadCount}</span>
              )}
            </button>
            <button
              onClick={() => { setFolder('sent'); setSelectedEmail(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-sm transition-all ${
                folder === 'sent' ? 'bg-destructive text-destructive-foreground font-medium' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <Send className="h-3.5 w-3.5" /> Gesendet
            </button>
          </div>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="E-Mails durchsuchen..."
              className="w-full pl-9 pr-8 py-1.5 text-sm rounded-sm bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <XCircle className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex gap-0 min-h-0">
          {/* Email List */}
          <div className={`flex-1 overflow-y-auto space-y-1 pr-1 ${selectedEmail ? 'max-w-[calc(100%-440px)]' : ''}`}>
            {filtered.map((email, i) => {
              const timeDisplay = formatTimeShort(email.timestamp);
              return (
                <motion.div key={email.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                  <button onClick={() => handleSelect(email)} className="w-full text-left">
                    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-sm border transition-all cursor-pointer ${
                      selectedEmail?.id === email.id
                        ? 'border-destructive/50 bg-destructive/5'
                        : email.read
                          ? 'border-transparent hover:bg-secondary/40'
                          : 'border-transparent bg-secondary/20 hover:bg-secondary/40'
                    }`}>
                      {/* Star */}
                      <button
                        onClick={e => { e.stopPropagation(); handleToggleStar(email.id); }}
                        className="shrink-0 text-muted-foreground hover:text-[hsl(var(--warning))] transition-colors"
                      >
                        {email.starred
                          ? <Star className="h-3.5 w-3.5 fill-[hsl(var(--warning))] text-[hsl(var(--warning))]" />
                          : <StarOff className="h-3.5 w-3.5" />
                        }
                      </button>

                      {/* Unread dot */}
                      <div className="w-2 shrink-0">
                        {!email.read && <div className="h-2 w-2 rounded-full bg-destructive" />}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm truncate ${email.read ? 'text-foreground' : 'text-foreground font-semibold'}`}>
                            {folder === 'inbox' ? email.from_name : email.to_name}
                          </span>
                          <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{timeDisplay}</span>
                        </div>
                        <p className={`text-xs truncate ${email.read ? 'text-muted-foreground' : 'text-foreground'}`}>{email.subject}</p>
                        <p className="text-[11px] text-muted-foreground/60 truncate">{email.preview}</p>
                      </div>

                      {email.attachment && <Paperclip className="h-3 w-3 text-muted-foreground shrink-0" />}
                    </div>
                  </button>
                </motion.div>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground italic py-8 text-center">Keine E-Mails gefunden</p>
            )}
          </div>

          {/* Email Detail */}
          <AnimatePresence>
            {selectedEmail && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 440, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="shrink-0 overflow-hidden ml-3"
              >
                <div className="w-[440px] h-full border border-border rounded-sm bg-card overflow-y-auto">
                  {/* Header */}
                  <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-bold text-foreground truncate max-w-[300px]">{selectedEmail.subject}</span>
                    </div>
                    <button onClick={() => setSelectedEmail(null)} className="p-1.5 rounded-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* From / To */}
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-foreground">
                          {selectedEmail.from_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{selectedEmail.from_name}</p>
                        <p className="text-xs text-muted-foreground">{selectedEmail.from_email}</p>
                        <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                          <ArrowRight className="h-2.5 w-2.5" />
                          <span>{selectedEmail.to_name} ({selectedEmail.to_email})</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {new Date(selectedEmail.timestamp).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Attachment */}
                    {selectedEmail.attachment && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-sm bg-secondary/50 border border-border">
                        <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-foreground font-mono-data">{selectedEmail.attachment}</span>
                      </div>
                    )}

                    {/* Body */}
                    <div className="text-sm text-foreground whitespace-pre-line leading-relaxed border-t border-border pt-4">
                      {selectedEmail.body}
                    </div>

                    {/* Quick Reply */}
                    <div className="border-t border-border pt-4">
                      <textarea
                        rows={3}
                        placeholder="Antwort schreiben..."
                        className="w-full px-3 py-2 text-sm rounded-sm bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                      />
                      <button className="mt-2 px-3 py-1.5 text-xs rounded-sm bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors flex items-center gap-1">
                        <Send className="h-3 w-3" /> Antworten
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function formatTimeShort(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return new Date(isoString).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}
