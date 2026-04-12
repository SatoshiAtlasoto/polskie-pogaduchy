import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Smartphone,
  Building2,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/contexts/CartContext';
import { useAddresses, Address } from '@/hooks/useAddresses';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AddressSelector } from '@/components/checkout/AddressSelector';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const paymentMethods = [
  { id: 'card', name: 'Karta', icon: CreditCard, description: 'Visa, Mastercard' },
  { id: 'blik', name: 'BLIK', icon: Smartphone, description: 'Szybki przelew' },
  { id: 'transfer', name: 'Przelew', icon: Building2, description: 'Natychmiastowy' },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, totalWeight, clearCart } = useCart();
  const { user } = useAuth();
  const { addresses, loading: addressesLoading } = useAddresses();
  
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  
  // Manual address form state
  const [manualAddress, setManualAddress] = useState({
    street: '',
    building: '',
    apartment: '',
    floor: '',
    postal_code: '',
    city: 'Warszawa',
    notes: '',
  });

  // Set default address when addresses load
  useEffect(() => {
    if (addresses.length > 0 && selectedAddressId === null) {
      const defaultAddr = addresses.find((a) => a.is_default) || addresses[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [addresses, selectedAddressId]);

  const handleSelectAddress = (address: Address | null) => {
    setSelectedAddressId(address?.id || null);
    if (address) {
      // Pre-fill manual form with selected address data
      setManualAddress({
        street: address.street,
        building: address.building,
        apartment: address.apartment || '',
        floor: address.floor.toString(),
        postal_code: address.postal_code,
        city: address.city,
        notes: address.notes || '',
      });
    }
  };

  // Pricing calculations
  const deliveryBase = 19.99;
  const deliveryPerKg = 0.5;
  const deliveryCost = deliveryBase + totalWeight * deliveryPerKg;
  const serviceFee = subtotal * 0.05;
  const total = subtotal + deliveryCost + serviceFee;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOrder = async () => {
    if (!isConfirmed) {
      toast.error('Potwierdź kompletność zamówienia');
      return;
    }

    if (!user) {
      toast.error('Musisz być zalogowany, aby złożyć zamówienie');
      navigate('/auth');
      return;
    }

    // Resolve address
    const selectedAddr = addresses.find((a) => a.id === selectedAddressId);
    const addr = selectedAddr || manualAddress;

    if (!addr.street || !addr.building || !addr.postal_code) {
      toast.error('Wypełnij wymagane pola adresu');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          address_street: addr.street,
          address_building: addr.building,
          address_apartment: selectedAddr?.apartment || manualAddress.apartment || null,
          address_floor: selectedAddr?.floor ?? (parseInt(manualAddress.floor) || 0),
          address_city: selectedAddr?.city || manualAddress.city,
          address_postal_code: selectedAddr?.postal_code || manualAddress.postal_code,
          address_notes: selectedAddr?.notes || manualAddress.notes || null,
          payment_method: selectedPayment,
          subtotal,
          delivery_cost: deliveryCost,
          service_fee: serviceFee,
          total,
        })
        .select('id')
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_image: item.product.image,
        price: item.product.price,
        quantity: item.quantity,
        weight: item.product.weight,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast.success('Zamówienie złożone!', {
        description: 'Dziękujemy za zakupy',
      });

      clearCart();
      navigate(`/order-confirmation/${order.id}`);
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Nie udało się złożyć zamówienia');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items.length, navigate]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Custom header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="container flex items-center gap-4 py-3">
          <Link to="/cart">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="font-display text-lg font-bold">Płatność</h1>
        </div>
      </header>

      <main className="container space-y-6 py-4">
        {/* Delivery Address */}
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-4 flex items-center gap-2 font-display font-semibold">
            <MapPin className="h-5 w-5 text-primary" />
            Adres dostawy
          </h2>

          {/* Address selector for logged-in users */}
          {user && (
            <AddressSelector
              addresses={addresses}
              selectedAddressId={selectedAddressId}
              onSelectAddress={handleSelectAddress}
              loading={addressesLoading}
            />
          )}

          {/* Manual address form - shown when no address selected or user not logged in */}
          {(selectedAddressId === null || !user) && (
            <div className={cn('grid gap-4', user && addresses.length > 0 && 'mt-4')}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="street">Ulica</Label>
                  <Input
                    id="street"
                    placeholder="ul. Marszałkowska"
                    value={manualAddress.street}
                    onChange={(e) =>
                      setManualAddress((prev) => ({ ...prev, street: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="building">Nr budynku</Label>
                  <Input
                    id="building"
                    placeholder="15"
                    value={manualAddress.building}
                    onChange={(e) =>
                      setManualAddress((prev) => ({ ...prev, building: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="apartment">Nr lokalu</Label>
                  <Input
                    id="apartment"
                    placeholder="32"
                    value={manualAddress.apartment}
                    onChange={(e) =>
                      setManualAddress((prev) => ({ ...prev, apartment: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="floor">Piętro</Label>
                  <Input
                    id="floor"
                    type="number"
                    placeholder="3"
                    value={manualAddress.floor}
                    onChange={(e) =>
                      setManualAddress((prev) => ({ ...prev, floor: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postal">Kod pocztowy</Label>
                  <Input
                    id="postal"
                    placeholder="00-001"
                    value={manualAddress.postal_code}
                    onChange={(e) =>
                      setManualAddress((prev) => ({ ...prev, postal_code: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="city">Miasto</Label>
                  <Input id="city" value={manualAddress.city} disabled />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Uwagi dla kuriera</Label>
                <Textarea
                  id="notes"
                  placeholder="Np. kod do bramy, dzwonek..."
                  rows={2}
                  value={manualAddress.notes}
                  onChange={(e) =>
                    setManualAddress((prev) => ({ ...prev, notes: e.target.value }))
                  }
                />
              </div>
            </div>
          )}

          {/* Show selected address notes if any */}
          {selectedAddressId && (
            <>
              {addresses.find((a) => a.id === selectedAddressId)?.notes && (
                <p className="mt-3 text-sm text-muted-foreground italic">
                  Uwagi: {addresses.find((a) => a.id === selectedAddressId)?.notes}
                </p>
              )}
            </>
          )}
        </section>

        {/* Payment Method */}
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-4 flex items-center gap-2 font-display font-semibold">
            <CreditCard className="h-5 w-5 text-primary" />
            Metoda płatności
          </h2>
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedPayment(method.id)}
                className={cn(
                  'flex w-full items-center justify-between rounded-xl border p-4 transition-all',
                  selectedPayment === method.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground'
                )}
              >
                <div className="flex items-center gap-3">
                  <method.icon
                    className={cn(
                      'h-5 w-5',
                      selectedPayment === method.id
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    )}
                  />
                  <div className="text-left">
                    <p className="font-medium">{method.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {method.description}
                    </p>
                  </div>
                </div>
                <div
                  className={cn(
                    'h-5 w-5 rounded-full border-2',
                    selectedPayment === method.id
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground'
                  )}
                >
                  {selectedPayment === method.id && (
                    <div className="flex h-full w-full items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Order Summary */}
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 font-display font-semibold">Podsumowanie</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Produkty ({items.length})
              </span>
              <span>{subtotal.toFixed(2)} zł</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dostawa</span>
              <span>{deliveryCost.toFixed(2)} zł</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Opłata serwisowa</span>
              <span>{serviceFee.toFixed(2)} zł</span>
            </div>
            <div className="border-t border-border pt-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Razem</span>
                <span className="text-primary">{total.toFixed(2)} zł</span>
              </div>
            </div>
          </div>
        </section>

        {/* Confirmation Checkbox */}
        <button
          onClick={() => setIsConfirmed(!isConfirmed)}
          className={cn(
            'flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all',
            isConfirmed ? 'border-success bg-success/5' : 'border-border'
          )}
        >
          <div
            className={cn(
              'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2',
              isConfirmed
                ? 'border-success bg-success'
                : 'border-muted-foreground'
            )}
          >
            {isConfirmed && (
              <CheckCircle className="h-3 w-3 text-success-foreground" />
            )}
          </div>
          <p className="text-sm">
            <span className="font-medium">
              Potwierdzam, że zamówienie jest kompletne i poprawne.
            </span>{' '}
            <span className="text-muted-foreground">
              Po dostarczeniu i potwierdzeniu odbioru, nie będę zgłaszać
              reklamacji dotyczących brakujących produktów.
            </span>
          </p>
        </button>
      </main>

      {/* Fixed order button */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 p-4 backdrop-blur-lg safe-bottom">
        <Button
          onClick={handleOrder}
          disabled={!isConfirmed || isSubmitting}
          className="w-full gap-2 py-6 text-base font-semibold"
        >
          Zamów i zapłać {total.toFixed(2)} zł
        </Button>
      </div>
    </div>
  );
}
