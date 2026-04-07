import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Package, Clock, CheckCircle2, Truck, XCircle, ChefHat } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface OrderItem {
  id: string;
  product_name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total: number;
  subtotal: number;
  delivery_cost: number;
  service_fee: number;
  payment_method: string;
  address_street: string;
  address_building: string;
  address_city: string;
  order_items: OrderItem[];
}

const statusConfig: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  pending: { label: 'Oczekuje', icon: Clock, color: 'text-warning' },
  confirmed: { label: 'Potwierdzone', icon: Package, color: 'text-blue-500' },
  preparing: { label: 'Przygotowywane', icon: ChefHat, color: 'text-orange-500' },
  in_transit: { label: 'W drodze', icon: Truck, color: 'text-primary' },
  delivered: { label: 'Dostarczone', icon: CheckCircle2, color: 'text-success' },
  cancelled: { label: 'Anulowane', icon: XCircle, color: 'text-destructive' },
};

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
      } else {
        setOrders((data as unknown as Order[]) || []);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <main className="container flex flex-col items-center justify-center py-20 text-center">
          <span className="mb-4 text-6xl">🔒</span>
          <h2 className="mb-2 font-display text-lg font-bold">Zaloguj się</h2>
          <p className="mb-4 text-muted-foreground">Aby zobaczyć swoje zamówienia</p>
          <Link to="/auth">
            <Button>Zaloguj się</Button>
          </Link>
        </main>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      <main className="container py-4">
        <h1 className="mb-4 font-display text-xl font-bold">Zamówienia</h1>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="mb-4 text-6xl">📦</span>
            <h2 className="mb-2 font-display text-lg font-bold">Brak zamówień</h2>
            <p className="mb-4 text-muted-foreground">Twoje zamówienia pojawią się tutaj</p>
            <Link to="/">
              <Button variant="outline">Przejdź do sklepu</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              const itemCount = order.order_items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

              return (
                <div
                  key={order.id}
                  className="rounded-xl border border-border bg-card p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-muted-foreground">
                      {order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <div className={`flex items-center gap-1.5 ${status.color}`}>
                      <StatusIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">{status.label}</span>
                    </div>
                  </div>

                  {/* Items preview */}
                  <div className="space-y-1">
                    {order.order_items?.slice(0, 3).map((item) => (
                      <p key={item.id} className="text-sm text-muted-foreground">
                        {item.quantity}x {item.product_name}
                      </p>
                    ))}
                    {(order.order_items?.length || 0) > 3 && (
                      <p className="text-xs text-muted-foreground">
                        i {order.order_items.length - 3} więcej...
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {itemCount} {itemCount === 1 ? 'produkt' : itemCount < 5 ? 'produkty' : 'produktów'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('pl-PL', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span className="text-lg font-bold text-primary">
                      {Number(order.total).toFixed(2)} zł
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  );
}
