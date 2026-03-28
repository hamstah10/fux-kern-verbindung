import { useOperationsTabs, type TabType } from '@/lib/operations-tabs-store';
import { PinIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface PinToTabButtonProps {
  type: TabType;
  label: string;
  path: string;
  className?: string;
}

export function PinToTabButton({ type, label, path, className = '' }: PinToTabButtonProps) {
  const { tabs, addTab, removeTab } = useOperationsTabs();
  const navigate = useNavigate();

  const existingTab = tabs.find(t => t.path === path);
  const isPinned = Boolean(existingTab);

  const handlePin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isPinned && existingTab) {
      removeTab(existingTab.id);
      toast.info(`Tab "${label}" entfernt`);
    } else {
      addTab({ type, label, path });
      navigate(path);
      toast.success(`Tab "${label}" angeheftet`);
    }
  };

  return (
    <button
      onClick={handlePin}
      title={isPinned ? 'Tab entfernen' : 'Als Tab anheften'}
      className={`p-1.5 rounded-sm transition-colors ${
        isPinned
          ? 'text-destructive hover:text-destructive/80'
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
      } ${className}`}
    >
      <PinIcon className={`h-3.5 w-3.5 ${isPinned ? 'fill-destructive' : ''}`} />
    </button>
  );
}
