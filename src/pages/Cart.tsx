import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, Truck, ArrowUpFromLine, ArrowRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal, totalWeight } = useCart();
  const [floors, setFloors] = useState(0);
  const [withCarrying, setWithCarrying] = useState(false);

  // Pricing calculations
  const deliveryBase = 19.99;
  const deliveryPerKg = 0.5;
  const carryingPerFloorPerKg = 0.15;

  const deliveryCost = deliveryBase + totalWeight * deliveryPerKg;
  const carryingCost = withCarrying ? floors * totalWeight * carryingPerFloorPerKg : 0;
  const serviceFee = subtotal * 0.05; // 5% service fee
  const total = subtotal + deliveryCost + carryingCost + serviceFee;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <main className="container flex flex-col items-center justify-center py-20 text-center">
          <span className="mb-4 text-6xl">🛒</span>
          <h1 className="mb-2 font-display text-xl font-bold">Koszyk jest pusty</h1>
          <p className="mb-6 text-muted-foreground">
            Dodaj materiały budowlane do zamówienia
          </p>
          <Link to="/">
            <Button className="gap-2">
              Przeglądaj produkty
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </main>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-44">
      <Header />

      <main className="container py-4">
        <h1 className="mb-4 font-display text-xl font-bold">Koszyk</h1>

        {/* Cart Items */}
        <div className="mb-6 space-y-3">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="flex gap-3 rounded-xl border border-border bg-card p-3"
            >
              <img
                src={product.image}
                alt={product.name}
                className="h-20 w-20 rounded-lg bg-secondary object-cover"
              />
              <div className="flex flex-1 flex-col">
                <span className="text-xs text-muted-foreground">
                  {product.storeName}
                </span>
                <h3 className="mb-1 line-clamp-2 text-sm font-medium">
                  {product.name}
                </h3>
                <span className="text-sm font-bold text-primary">
                  {(product.price * quantity).toFixed(2)} zł
                </span>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(product.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Delivery Options */}
        <section className="mb-6">
          <h2 className="mb-3 font-display text-lg font-semibold">Dostawa</h2>
          
          {/* Standard delivery */}
          <div className="mb-3 flex items-center justify-between rounded-xl border border-primary bg-primary/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Dostawa standardowa</p>
                <p className="text-xs text-muted-foreground">
                  ok. 35-50 min • {totalWeight.toFixed(1)} kg
                </p>
              </div>
            </div>
            <span className="font-bold">{deliveryCost.toFixed(2)} zł</span>
          </div>

          {/* Carrying option */}
          <div
            className={cn(
              'rounded-xl border p-4 transition-all',
              withCarrying ? 'border-primary bg-primary/5' : 'border-border'
            )}
          >
            <button
              onClick={() => setWithCarrying(!withCarrying)}
              className="flex w-full items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full',
                    withCarrying ? 'bg-primary/10' : 'bg-secondary'
                  )}
                >
                  <ArrowUpFromLine
                    className={cn(
                      'h-5 w-5',
                      withCarrying ? 'text-primary' : 'text-muted-foreground'
                    )}
                  />
                </div>
                <div className="text-left">
                  <p className="font-medium">Wnoszenie na piętro</p>
                  <p className="text-xs text-muted-foreground">
                    {carryingPerFloorPerKg.toFixed(2)} zł/kg/piętro
                  </p>
                </div>
              </div>
              <div
                className={cn(
                  'h-5 w-5 rounded-full border-2 transition-all',
                  withCarrying
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground'
                )}
              >
                {withCarrying && (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                  </div>
                )}
              </div>
            </button>

            {withCarrying && (
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="text-sm text-muted-foreground">
                  Liczba pięter:
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setFloors(Math.max(0, floors - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-bold">{floors}</span>
                  <button
                    onClick={() => setFloors(floors + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Summary */}
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 font-display text-lg font-semibold">Podsumowanie</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Produkty</span>
              <span>{subtotal.toFixed(2)} zł</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dostawa</span>
              <span>{deliveryCost.toFixed(2)} zł</span>
            </div>
            {withCarrying && floors > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Wnoszenie ({floors} pięter)
                </span>
                <span>{carryingCost.toFixed(2)} zł</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Opłata serwisowa</span>
              <span>{serviceFee.toFixed(2)} zł</span>
            </div>
            <div className="border-t border-border pt-2">
              <div className="flex justify-between text-base font-bold">
                <span>Razem</span>
                <span className="text-primary">{total.toFixed(2)} zł</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Fixed checkout button */}
      <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-border bg-card/95 p-4 backdrop-blur-lg safe-bottom">
        <Link to="/checkout">
          <Button className="w-full gap-2 py-6 text-base font-semibold">
            Przejdź do płatności
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      <MobileNav />
    </div>
  );
}
