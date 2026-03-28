import { motion } from 'framer-motion';
import { DataCard } from '@/components/DataComponents';
import { User, Star, ShieldCheck, Clock, TrendingUp } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  activeOrders: number;
  completedThisMonth: number;
  avgResponseHours: number;
  rating: number;
  online: boolean;
}

const teamMembers: TeamMember[] = [
  { id: 't-1', name: 'Max Brenner', role: 'Senior Tuning-Engineer', avatar: 'MB', activeOrders: 4, completedThisMonth: 12, avgResponseHours: 1.5, rating: 4.9, online: true },
  { id: 't-2', name: 'Lisa Hartmann', role: 'ECU-Spezialistin', avatar: 'LH', activeOrders: 3, completedThisMonth: 9, avgResponseHours: 2.1, rating: 4.8, online: true },
  { id: 't-3', name: 'Jonas Fiedler', role: 'Dyno-Techniker', avatar: 'JF', activeOrders: 2, completedThisMonth: 7, avgResponseHours: 3.0, rating: 4.7, online: false },
  { id: 't-4', name: 'Sarah Koch', role: 'Qualitätsprüfung', avatar: 'SK', activeOrders: 5, completedThisMonth: 15, avgResponseHours: 1.2, rating: 5.0, online: true },
  { id: 't-5', name: 'Tim Vogt', role: 'Partner-Manager', avatar: 'TV', activeOrders: 1, completedThisMonth: 6, avgResponseHours: 4.0, rating: 4.5, online: false },
  { id: 't-6', name: 'Anna Riedel', role: 'Junior Tuning-Engineer', avatar: 'AR', activeOrders: 2, completedThisMonth: 4, avgResponseHours: 2.8, rating: 4.6, online: true },
];

export default function OperationsTeamPage() {
  const totalActive = teamMembers.reduce((s, m) => s + m.activeOrders, 0);
  const totalCompleted = teamMembers.reduce((s, m) => s + m.completedThisMonth, 0);
  const onlineCount = teamMembers.filter(m => m.online).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold text-foreground mb-1">Team-Übersicht</h1>
        <p className="text-sm text-muted-foreground mb-6">{teamMembers.length} Teammitglieder · {onlineCount} online</p>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <StatMini label="Team-Größe" value={String(teamMembers.length)} />
          <StatMini label="Online" value={String(onlineCount)} />
          <StatMini label="Aktive Aufträge" value={String(totalActive)} />
          <StatMini label="Abgeschlossen (Monat)" value={String(totalCompleted)} />
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-3 gap-4">
          {teamMembers.map((member, i) => (
            <motion.div key={member.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <DataCard className="hover:border-muted-foreground/30 transition-colors">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="h-11 w-11 rounded-full bg-secondary flex items-center justify-center">
                      <span className="text-sm font-bold text-foreground">{member.avatar}</span>
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${
                      member.online ? 'bg-[hsl(var(--success))]' : 'bg-muted-foreground/40'
                    }`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                      <div className="flex items-center gap-0.5 text-[hsl(var(--warning))]">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="text-xs font-bold">{member.rating}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Aktiv</p>
                          <p className="text-sm font-bold font-mono-data text-foreground">{member.activeOrders}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Monat</p>
                          <p className="text-sm font-bold font-mono-data text-foreground">{member.completedThisMonth}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Ø Antwort</p>
                          <p className="text-sm font-bold font-mono-data text-foreground">{member.avgResponseHours}h</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </DataCard>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function StatMini({ label, value }: { label: string; value: string }) {
  return (
    <DataCard>
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold font-mono-data text-foreground">{value}</p>
    </DataCard>
  );
}
