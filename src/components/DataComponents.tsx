import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

const cardVariants = {
  initial: { opacity: 0, y: 10, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
};

const cardTransition = { duration: 0.4, ease: [0.16, 1, 0.3, 1] };

export function DataCard({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      transition={{ ...cardTransition, delay }}
      className={cn("rounded-md border border-border bg-card p-4", className)}
    >
      {children}
    </motion.div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  delay = 0,
}: {
  label: string;
  value: string | number;
  sub?: string;
  delay?: number;
}) {
  return (
    <DataCard delay={delay}>
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-bold font-mono-data tracking-tight text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </DataCard>
  );
}

export function StatusBadge({
  status,
  label,
}: {
  status: 'success' | 'processing' | 'error' | 'warning' | 'new';
  label: string;
}) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-medium",
      `status-${status}`
    )}>
      {status === 'processing' && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {label}
    </span>
  );
}

export function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-xl font-bold text-foreground tracking-tight">{title}</h1>
      {sub && <p className="text-sm text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

export function EmptyState({ message, icon }: { message: string; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      {icon && <div className="mb-3 opacity-30">{icon}</div>}
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function ErrorState({ message, code }: { message: string; code?: string }) {
  return (
    <div className="rounded-md border border-red-500/20 bg-red-500/5 p-4">
      {code && <p className="font-mono-data text-xs text-red-400 mb-1">{code}</p>}
      <p className="text-sm text-red-300">{message}</p>
    </div>
  );
}

export function LoadingBar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[2px]">
      <motion.div
        className="h-full bg-primary"
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      />
    </div>
  );
}
