import { ArrowDownCircle, ArrowUpCircle, RotateCcw, Wrench, Receipt } from 'lucide-react';
import { useDepositTransactions, DepositTransactionType } from '@/hooks/useDepositTransactions';
import { Skeleton } from '@/components/ui/skeleton';

const typeConfig: Record<DepositTransactionType, { icon: typeof ArrowUpCircle; label: string; sign: '+' | '-'; color: string }> = {
  topup: { icon: ArrowUpCircle, label: 'Doładowanie', sign: '+', color: 'text-green-500' },
  deduction: { icon: ArrowDownCircle, label: 'Potrącenie', sign: '-', color: 'text-destructive' },
  refund: { icon: RotateCcw, label: 'Zwrot', sign: '+', color: 'text-green-500' },
  adjustment: { icon: Wrench, label: 'Korekta', sign: '+', color: 'text-muted-foreground' },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function DepositHistory() {
  const { transactions, loading } = useDepositTransactions();

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg bg-secondary/30 p-6 text-center">
        <Receipt className="mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Brak operacji na depozycie</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx) => {
        const cfg = typeConfig[tx.type];
        const Icon = cfg.icon;
        return (
          <div
            key={tx.id}
            className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3"
          >
            <Icon className={`h-5 w-5 shrink-0 ${cfg.color}`} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{cfg.label}</p>
              <p className="truncate text-xs text-muted-foreground">{tx.description}</p>
              <p className="text-xs text-muted-foreground">{formatDate(tx.created_at)}</p>
            </div>
            <div className="text-right">
              <p className={`font-display font-semibold ${cfg.color}`}>
                {cfg.sign}
                {Number(tx.amount).toFixed(2)} zł
              </p>
              <p className="text-xs text-muted-foreground">
                Saldo: {Number(tx.balance_after).toFixed(2)} zł
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
