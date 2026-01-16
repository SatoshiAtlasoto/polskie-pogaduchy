import { Home, Search, ShoppingCart, User, ClipboardList } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Home, label: 'Główna' },
  { path: '/search', icon: Search, label: 'Szukaj' },
  { path: '/orders', icon: ClipboardList, label: 'Zamówienia' },
  { path: '/cart', icon: ShoppingCart, label: 'Koszyk' },
  { path: '/profile', icon: User, label: 'Profil' },
];

export function MobileNav() {
  const location = useLocation();
  const { totalItems } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg safe-bottom">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          const isCart = path === '/cart';

          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'relative flex flex-col items-center gap-1 px-3 py-2 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {isCart && totalItems > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
              {isActive && (
                <span className="absolute -bottom-2 h-0.5 w-8 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
