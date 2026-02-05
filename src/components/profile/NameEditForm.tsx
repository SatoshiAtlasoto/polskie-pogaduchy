import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface NameEditFormProps {
  initialName: string | null;
  onSubmit: (fullName: string) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function NameEditForm({ initialName, onSubmit, onCancel, loading }: NameEditFormProps) {
  const [fullName, setFullName] = useState(initialName || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(fullName.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="full_name">Imię i nazwisko</Label>
        <Input
          id="full_name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Jan Kowalski"
          autoFocus
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Anuluj
        </Button>
        <Button type="submit" disabled={loading || !fullName.trim()}>
          {loading ? 'Zapisywanie...' : 'Zapisz'}
        </Button>
      </div>
    </form>
  );
}
