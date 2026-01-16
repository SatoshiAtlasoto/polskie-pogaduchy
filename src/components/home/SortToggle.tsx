import { Zap, Coins } from 'lucide-react';
import { SortMode } from '@/types';
import { cn } from '@/lib/utils';

interface SortToggleProps {
  value: SortMode;
  onChange: (mode: SortMode) => void;
}

export function SortToggle({ value, onChange }: SortToggleProps) {
  return (
    <div className="flex gap-2 rounded-xl bg-secondary p-1">
      <button
        onClick={() => onChange('fastest')}
        className={cn(
          'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
          value === 'fastest'
            ? 'bg-gradient-primary text-primary-foreground shadow-md'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Zap className="h-4 w-4" />
        Najszybciej
      </button>
      <button
        onClick={() => onChange('cheapest')}
        className={cn(
          'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
          value === 'cheapest'
            ? 'bg-gradient-primary text-primary-foreground shadow-md'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Coins className="h-4 w-4" />
        Najtaniej
      </button>
    </div>
  );
}
