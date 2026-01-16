import { Package, Clock, CheckCircle2, Truck } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';

const mockOrders = [
  {
    id: 'ORD-001',
    date: '2024-01-15',
    status: 'delivered',
    total: 342.50,
    items: 3,
  },
  {
    id: 'ORD-002',
    date: '2024-01-14',
    status: 'in_transit',
    total: 1289.00,
    items: 5,
  },
];

const statusConfig = {
  pending: { label: 'Oczekuje', icon: Clock, color: 'text-warning' },
  confirmed: { label: 'Potwierdzone', icon: Package, color: 'text-info' },
  in_transit: { label: 'W drodze', icon: Truck, color: 'text-primary' },
  delivered: { label: 'Dostarczone', icon: CheckCircle2, color: 'text-success' },
};

export default function Orders() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      <main className="container py-4">
        <h1 className="mb-4 font-display text-xl font-bold">Zamówienia</h1>

        {mockOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="mb-4 text-6xl">📦</span>
            <h2 className="mb-2 font-display text-lg font-bold">
              Brak zamówień
            </h2>
            <p className="text-muted-foreground">
              Twoje zamówienia pojawią się tutaj
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {mockOrders.map((order) => {
              const status = statusConfig[order.status as keyof typeof statusConfig];
              const StatusIcon = status.icon;

              return (
                <div
                  key={order.id}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-mono text-sm text-muted-foreground">
                      {order.id}
                    </span>
                    <div className={`flex items-center gap-1.5 ${status.color}`}>
                      <StatusIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">{status.label}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {order.items} produktów
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.date).toLocaleDateString('pl-PL')}
                      </p>
                    </div>
                    <span className="text-lg font-bold text-primary">
                      {order.total.toFixed(2)} zł
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
