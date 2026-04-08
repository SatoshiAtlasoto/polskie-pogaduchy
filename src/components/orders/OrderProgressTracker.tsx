import { Clock, Package, ChefHat, Truck, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  { key: 'pending', label: 'Oczekuje', icon: Clock },
  { key: 'confirmed', label: 'Potwierdzone', icon: Package },
  { key: 'preparing', label: 'Przygotowywane', icon: ChefHat },
  { key: 'in_transit', label: 'W drodze', icon: Truck },
  { key: 'delivered', label: 'Dostarczone', icon: CheckCircle2 },
] as const;

interface OrderProgressTrackerProps {
  status: string;
}

export function OrderProgressTracker({ status }: OrderProgressTrackerProps) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
        <XCircle className="h-5 w-5 text-destructive" />
        <span className="text-sm font-medium text-destructive">Zamówienie anulowane</span>
      </div>
    );
  }

  const currentIndex = steps.findIndex((s) => s.key === status);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;
          const isUpcoming = i > currentIndex;

          return (
            <div key={step.key} className="flex flex-1 items-center">
              {/* Step circle */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors',
                    isCompleted && 'border-primary bg-primary text-primary-foreground',
                    isCurrent && 'border-primary bg-primary/10 text-primary',
                    isUpcoming && 'border-muted-foreground/30 bg-muted text-muted-foreground/50'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span
                  className={cn(
                    'text-[10px] font-medium text-center leading-tight max-w-[60px]',
                    isCompleted && 'text-primary',
                    isCurrent && 'text-primary font-semibold',
                    isUpcoming && 'text-muted-foreground/50'
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 flex-1 mx-1 mt-[-18px] rounded-full transition-colors',
                    i < currentIndex ? 'bg-primary' : 'bg-muted-foreground/20'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
