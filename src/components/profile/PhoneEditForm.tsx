import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PhoneInput } from '@/components/ui/phone-input';
import { Label } from '@/components/ui/label';
import { formatPhone, isValidPhone, extractPhoneDigits } from '@/lib/validators';

interface PhoneEditFormProps {
  initialPhone: string | null;
  onSubmit: (phone: string | null) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function PhoneEditForm({ initialPhone, onSubmit, onCancel, loading }: PhoneEditFormProps) {
  const [phone, setPhone] = useState(initialPhone ? formatPhone(initialPhone) : '+48 ');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const digits = extractPhoneDigits(phone);
    
    // Allow empty phone (user clearing the field)
    if (digits.length === 0) {
      await onSubmit(null);
      return;
    }
    
    if (!isValidPhone(phone)) {
      setError('Numer telefonu musi mieć 9 cyfr');
      return;
    }
    
    setError(null);
    await onSubmit(digits);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone">Numer telefonu</Label>
        <PhoneInput
          id="phone"
          value={phone}
          onChange={(value) => {
            setPhone(value);
            setError(null);
          }}
          autoFocus
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <p className="text-xs text-muted-foreground">
          Format: +48 XXX XXX XXX
        </p>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Anuluj
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Zapisywanie...' : 'Zapisz'}
        </Button>
      </div>
    </form>
  );
}
