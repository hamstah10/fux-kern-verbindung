import { motion } from 'framer-motion';
import { Clock, ArrowRight, Edit2, FileText, User, Settings } from 'lucide-react';
import { DataCard } from '@/components/DataComponents';

export interface ActivityEntry {
  id: string;
  timestamp: Date;
  type: 'status_change' | 'note_edit' | 'field_edit' | 'creation';
  label: string;
  detail?: string;
  oldValue?: string;
  newValue?: string;
}

const iconMap: Record<ActivityEntry['type'], React.ReactNode> = {
  status_change: <Settings className="h-3.5 w-3.5" />,
  note_edit: <FileText className="h-3.5 w-3.5" />,
  field_edit: <Edit2 className="h-3.5 w-3.5" />,
  creation: <User className="h-3.5 w-3.5" />,
};

function formatTimestamp(date: Date): string {
  return date.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface ActivityTimelineProps {
  activities: ActivityEntry[];
}

export default function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return null;
  }

  return (
    <DataCard className="mb-6">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          Aktivitäts-Verlauf ({activities.length})
        </span>
      </h3>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

        <div className="space-y-0">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: index * 0.05 }}
              className="relative flex gap-3 pb-4 last:pb-0"
            >
              {/* Dot */}
              <div className={`relative z-10 mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                activity.type === 'creation'
                  ? 'bg-destructive text-destructive-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}>
                <div className="h-1.5 w-1.5 rounded-full bg-current" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-px">{iconMap[activity.type]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{activity.label}</p>
                    {activity.oldValue && activity.newValue && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-muted-foreground line-through">{activity.oldValue}</span>
                        <ArrowRight className="h-2.5 w-2.5 text-muted-foreground" />
                        <span className="text-xs font-medium text-foreground">{activity.newValue}</span>
                      </div>
                    )}
                    {activity.detail && !activity.oldValue && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{activity.detail}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">{formatTimestamp(activity.timestamp)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DataCard>
  );
}

// Helper hook to manage activity entries
export function useActivityLog(initialCreatedAt?: string, entityLabel?: string) {
  const initial: ActivityEntry[] = [];
  if (initialCreatedAt && entityLabel) {
    initial.push({
      id: 'creation',
      timestamp: new Date(initialCreatedAt),
      type: 'creation',
      label: `${entityLabel} erstellt`,
    });
  }
  return initial;
}
