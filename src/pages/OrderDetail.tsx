import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Package, MapPin, CreditCard, ArrowLeft, Calendar, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { OrderProgressTracker } from '@/components/orders/OrderProgressTracker';

interface OrderData {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;
  address_street: string;
  address_building: string;
  address_apartment: string | null;
  address_floor: number | null;
  address_city: string;
  address_postal_code: string;
  address_notes: string | null;
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
  card: 'Karta płatnicza',
  blik: 'BLIK',
  transfer: 'Przelew bankowy',
};

const statusLabels: Record<string, string> = {
  pending: 'Oczekuje na potwierdzenie',
  confirmed: 'Potwierdzone',
  preparing: 'W trakcie przygotowania',
  in_transit: 'W drodze',
  delivered: 'Dostarczone',
  cancelled: 'Anulowane',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!order) return;
    setCancelling(true);
    const { data, error } = await supabase.rpc('cancel_order', { _order_id: order.id });
    setCancelling(false);
    if (error || !data) {
      toast.error('Nie udało się anulować zamówienia');
    } else {
      toast.success('Zamówienie zostało anulowane');
      setOrder((prev) => prev ? { ...prev, status: 'cancelled', updated_at: new Date().toISOString() } : prev);
    }
  };

  useEffect(() => {
    if (!user || !id) {
      navigate('/auth');
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

    const channel = supabase
      .channel(`order-detail-${id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${id}` },
        (payload) => {
          const updated = payload.new as OrderData;
          setOrder((prev) => (prev ? { ...prev, ...updated } : prev));
          toast.info(`Status: ${statusLabels[updated.status] || updated.status}`);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-24 w-full rounded-xl" />
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
          <Link to="/orders"><Button>Wróć do zamówień</Button></Link>
        </div>
      </div>
    );
  }

  const shortId = order.id.slice(0, 8).toUpperCase();
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="container flex items-center gap-4 py-3">
          <Link to="/orders">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <div>
            <h1 className="font-display text-lg font-bold">Zamówienie #{shortId}</h1>
            <p className="text-xs text-muted-foreground">{statusLabels[order.status] || order.status}</p>
          </div>
        </div>
      </header>

      <main className="container space-y-4 py-4">
        {/* Progress tracker */}
        <section className="rounded-xl border border-border bg-card p-4">
          <OrderProgressTracker status={order.status} />
        </section>

        {/* Cancel button */}
        {order.status === 'pending' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full" disabled={cancelling}>
                <XCircle className="h-4 w-4 mr-2" />
                {cancelling ? 'Anulowanie...' : 'Anuluj zamówienie'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Anulować zamówienie?</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-2">
                    <p>Tej operacji nie można cofnąć. Zamówienie #{shortId} zostanie trwale anulowane.</p>
                    <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm">
                      <p className="font-semibold text-destructive">Opłata za anulację</p>
                      <p className="text-muted-foreground mt-1">
                        Z Twojego depozytu zostanie potrącona kwota <span className="font-bold text-foreground">{Number(order.delivery_cost).toFixed(2)} zł</span> na pokrycie kosztów transportu.
                      </p>
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Nie, zostaw</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Tak, anuluj ({Number(order.delivery_cost).toFixed(2)} zł)
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        <section className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Złożone:</span>
            <span className="font-medium">{formatDate(order.created_at)}</span>
          </div>
          {order.updated_at !== order.created_at && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Ostatnia aktualizacja:</span>
              <span className="font-medium">{formatDate(order.updated_at)}</span>
            </div>
          )}
        </section>

        {/* Items */}
        <section className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 flex items-center gap-2 font-display font-semibold">
            <Package className="h-5 w-5 text-primary" />
            Produkty ({itemCount})
          </h3>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                {item.product_image ? (
                  <img src={item.product_image} alt={item.product_name} className="h-14 w-14 rounded-lg object-cover border border-border" />
                ) : (
                  <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.product_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity} × {Number(item.price).toFixed(2)} zł · {Number(item.weight).toFixed(1)} kg
                  </p>
                </div>
                <p className="text-sm font-semibold whitespace-nowrap">
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
          <div className="text-sm space-y-1">
            <p>
              {order.address_street} {order.address_building}
              {order.address_apartment ? `/${order.address_apartment}` : ''}
            </p>
            <p>{order.address_postal_code} {order.address_city}</p>
            {order.address_floor != null && order.address_floor > 0 && (
              <p className="text-muted-foreground">Piętro: {order.address_floor}</p>
            )}
            {order.address_notes && (
              <p className="text-muted-foreground italic">Uwagi: {order.address_notes}</p>
            )}
          </div>
        </section>

        {/* Payment summary */}
        <section className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-2 flex items-center gap-2 font-display font-semibold">
            <CreditCard className="h-5 w-5 text-primary" />
            Podsumowanie płatności
          </h3>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Metoda płatności</span>
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
      </main>
    </div>
  );
}
