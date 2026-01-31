import { MapPin, Star, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Address } from '@/hooks/useAddresses';

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export function AddressCard({ address, onEdit, onDelete, onSetDefault }: AddressCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{address.label}</h3>
              {address.is_default && (
                <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  <Star className="h-3 w-3" />
                  Domyślny
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {address.street} {address.building}
              {address.apartment && `/${address.apartment}`}
            </p>
            <p className="text-sm text-muted-foreground">
              {address.postal_code} {address.city}
            </p>
            {address.floor > 0 && (
              <p className="text-sm text-muted-foreground">
                Piętro: {address.floor}
              </p>
            )}
            {address.notes && (
              <p className="mt-1 text-xs text-muted-foreground italic">
                {address.notes}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {!address.is_default && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSetDefault(address.id)}
          >
            <Star className="mr-1 h-4 w-4" />
            Ustaw domyślny
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(address)}
        >
          <Pencil className="mr-1 h-4 w-4" />
          Edytuj
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(address.id)}
        >
          <Trash2 className="mr-1 h-4 w-4" />
          Usuń
        </Button>
      </div>
    </div>
  );
}
