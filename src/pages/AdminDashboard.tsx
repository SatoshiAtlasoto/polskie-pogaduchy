import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminRole } from '@/hooks/useAdminRole';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { AdminNav } from '@/components/admin/AdminNav';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import {
  LayoutDashboard, TrendingUp, ShoppingCart, Users, DollarSign,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OrderRow {
  id: string;
  created_at: string;
  status: string;
  total: number;
  subtotal: number;
  delivery_cost: number;
  service_fee: number;
  user_id: string;
}

interface OrderItemRow {
  product_name: string;
  quantity: number;
  price: number;
  order_id: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'hsl(45, 93%, 47%)',
  confirmed: 'hsl(217, 91%, 60%)',
  preparing: 'hsl(25, 95%, 53%)',
  in_transit: 'hsl(262, 83%, 58%)',
  delivered: 'hsl(142, 71%, 45%)',
  cancelled: 'hsl(0, 84%, 60%)',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Oczekujące',
  confirmed: 'Potwierdzone',
  preparing: 'Przygotowywane',
  in_transit: 'W drodze',
  delivered: 'Dostarczone',
  cancelled: 'Anulowane',
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminRole();
  const { toast } = useToast();

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItemRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { navigate('/auth'); return; }
    if (!authLoading && !adminLoading && !isAdmin) {
      navigate('/');
      toast({ title: 'Brak dostępu', description: 'Nie masz uprawnień.', variant: 'destructive' });
    }
  }, [user, authLoading, isAdmin, adminLoading, navigate, toast]);

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    const [ordersRes, itemsRes] = await Promise.all([
      supabase.from('orders').select('id, created_at, status, total, subtotal, delivery_cost, service_fee, user_id'),
      supabase.from('order_items').select('product_name, quantity, price, order_id'),
    ]);

    if (ordersRes.error) {
      console.error(ordersRes.error);
      toast({ title: 'Błąd', description: 'Nie udało się pobrać danych.', variant: 'destructive' });
    }

    setOrders((ordersRes.data || []) as OrderRow[]);
    setOrderItems((itemsRes.data || []) as OrderItemRow[]);
    setLoading(false);
  };

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
    const deliveredRevenue = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + Number(o.total), 0);
    const uniqueCustomers = new Set(orders.map(o => o.user_id)).size;
    const avgOrderValue = orders.length ? totalRevenue / orders.length : 0;
    return { totalRevenue, deliveredRevenue, uniqueCustomers, avgOrderValue, totalOrders: orders.length };
  }, [orders]);

  const dailyData = useMemo(() => {
    const map = new Map<string, { date: string; revenue: number; orders: number }>();
    orders.forEach(o => {
      const date = new Date(o.created_at).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
      const existing = map.get(date) || { date, revenue: 0, orders: 0 };
      existing.revenue += Number(o.total);
      existing.orders += 1;
      map.set(date, existing);
    });
    return Array.from(map.values()).slice(-14);
  }, [orders]);

  const statusData = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach(o => map.set(o.status, (map.get(o.status) || 0) + 1));
    return Array.from(map.entries()).map(([status, count]) => ({
      name: STATUS_LABELS[status] || status,
      value: count,
      fill: STATUS_COLORS[status] || 'hsl(var(--muted))',
    }));
  }, [orders]);

  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; quantity: number; revenue: number }>();
    orderItems.forEach(item => {
      const existing = map.get(item.product_name) || { name: item.product_name, quantity: 0, revenue: 0 };
      existing.quantity += item.quantity;
      existing.revenue += Number(item.price) * item.quantity;
      map.set(item.product_name, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 6);
  }, [orderItems]);

  const revenueChartConfig = {
    revenue: { label: 'Przychód', color: 'hsl(var(--primary))' },
    orders: { label: 'Zamówienia', color: 'hsl(var(--accent-foreground))' },
  };

  const productsChartConfig = {
    revenue: { label: 'Przychód', color: 'hsl(var(--primary))' },
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

        <div className="flex items-center gap-3 mb-6">
          <LayoutDashboard className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Statystyki i wykresy sprzedaży</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2.5">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Przychód</p>
                    <p className="text-lg font-bold">{stats.totalRevenue.toFixed(0)} zł</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="rounded-lg bg-green-500/10 p-2.5">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Zrealizowane</p>
                    <p className="text-lg font-bold">{stats.deliveredRevenue.toFixed(0)} zł</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="rounded-lg bg-blue-500/10 p-2.5">
                    <ShoppingCart className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Zamówienia</p>
                    <p className="text-lg font-bold">{stats.totalOrders}</p>
                    <p className="text-[10px] text-muted-foreground">Śr. {stats.avgOrderValue.toFixed(0)} zł</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="rounded-lg bg-orange-500/10 p-2.5">
                    <Users className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Klienci</p>
                    <p className="text-lg font-bold">{stats.uniqueCustomers}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts row */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Revenue over time */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Przychód dzienny</CardTitle>
                  <CardDescription>Ostatnie 14 dni</CardDescription>
                </CardHeader>
                <CardContent>
                  {dailyData.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-12">Brak danych</p>
                  ) : (
                    <ChartContainer config={revenueChartConfig} className="h-[260px] w-full">
                      <BarChart data={dailyData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} name="Przychód" />
                      </BarChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>

              {/* Orders over time */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Zamówienia dziennie</CardTitle>
                  <CardDescription>Ostatnie 14 dni</CardDescription>
                </CardHeader>
                <CardContent>
                  {dailyData.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-12">Brak danych</p>
                  ) : (
                    <ChartContainer config={revenueChartConfig} className="h-[260px] w-full">
                      <LineChart data={dailyData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="orders" stroke="var(--color-orders)" strokeWidth={2} dot={{ r: 4 }} name="Zamówienia" />
                      </LineChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Status pie */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Statusy zamówień</CardTitle>
                </CardHeader>
                <CardContent>
                  {statusData.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-12">Brak danych</p>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="h-[200px] w-[200px] shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                              {statusData.map((entry, i) => (
                                <Cell key={i} fill={entry.fill} />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-2">
                        {statusData.map((s, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <div className="h-3 w-3 rounded-sm shrink-0" style={{ backgroundColor: s.fill }} />
                            <span className="text-muted-foreground">{s.name}</span>
                            <span className="font-medium ml-auto">{s.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top products */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Najpopularniejsze produkty</CardTitle>
                  <CardDescription>Wg przychodu</CardDescription>
                </CardHeader>
                <CardContent>
                  {topProducts.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-12">Brak danych</p>
                  ) : (
                    <ChartContainer config={productsChartConfig} className="h-[260px] w-full">
                      <BarChart data={topProducts} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[0, 4, 4, 0]} name="Przychód" />
                      </BarChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
      <MobileNav />
    </div>
  );
}
