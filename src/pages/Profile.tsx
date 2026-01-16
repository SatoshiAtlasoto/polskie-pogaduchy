import {
  User,
  MapPin,
  CreditCard,
  FileText,
  HelpCircle,
  LogOut,
  ChevronRight,
  Shield,
  Star,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { Button } from '@/components/ui/button';

const menuItems = [
  { icon: MapPin, label: 'Adresy dostawy', href: '#' },
  { icon: CreditCard, label: 'Metody płatności', href: '#' },
  { icon: FileText, label: 'Faktury', href: '#' },
  { icon: Shield, label: 'Weryfikacja tożsamości', href: '#', badge: 'Wymagana' },
  { icon: HelpCircle, label: 'Pomoc i kontakt', href: '#' },
];

export default function Profile() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      <main className="container py-4">
        {/* User Card */}
        <div className="mb-6 rounded-xl border border-border bg-gradient-card p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-lg font-bold">Gość</h2>
              <p className="text-sm text-muted-foreground">
                Zaloguj się, aby uzyskać pełny dostęp
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button className="flex-1">Zaloguj się</Button>
            <Button variant="secondary" className="flex-1">
              Zarejestruj
            </Button>
          </div>
        </div>

        {/* User Levels Info */}
        <div className="mb-6 rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 flex items-center gap-2 font-display font-semibold">
            <Star className="h-5 w-5 text-primary" />
            Poziomy użytkownika
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
              <div>
                <p className="font-medium">Gość</p>
                <p className="text-xs text-muted-foreground">
                  Karta/BLIK • Limit 500 zł
                </p>
              </div>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Aktywny
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3 opacity-60">
              <div>
                <p className="font-medium">Zweryfikowany</p>
                <p className="text-xs text-muted-foreground">
                  + Gotówka • Limit 5000 zł
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3 opacity-60">
              <div>
                <p className="font-medium">PRO (Firma)</p>
                <p className="text-xs text-muted-foreground">
                  Faktury • Bez limitu
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="space-y-1">
          {menuItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center justify-between rounded-xl p-4 transition-colors hover:bg-secondary"
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5 text-muted-foreground" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
                    {item.badge}
                  </span>
                )}
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </a>
          ))}

          <button className="flex w-full items-center gap-3 rounded-xl p-4 text-destructive transition-colors hover:bg-destructive/10">
            <LogOut className="h-5 w-5" />
            <span>Wyloguj się</span>
          </button>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
