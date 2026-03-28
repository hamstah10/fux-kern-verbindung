import { createContext, useContext } from 'react';

export type TabType = 'order' | 'customer' | 'ticket' | 'email';

export interface OperationsTab {
  id: string;
  type: TabType;
  label: string;
  path: string;
  color: string | null;
}

export const TAB_COLORS = [
  '#ef4444',
  '#f59e0b',
  '#22c55e',
  '#3b82f6',
  '#a855f7',
  '#ec4899',
  '#06b6d4',
];

export const TAB_TYPE_LABELS: Record<TabType, string> = {
  order: 'Auftrag',
  customer: 'Kunde',
  ticket: 'Ticket',
  email: 'E-Mail',
};

export interface OperationsTabsContextValue {
  tabs: OperationsTab[];
  activeTabId: string | null;
  addTab: (tab: Omit<OperationsTab, 'id' | 'color'>) => void;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  cycleTabColor: (id: string) => void;
}

export const OperationsTabsContext = createContext<OperationsTabsContextValue | null>(null);

export function useOperationsTabs() {
  const ctx = useContext(OperationsTabsContext);
  if (!ctx) throw new Error('useOperationsTabs must be used within OperationsLayout');
  return ctx;
}
