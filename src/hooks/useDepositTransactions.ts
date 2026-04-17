import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type DepositTransactionType = 'topup' | 'deduction' | 'refund' | 'adjustment';

export interface DepositTransaction {
  id: string;
  user_id: string;
  type: DepositTransactionType;
  amount: number;
  balance_after: number;
  description: string;
  order_id: string | null;
  created_at: string;
}

export function useDepositTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<DepositTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('deposit_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching deposit transactions:', error);
      setTransactions([]);
    } else {
      setTransactions((data ?? []) as DepositTransaction[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, loading, refetch: fetchTransactions };
}
