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

export type FilterType = 'all' | DepositTransactionType;

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

export function useDepositTransactions(
  filterType: FilterType = 'all',
  dateRange: DateRange = { from: null, to: null }
) {
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
    
    let query = supabase
      .from('deposit_transactions')
      .select('*')
      .eq('user_id', user.id);

    // Filter by type
    if (filterType !== 'all') {
      query = query.eq('type', filterType);
    }

    // Filter by date range
    if (dateRange.from) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      query = query.gte('created_at', fromDate.toISOString());
    }
    if (dateRange.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      query = query.lte('created_at', toDate.toISOString());
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching deposit transactions:', error);
      setTransactions([]);
    } else {
      setTransactions((data ?? []) as DepositTransaction[]);
    }
    setLoading(false);
  }, [user, filterType, dateRange]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, loading, refetch: fetchTransactions };
}
