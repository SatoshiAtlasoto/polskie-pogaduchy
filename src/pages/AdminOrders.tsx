import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminNav } from '@/components/admin/AdminNav';
import {
  Shield, Clock, CheckCircle, XCircle, Package, Truck, ChefHat,
  CheckCircle2, MapPin, CreditCard, Download, Search,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Constants } from '@/integrations/supabase/types';
import { DateRangeFilter } from '@/components/admin/DateRangeFilter';

type OrderStatus = typeof Constants.public.Enums.order_status[number];

interface OrderItem {
  id: string;
  product_name: string;
  price: number;
  quantity: number;
  weight: number;
}

interface AdminOrder {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  status: OrderStatus;
  total: number;
  subtotal: number;
  delivery_cost: number;
  service_fee: number;
  payment_method: string;
  address_street: string;
  address_building: string;
  address_apartment: string | null;
  address_city: string;
  address_postal_code: string;
  address_floor: number | null;
  address_notes: string | null;
  order_items: OrderItem[];
  user_email?: string;
  user_name?: string;
}

const statusConfig: Record<OrderStatus, { label: string; icon: typeof Clock; color: string }> = {
  pending: { label: 'Oczekuje', icon: Clock, color: 'text-yellow-500' },
  confirmed: { label: 'Potwierdzone', icon: Package, color: 'text-blue-500' },
  preparing: { label: 'Przygotowywane', icon: ChefHat, color: 'text-orange-500' },
  in_transit: { label: 'W drodze', icon: Truck, color: 'text-primary' },
  delivered: { label: 'Dostarczone', icon: CheckCircle2, color: 'text-green-500' },
  cancelled: { label: 'Anulowane', icon: XCircle, color: 'text-destructive' },
};

const statusFlow: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'in_transit', 'delivered'];

export default function AdminOrders() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminRole();
  const { toast } = useToast();

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (!authLoading && !adminLoading && !isAdmin) {
      navigate('/');
      toast({ title: 'Brak dostępu', description: 'Nie masz uprawnień do tej strony.', variant: 'destructive' });
    }
  }, [user, authLoading, isAdmin, adminLoading, navigate, toast]);

  useEffect(() => {
    if (isAdmin) fetchOrders();
  }, [isAdmin]);

  const fetchOrders = async () => {
    setLoading(true);

    const { data: ordersData, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      toast({ title: 'Błąd', description: 'Nie udało się pobrać zamówień.', variant: 'destructive' });
      setLoading(false);
      return;
    }

    const userIds = [...new Set(ordersData?.map(o => o.user_id) || [])];

    let profilesMap = new Map<string, { email: string; name: string | null }>();
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, email, full_name')
        .in('user_id', userIds);

      profilesMap = new Map(
        profilesData?.map(p => [p.user_id, { email: p.email, name: p.full_name }]) || []
      );
    }

    const enriched: AdminOrder[] = (ordersData || []).map(order => ({
      ...order,
      order_items: order.order_items || [],
      user_email: profilesMap.get(order.user_id)?.email,
      user_name: profilesMap.get(order.user_id)?.name,
    })) as AdminOrder[];

    setOrders(enriched);
    setLoading(false);
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      toast({ title: 'Błąd', description: 'Nie udało się zmienić statusu.', variant: 'destructive' });
    } else {
      toast({ title: 'Zaktualizowano', description: `Status zmieniony na: ${statusConfig[newStatus].label}` });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    }

    setUpdatingId(null);
  };

  const filteredOrders = orders.filter(o => {
    const matchesTab = activeTab === 'all' ? true : o.status === activeTab;
    if (!matchesTab) return false;
    const orderDate = new Date(o.created_at);
    if (dateFrom && orderDate < dateFrom) return false;
    if (dateTo) {
      const endOfDay = new Date(dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      if (orderDate > endOfDay) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchesName = o.user_name?.toLowerCase().includes(q);
      const matchesEmail = o.user_email?.toLowerCase().includes(q);
      const matchesId = o.id.toLowerCase().includes(q.replace('#', ''));
      if (!matchesName && !matchesEmail && !matchesId) return false;
    }
    return true;
  });

  const exportToCSV = () => {
    const rows = filteredOrders.flatMap(order =>
      order.order_items.map(item => ({
        'ID zamówienia': order.id.slice(0, 8).toUpperCase(),
        'Data': new Date(order.created_at).toLocaleDateString('pl-PL'),
        'Klient': order.user_name || '',
        'Email': order.user_email || '',
        'Status': statusConfig[order.status].label,
        'Produkt': item.product_name,
        'Ilość': item.quantity,
        'Cena jednostkowa': Number(item.price).toFixed(2),
        'Wartość pozycji': (Number(item.price) * item.quantity).toFixed(2),
        'Suma zamówienia': Number(order.total).toFixed(2),
        'Dostawa': Number(order.delivery_cost).toFixed(2),
        'Opłata serwisowa': Number(order.service_fee).toFixed(2),
        'Metoda płatności': order.payment_method === 'card' ? 'Karta' : order.payment_method === 'cash' ? 'Gotówka' : order.payment_method,
        'Adres': `${order.address_street} ${order.address_building}${order.address_apartment ? '/' + order.address_apartment : ''}, ${order.address_postal_code} ${order.address_city}`,
      }))
    );
    if (rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(';'),
      ...rows.map(row => headers.map(h => `"${String(row[h as keyof typeof row]).replace(/"/g, '""')}"`).join(';'))
    ].join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zamowienia_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Eksport gotowy', description: `Wyeksportowano ${rows.length} wierszy.` });
  };

  const counts = {
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    in_transit: orders.filter(o => o.status === 'in_transit').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    all: orders.length,
  };

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      <main className="container mx-auto px-4 py-6">
        <AdminNav />
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Zarządzanie zamówieniami</h1>
              <p className="text-muted-foreground">Przeglądaj i zmieniaj statusy zamówień</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={exportToCSV} disabled={filteredOrders.length === 0}>
            <Download className="h-4 w-4 mr-1" />
            Eksport CSV
          </Button>
        </div>

        {/* Search & Date range filter */}
        <div className="mb-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Szukaj po kliencie lub nr zamówienia..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <DateRangeFilter
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            onClear={() => { setDateFrom(undefined); setDateTo(undefined); }}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
          {(Object.entries(statusConfig) as [OrderStatus, typeof statusConfig[OrderStatus]][]).map(([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <Card key={key} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setActiveTab(key)}>
                <CardContent className="p-3 flex flex-col items-center gap-1">
                  <Icon className={`h-5 w-5 ${cfg.color}`} />
                  <p className="text-xl font-bold">{counts[key]}</p>
                  <p className="text-[10px] text-muted-foreground text-center">{cfg.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 flex-wrap h-auto gap-1">
            <TabsTrigger value="pending">Oczekujące ({counts.pending})</TabsTrigger>
            <TabsTrigger value="confirmed">Potwierdzone</TabsTrigger>
            <TabsTrigger value="preparing">Przygotowywane</TabsTrigger>
            <TabsTrigger value="in_transit">W drodze</TabsTrigger>
            <TabsTrigger value="delivered">Dostarczone</TabsTrigger>
            <TabsTrigger value="cancelled">Anulowane</TabsTrigger>
            <TabsTrigger value="all">Wszystkie ({counts.all})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-48 w-full rounded-xl" />
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">Brak zamówień do wyświetlenia</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map(order => {
                  const cfg = statusConfig[order.status];
                  const StatusIcon = cfg.icon;
                  const itemCount = order.order_items.reduce((s, i) => s + i.quantity, 0);

                  return (
                    <Card key={order.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        {/* Order header */}
                        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-bold">
                                #{order.id.slice(0, 8).toUpperCase()}
                              </span>
                              <Badge variant="outline" className={`${cfg.color} border-current`}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {cfg.label}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString('pl-PL', {
                                day: 'numeric', month: 'long', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                              })}
                            </p>
                          </div>
                          <span className="text-xl font-bold text-primary">
                            {Number(order.total).toFixed(2)} zł
                          </span>
                        </div>

                        {/* Order body */}
                        <div className="p-4 space-y-4">
                          {/* Customer */}
                          <div className="flex items-start gap-3 text-sm">
                            <div className="flex-1 space-y-1">
                              <p className="font-medium">{order.user_name || 'Brak nazwy'}</p>
                              <p className="text-muted-foreground">{order.user_email}</p>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <CreditCard className="h-3.5 w-3.5" />
                              {order.payment_method === 'card' ? 'Karta' : order.payment_method === 'cash' ? 'Gotówka' : order.payment_method}
                            </div>
                          </div>

                          {/* Address */}
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            <p className="text-muted-foreground">
                              {order.address_street} {order.address_building}
                              {order.address_apartment ? `/${order.address_apartment}` : ''}, {order.address_postal_code} {order.address_city}
                              {order.address_floor ? ` (piętro ${order.address_floor})` : ''}
                              {order.address_notes ? ` — ${order.address_notes}` : ''}
                            </p>
                          </div>

                          {/* Items */}
                          <div className="rounded-lg border border-border overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-muted/50">
                                <tr>
                                  <th className="text-left p-2 font-medium">Produkt</th>
                                  <th className="text-center p-2 font-medium">Ilość</th>
                                  <th className="text-right p-2 font-medium">Cena</th>
                                </tr>
                              </thead>
                              <tbody>
                                {order.order_items.map(item => (
                                  <tr key={item.id} className="border-t border-border">
                                    <td className="p-2">{item.product_name}</td>
                                    <td className="p-2 text-center">{item.quantity}</td>
                                    <td className="p-2 text-right font-medium">
                                      {(Number(item.price) * item.quantity).toFixed(2)} zł
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Summary */}
                          <div className="text-xs text-muted-foreground space-y-0.5">
                            <div className="flex justify-between">
                              <span>Produkty ({itemCount})</span>
                              <span>{Number(order.subtotal).toFixed(2)} zł</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Dostawa</span>
                              <span>{Number(order.delivery_cost).toFixed(2)} zł</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Opłata serwisowa</span>
                              <span>{Number(order.service_fee).toFixed(2)} zł</span>
                            </div>
                          </div>

                          {/* Status changer */}
                          <div className="flex items-center gap-3 pt-2 border-t border-border">
                            <span className="text-sm font-medium shrink-0">Zmień status:</span>
                            <Select
                              value={order.status}
                              onValueChange={(val) => handleStatusChange(order.id, val as OrderStatus)}
                              disabled={updatingId === order.id}
                            >
                              <SelectTrigger className="flex-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Constants.public.Enums.order_status.map(s => (
                                  <SelectItem key={s} value={s}>
                                    {statusConfig[s].label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {order.status !== 'delivered' && order.status !== 'cancelled' && (
                              <Button
                                size="sm"
                                disabled={updatingId === order.id}
                                onClick={() => {
                                  const currentIdx = statusFlow.indexOf(order.status);
                                  if (currentIdx >= 0 && currentIdx < statusFlow.length - 1) {
                                    handleStatusChange(order.id, statusFlow[currentIdx + 1]);
                                  }
                                }}
                              >
                                Następny →
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <MobileNav />
    </div>
  );
}
