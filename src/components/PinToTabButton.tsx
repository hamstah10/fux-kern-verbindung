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
  const { addTab } = useOperationsTabs();
  const navigate = useNavigate();

  const handlePin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addTab({ type, label, path });
    navigate(path);
    toast.success(`Tab "${label}" angeheftet`);
  };

  return (
    <button
      onClick={handlePin}
      title="Als Tab anheften"
      className={`p-1.5 rounded-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors ${className}`}
    >
      <PinIcon className="h-3.5 w-3.5" />
    </button>
  );
}
