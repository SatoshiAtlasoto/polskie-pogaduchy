import { useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, RotateCcw, Wrench, Receipt, Calendar as CalendarIcon, X } from 'lucide-react';
import { useDepositTransactions, DepositTransactionType, FilterType, DateRange } from '@/hooks/useDepositTransactions';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const typeConfig: Record<DepositTransactionType, { icon: typeof ArrowUpCircle; label: string; sign: '+' | '-'; color: string }> = {
  topup: { icon: ArrowUpCircle, label: 'Doładowanie', sign: '+', color: 'text-green-500' },
  deduction: { icon: ArrowDownCircle, label: 'Potrącenie', sign: '-', color: 'text-destructive' },
  refund: { icon: RotateCcw, label: 'Zwrot', sign: '+', color: 'text-green-500' },
  adjustment: { icon: Wrench, label: 'Korekta', sign: '+', color: 'text-muted-foreground' },
};

const filterTypeConfig: Record<FilterType, string> = {
  all: 'Wszystkie',
  topup: 'Doładowania',
  deduction: 'Potrącenia',
  refund: 'Zwroty',
  adjustment: 'Korekty',
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
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null });
  
  const { transactions, loading, refetch } = useDepositTransactions(filterType, dateRange);

  const hasActiveFilters = filterType !== 'all' || dateRange.from || dateRange.to;

  const clearFilters = () => {
    setFilterType('all');
    setDateRange({ from: null, to: null });
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {/* Type filter */}
        <Select value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
          <SelectTrigger className="w-[140px] h-9 text-sm">
            <SelectValue placeholder="Typ operacji" />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(filterTypeConfig) as FilterType[]).map((type) => (
              <SelectItem key={type} value={type}>
                {filterTypeConfig[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date range filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-9 justify-start text-left font-normal text-sm",
                !dateRange.from && !dateRange.to && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "dd.MM.yyyy", { locale: pl })} -{" "}
                    {format(dateRange.to, "dd.MM.yyyy", { locale: pl })}
                  </>
                ) : (
                  format(dateRange.from, "dd.MM.yyyy", { locale: pl })
                )
              ) : (
                <span>Data</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange.from || new Date()}
              selected={{
                from: dateRange.from || undefined,
                to: dateRange.to || undefined,
              }}
              onSelect={(range) => {
                setDateRange({
                  from: range?.from || null,
                  to: range?.to || null,
                });
              }}
              numberOfMonths={1}
              locale={pl}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-2 text-muted-foreground"
            onClick={clearFilters}
          >
            <X className="h-4 w-4 mr-1" />
            Wyczyść
          </Button>
        )}

        {/* Refresh */}
        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-2 text-muted-foreground ml-auto"
          onClick={refetch}
          disabled={loading}
        >
          Odśwież
        </Button>
      </div>

      {/* Results count */}
      {!loading && transactions.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {transactions.length} {transactions.length === 1 ? 'operacja' : transactions.length < 5 ? 'operacje' : 'operacji'}
          {filterType !== 'all' && ` • ${filterTypeConfig[filterType].toLowerCase()}`}
          {(dateRange.from || dateRange.to) && ` • ${dateRange.from ? format(dateRange.from, 'dd.MM.yyyy', { locale: pl }) : '...'} - ${dateRange.to ? format(dateRange.to, 'dd.MM.yyyy', { locale: pl }) : '...'}`}
        </p>
      )}

      {/* Loading state */}
      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && transactions.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg bg-secondary/30 p-6 text-center">
          <Receipt className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {hasActiveFilters 
              ? 'Brak operacji pasujących do filtrów' 
              : 'Brak operacji na depozycie'}
          </p>
          {hasActiveFilters && (
            <Button variant="link" size="sm" onClick={clearFilters} className="mt-2">
              Wyczyść filtry
            </Button>
          )}
        </div>
      )}

      {/* Transactions list */}
      {!loading && transactions.length > 0 && (
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
      )}
    </div>
  );
}
