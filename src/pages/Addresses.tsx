import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, MapPin } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { Button } from '@/components/ui/button';
import { AddressCard } from '@/components/addresses/AddressCard';
import { AddressForm } from '@/components/addresses/AddressForm';
import { useAddresses, Address, AddressInput } from '@/hooks/useAddresses';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function Addresses() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { addresses, loading, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAddresses();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data: AddressInput) => {
    setSubmitting(true);
    if (editingAddress) {
      await updateAddress(editingAddress.id, data);
    } else {
      await addAddress(data);
    }
    setSubmitting(false);
    setIsFormOpen(false);
    setEditingAddress(null);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (deletingId) {
      await deleteAddress(deletingId);
      setDeletingId(null);
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingAddress(null);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <main className="container py-4">
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse text-muted-foreground">Ładowanie...</div>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <main className="container py-4">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MapPin className="mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="mb-2 font-display text-xl font-bold">Zaloguj się</h2>
            <p className="mb-4 text-muted-foreground">
              Aby zarządzać adresami, musisz się zalogować
            </p>
            <Button onClick={() => navigate('/auth')}>Zaloguj się</Button>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      <main className="container py-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-display text-xl font-bold">Adresy dostawy</h1>
          </div>
          <Button onClick={() => setIsFormOpen(true)} size="sm">
            <Plus className="mr-1 h-4 w-4" />
            Dodaj
          </Button>
        </div>

        {/* Address List */}
        {addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
            <MapPin className="mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="mb-2 font-display text-lg font-semibold">
              Brak zapisanych adresów
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Dodaj adres dostawy, aby szybciej składać zamówienia
            </p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Dodaj pierwszy adres
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                onEdit={handleEdit}
                onDelete={setDeletingId}
                onSetDefault={setDefaultAddress}
              />
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? 'Edytuj adres' : 'Dodaj nowy adres'}
            </DialogTitle>
          </DialogHeader>
          <AddressForm
            address={editingAddress}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={submitting}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usuń adres?</AlertDialogTitle>
            <AlertDialogDescription>
              Czy na pewno chcesz usunąć ten adres? Tej operacji nie można cofnąć.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MobileNav />
    </div>
  );
}
