import { SectionHeader, DataCard, StatCard, StatusBadge } from '@/components/DataComponents';
import { mockDealers } from '@/lib/mock-data';
import { motion } from 'framer-motion';
import { Building2, CheckCircle, Star } from 'lucide-react';

export default function PartnersPage() {
  return (
    <div className="p-6">
      <SectionHeader title="Partner" sub="Zertifizierte Partnerwerkstätten und Protokoll-Equipment" />
      <div className="grid grid-cols-3 gap-3">
        {mockDealers.map((dealer, i) => (
          <motion.div key={dealer.id} initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
            <DataCard className="glass">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{dealer.name}</h3>
                    {dealer.verified && <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{dealer.city}, {dealer.region}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-amber-400">
                  <Star className="h-3 w-3 fill-current" />
                  {dealer.rating}
                </div>
              </div>
              <div className="flex gap-4 mb-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Aktiv</span>
                  <p className="text-xl font-bold font-mono-data text-foreground">{dealer.active_requests}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Abgeschlossen</span>
                  <p className="text-xl font-bold font-mono-data text-foreground">{dealer.completed_jobs}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {dealer.protocol_equipment.map(eq => (
                  <span key={eq} className="px-2 py-0.5 text-xs rounded-sm bg-secondary text-secondary-foreground">{eq}</span>
                ))}
              </div>
            </DataCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
