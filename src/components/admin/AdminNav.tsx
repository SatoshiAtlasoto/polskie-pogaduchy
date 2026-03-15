import { useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, Package, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/orders', label: 'Zamówienia', icon: Package },
  { to: '/admin/kyc', label: 'Weryfikacja KYC', icon: Shield },
];

export function AdminNav() {
  const { pathname } = useLocation();

  return (
    <div className="flex gap-1 rounded-lg bg-muted p-1 mb-6">
      {adminLinks.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          className={cn(
            'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors flex-1 justify-center',
            pathname === to
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </div>
  );
}
