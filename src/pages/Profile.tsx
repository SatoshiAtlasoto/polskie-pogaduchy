import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Building2,
  CheckCircle2,
  Pencil,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CompanyDataForm } from '@/components/profile/CompanyDataForm';

const menuItems = [
  { icon: MapPin, label: 'Adresy dostawy', href: '/addresses' },
  { icon: CreditCard, label: 'Metody płatności', href: '#' },
  { icon: FileText, label: 'Faktury', href: '#' },
  { icon: Shield, label: 'Weryfikacja tożsamości', href: '/kyc', badge: 'Wymagana' },
  { icon: HelpCircle, label: 'Pomoc i kontakt', href: '#' },
];

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, signOut, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isCompanyFormOpen, setIsCompanyFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Wylogowano',
      description: 'Do zobaczenia!',
    });
  };

  const handleCompanyDataSubmit = async (data: { company_name: string; company_nip: string }) => {
    setSubmitting(true);
    const { error } = await updateProfile(data);
    setSubmitting(false);

    if (error) {
      toast({
        title: 'Błąd',
        description: 'Nie udało się zapisać danych firmy',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Zapisano',
        description: 'Dane firmy zostały zaktualizowane',
      });
      setIsCompanyFormOpen(false);
    }
  };

  const getLevelDisplay = (level: string) => {
    switch (level) {
      case 'verified':
        return { name: 'Zweryfikowany', color: 'text-green-500' };
      case 'pro':
        return { name: 'PRO (Firma)', color: 'text-primary' };
      default:
        return { name: 'Gość', color: 'text-muted-foreground' };
    }
  };

  const currentLevel = profile?.level ? getLevelDisplay(profile.level) : getLevelDisplay('guest');

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      <main className="container py-4">
        {/* User Card */}
        <div className="mb-6 rounded-xl border border-border bg-gradient-card p-4">
          {user ? (
            <>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  {profile?.level === 'pro' ? (
                    <Building2 className="h-8 w-8 text-primary" />
                  ) : profile?.level === 'verified' ? (
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  ) : (
                    <User className="h-8 w-8 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-lg font-bold">
                    {profile?.full_name || 'Użytkownik'}
                  </h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <span className={`text-xs font-medium ${currentLevel.color}`}>
                    {currentLevel.name}
                  </span>
                </div>
              </div>

              {profile?.level === 'verified' && profile.deposit_amount > 0 && (
                <div className="mt-4 rounded-lg bg-secondary/50 p-3">
                  <p className="text-sm text-muted-foreground">Depozyt</p>
                  <p className="font-display text-lg font-bold">
                    {profile.deposit_amount.toFixed(2)} zł
                  </p>
                </div>
              )}

              {/* Company Data Section - visible for all logged in users */}
              {user && (
                <div className="mt-4 rounded-lg bg-secondary/50 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Dane firmy</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsCompanyFormOpen(true)}
                      className="h-7 px-2"
                    >
                      <Pencil className="mr-1 h-3 w-3" />
                      {profile?.company_name ? 'Edytuj' : 'Dodaj'}
                    </Button>
                  </div>
                  {profile?.company_name ? (
                    <>
                      <p className="font-medium">{profile.company_name}</p>
                      {profile.company_nip && (
                        <p className="text-xs text-muted-foreground">
                          NIP: {profile.company_nip}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Dodaj dane firmy do wystawiania faktur
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
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
                <Button className="flex-1" onClick={() => navigate('/auth')}>
                  Zaloguj się
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => navigate('/auth')}
                >
                  Zarejestruj
                </Button>
              </div>
            </>
          )}
        </div>

        {/* User Levels Info */}
        <div className="mb-6 rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 flex items-center gap-2 font-display font-semibold">
            <Star className="h-5 w-5 text-primary" />
            Poziomy użytkownika
          </h3>
          <div className="space-y-3">
            <div
              className={`flex items-center justify-between rounded-lg bg-secondary/50 p-3 ${
                profile?.level === 'guest' || !profile ? '' : 'opacity-60'
              }`}
            >
              <div>
                <p className="font-medium">Gość</p>
                <p className="text-xs text-muted-foreground">
                  Karta/BLIK • Limit 500 zł
                </p>
              </div>
              {(profile?.level === 'guest' || !profile) && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  Aktywny
                </span>
              )}
            </div>
            <div
              className={`flex items-center justify-between rounded-lg bg-secondary/50 p-3 ${
                profile?.level === 'verified' ? '' : 'opacity-60'
              }`}
            >
              <div>
                <p className="font-medium">Zweryfikowany</p>
                <p className="text-xs text-muted-foreground">
                  + Gotówka • Limit 5000 zł
                </p>
              </div>
              {profile?.level === 'verified' && (
                <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500">
                  Aktywny
                </span>
              )}
            </div>
            <div
              className={`flex items-center justify-between rounded-lg bg-secondary/50 p-3 ${
                profile?.level === 'pro' ? '' : 'opacity-60'
              }`}
            >
              <div>
                <p className="font-medium">PRO (Firma)</p>
                <p className="text-xs text-muted-foreground">
                  Faktury • Bez limitu
                </p>
              </div>
              {profile?.level === 'pro' && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  Aktywny
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="space-y-1">
          {menuItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => {
                if (item.href.startsWith('/')) {
                  e.preventDefault();
                  navigate(item.href);
                }
              }}
              className="flex items-center justify-between rounded-xl p-4 transition-colors hover:bg-secondary"
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5 text-muted-foreground" />
                <span>{item.label}</span>
                {item.badge && profile?.level === 'guest' && (
                  <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
                    {item.badge}
                  </span>
                )}
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </a>
          ))}

          {user && (
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-xl p-4 text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-5 w-5" />
              <span>Wyloguj się</span>
            </button>
          )}
        </div>
      </main>

      <MobileNav />

      {/* Company Data Dialog */}
      <Dialog open={isCompanyFormOpen} onOpenChange={setIsCompanyFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {profile?.company_name ? 'Edytuj dane firmy' : 'Dodaj dane firmy'}
            </DialogTitle>
          </DialogHeader>
          <CompanyDataForm
            initialData={{
              company_name: profile?.company_name || null,
              company_nip: profile?.company_nip || null,
            }}
            onSubmit={handleCompanyDataSubmit}
            onCancel={() => setIsCompanyFormOpen(false)}
            loading={submitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
