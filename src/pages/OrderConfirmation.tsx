import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, MapPin, CreditCard, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface OrderData {
  id: string;
  status: string;
  created_at: string;
  address_street: string;
  address_building: string;
  address_apartment: string | null;
  address_city: string;
  address_postal_code: string;
  payment_method: string;
  subtotal: number;
  delivery_cost: number;
  service_fee: number;
  total: number;
}

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  price: number;
  quantity: number;
  weight: number;
}

const paymentLabels: Record<string, string> = {
  card: 'Karta',
  blik: 'BLIK',
  transfer: 'Przelew',
};

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) {
      navigate('/');
      return;
    }

    const fetchOrder = async () => {
      const [{ data: orderData }, { data: itemsData }] = await Promise.all([
        supabase.from('orders').select('*').eq('id', id).single(),
        supabase.from('order_items').select('*').eq('order_id', id),
      ]);

      if (orderData) setOrder(orderData);
      if (itemsData) setItems(itemsData);
      setLoading(false);
    };

    fetchOrder();

    // Realtime subscription for status updates
    const channel = supabase
      .channel(`order-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          const updated = payload.new as OrderData;
          setOrder((prev) => prev ? { ...prev, ...updated } : prev);
          const statusLabels: Record<string, string> = {
            confirmed: 'Potwierdzone',
            preparing: 'Przygotowywane',
            in_transit: 'W drodze',
            delivered: 'Dostarczone',
            cancelled: 'Anulowane',
          };
          const label = statusLabels[updated.status] || updated.status;
          toast.info(`Status zamówienia: ${label}`);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 space-y-4">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Nie znaleziono zamówienia</p>
          <Link to="/"><Button>Wróć do strony głównej</Button></Link>
        </div>
      </div>
    );
  }

  const shortId = order.id.slice(0, 8).toUpperCase();

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="container flex items-center gap-4 py-3">
          <Link to="/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="font-display text-lg font-bold">Potwierdzenie zamówienia</h1>
        </div>
      </header>

      <main className="container space-y-6 py-6">
        {/* Success banner */}
        <div className="flex flex-col items-center gap-3 rounded-xl border border-success/30 bg-success/5 p-6 text-center">
          <CheckCircle className="h-12 w-12 text-success" />
          <h2 className="font-display text-xl font-bold">Zamówienie złożone!</h2>
          <p className="text-sm text-muted-foreground">
            Nr zamówienia: <span className="font-mono font-semibold text-foreground">{shortId}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Dziękujemy za zakupy. Możesz śledzić status zamówienia w zakładce "Zamówienia".
          </p>
        </div>

        {/* Items */}
        <section className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 flex items-center gap-2 font-display font-semibold">
            <Package className="h-5 w-5 text-primary" />
            Produkty ({items.length})
          </h3>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                {item.product_image && (
                  <img
                    src={item.product_image}
                    alt={item.product_name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.product_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity} × {Number(item.price).toFixed(2)} zł
                  </p>
                </div>
                <p className="text-sm font-semibold">
                  {(Number(item.price) * item.quantity).toFixed(2)} zł
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Address */}
        <section className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-2 flex items-center gap-2 font-display font-semibold">
            <MapPin className="h-5 w-5 text-primary" />
            Adres dostawy
          </h3>
          <p className="text-sm text-muted-foreground">
            {order.address_street} {order.address_building}
            {order.address_apartment ? `/${order.address_apartment}` : ''}, {order.address_postal_code} {order.address_city}
          </p>
        </section>

        {/* Summary */}
        <section className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-2 flex items-center gap-2 font-display font-semibold">
            <CreditCard className="h-5 w-5 text-primary" />
            Podsumowanie
          </h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Płatność</span>
              <span>{paymentLabels[order.payment_method] || order.payment_method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Produkty</span>
              <span>{Number(order.subtotal).toFixed(2)} zł</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dostawa</span>
              <span>{Number(order.delivery_cost).toFixed(2)} zł</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Opłata serwisowa</span>
              <span>{Number(order.service_fee).toFixed(2)} zł</span>
            </div>
            <div className="border-t border-border pt-2 mt-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Razem</span>
                <span className="text-primary">{Number(order.total).toFixed(2)} zł</span>
              </div>
            </div>
          </div>
        </section>

        <div className="flex gap-3">
          <Link to="/orders" className="flex-1">
            <Button variant="outline" className="w-full">Moje zamówienia</Button>
          </Link>
          <Link to="/" className="flex-1">
            <Button className="w-full gap-2">
              <Home className="h-4 w-4" /> Strona główna
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
