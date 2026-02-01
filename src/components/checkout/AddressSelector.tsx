import { useState } from 'react';
import { MapPin, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Address } from '@/hooks/useAddresses';
import { cn } from '@/lib/utils';

interface AddressSelectorProps {
  addresses: Address[];
  selectedAddressId: string | null;
  onSelectAddress: (address: Address | null) => void;
  loading?: boolean;
}

export function AddressSelector({
  addresses,
  selectedAddressId,
  onSelectAddress,
  loading,
}: AddressSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="h-20 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (addresses.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Wybierz zapisany adres:</p>

      {/* Selected address preview */}
      {selectedAddress && !isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex w-full items-center justify-between rounded-xl border border-primary bg-primary/5 p-4 text-left transition-all hover:bg-primary/10"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{selectedAddress.label}</p>
              <p className="text-sm text-muted-foreground">
                {selectedAddress.street} {selectedAddress.building}
                {selectedAddress.apartment && `/${selectedAddress.apartment}`},{' '}
                {selectedAddress.postal_code} {selectedAddress.city}
              </p>
            </div>
          </div>
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </button>
      )}

      {/* Address list */}
      {(isExpanded || !selectedAddress) && (
        <div className="space-y-2">
          {addresses.map((address) => (
            <button
              key={address.id}
              onClick={() => {
                onSelectAddress(address);
                setIsExpanded(false);
              }}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all',
                selectedAddressId === address.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground'
              )}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{address.label}</p>
                  {address.is_default && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Domyślny
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {address.street} {address.building}
                  {address.apartment && `/${address.apartment}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {address.postal_code} {address.city}
                </p>
                {address.floor > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Piętro: {address.floor}
                  </p>
                )}
              </div>
              <div
                className={cn(
                  'h-5 w-5 rounded-full border-2',
                  selectedAddressId === address.id
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground'
                )}
              >
                {selectedAddressId === address.id && (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                  </div>
                )}
              </div>
            </button>
          ))}

          {/* New address option */}
          <button
            onClick={() => {
              onSelectAddress(null);
              setIsExpanded(false);
            }}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all',
              selectedAddressId === null
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground'
            )}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Plus className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Nowy adres</p>
              <p className="text-sm text-muted-foreground">
                Wprowadź ręcznie adres dostawy
              </p>
            </div>
            <div
              className={cn(
                'h-5 w-5 rounded-full border-2',
                selectedAddressId === null
                  ? 'border-primary bg-primary'
                  : 'border-muted-foreground'
              )}
            >
              {selectedAddressId === null && (
                <div className="flex h-full w-full items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                </div>
              )}
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
