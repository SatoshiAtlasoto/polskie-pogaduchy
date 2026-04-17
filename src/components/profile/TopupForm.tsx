import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard } from 'lucide-react';

interface TopupFormProps {
  onSubmit: (amount: number) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const PRESET_AMOUNTS = [50, 100, 200, 500];

export function TopupForm({ onSubmit, onCancel, loading }: TopupFormProps) {
  const [amount, setAmount] = useState<string>('100');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0) {
      setError('Podaj prawidłową kwotę');
      return;
    }
    if (parsed > 10000) {
      setError('Maksymalna kwota to 10 000 zł');
      return;
    }
    await onSubmit(parsed);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg bg-warning/10 p-3 text-xs text-muted-foreground">
        ℹ️ To jest mock płatności. W trybie produkcyjnym zostanie podpięta integracja Stripe.
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Kwota doładowania (zł)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="1"
          max="10000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="100.00"
          required
        />
      </div>

      <div className="grid grid-cols-4 gap-2">
        {PRESET_AMOUNTS.map((preset) => (
          <Button
            key={preset}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAmount(String(preset))}
          >
            {preset} zł
          </Button>
        ))}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel} disabled={loading}>
          Anuluj
        </Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          <CreditCard className="mr-2 h-4 w-4" />
          {loading ? 'Przetwarzanie...' : 'Doładuj'}
        </Button>
      </div>
    </form>
  );
}
