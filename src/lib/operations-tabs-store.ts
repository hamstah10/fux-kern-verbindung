import { create } from 'zustand';

export type TabType = 'order' | 'customer' | 'ticket' | 'email';

export interface OperationsTab {
  id: string;
  type: TabType;
  label: string;
  path: string;
  color: string | null;
}

const TAB_COLORS = [
  '#ef4444', // red
  '#f59e0b', // amber
  '#22c55e', // green
  '#3b82f6', // blue
  '#a855f7', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
];

export { TAB_COLORS };

interface OperationsTabsState {
  tabs: OperationsTab[];
  activeTabId: string | null;
  addTab: (tab: Omit<OperationsTab, 'id' | 'color'>) => string;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  setTabColor: (id: string, color: string | null) => void;
  cycleTabColor: (id: string) => void;
}

let counter = 0;

export const useOperationsTabsStore = create<OperationsTabsState>((set, get) => ({
  tabs: [],
  activeTabId: null,

  addTab: (tab) => {
    const existing = get().tabs.find(t => t.path === tab.path);
    if (existing) {
      set({ activeTabId: existing.id });
      return existing.id;
    }
    const id = `tab-${++counter}`;
    const newTab: OperationsTab = { ...tab, id, color: null };
    set(state => ({
      tabs: [...state.tabs, newTab],
      activeTabId: id,
    }));
    return id;
  },

  removeTab: (id) => {
    set(state => {
      const idx = state.tabs.findIndex(t => t.id === id);
      const newTabs = state.tabs.filter(t => t.id !== id);
      let newActive = state.activeTabId;
      if (state.activeTabId === id) {
        if (newTabs.length > 0) {
          const newIdx = Math.min(idx, newTabs.length - 1);
          newActive = newTabs[newIdx].id;
        } else {
          newActive = null;
        }
      }
      return { tabs: newTabs, activeTabId: newActive };
    });
  },

  setActiveTab: (id) => set({ activeTabId: id }),

  setTabColor: (id, color) => {
    set(state => ({
      tabs: state.tabs.map(t => t.id === id ? { ...t, color } : t),
    }));
  },

  cycleTabColor: (id) => {
    set(state => {
      const tab = state.tabs.find(t => t.id === id);
      if (!tab) return state;
      const currentIdx = tab.color ? TAB_COLORS.indexOf(tab.color) : -1;
      const nextIdx = (currentIdx + 1) % (TAB_COLORS.length + 1);
      const nextColor = nextIdx === TAB_COLORS.length ? null : TAB_COLORS[nextIdx];
      return {
        tabs: state.tabs.map(t => t.id === id ? { ...t, color: nextColor } : t),
      };
    });
  },
}));
