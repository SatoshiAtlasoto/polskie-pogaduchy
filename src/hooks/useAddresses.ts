import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Address {
  id: string;
  user_id: string;
  label: string;
  street: string;
  building: string;
  apartment: string | null;
  floor: number;
  city: string;
  postal_code: string;
  notes: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export type AddressInput = Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export function useAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAddresses = async () => {
    if (!user) {
      setAddresses([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching addresses:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się pobrać adresów',
        variant: 'destructive',
      });
    } else {
      setAddresses(data as Address[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  const addAddress = async (address: AddressInput) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('addresses')
      .insert({
        ...address,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Błąd',
        description: 'Nie udało się dodać adresu',
        variant: 'destructive',
      });
      return { error };
    }

    await fetchAddresses();
    toast({
      title: 'Sukces',
      description: 'Adres został dodany',
    });
    return { data, error: null };
  };

  const updateAddress = async (id: string, address: Partial<AddressInput>) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('addresses')
      .update(address)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: 'Błąd',
        description: 'Nie udało się zaktualizować adresu',
        variant: 'destructive',
      });
      return { error };
    }

    await fetchAddresses();
    toast({
      title: 'Sukces',
      description: 'Adres został zaktualizowany',
    });
    return { error: null };
  };

  const deleteAddress = async (id: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: 'Błąd',
        description: 'Nie udało się usunąć adresu',
        variant: 'destructive',
      });
      return { error };
    }

    await fetchAddresses();
    toast({
      title: 'Sukces',
      description: 'Adres został usunięty',
    });
    return { error: null };
  };

  const setDefaultAddress = async (id: string) => {
    return updateAddress(id, { is_default: true });
  };

  return {
    addresses,
    loading,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    refetch: fetchAddresses,
  };
}
