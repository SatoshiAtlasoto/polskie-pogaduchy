import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useAdminOrderNotifications(enabled: boolean) {
  const { toast } = useToast();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    // Skip the first render to avoid toasting existing orders
    if (!initializedRef.current) {
      initializedRef.current = true;
    }

    const channel = supabase
      .channel('admin-new-orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const order = payload.new as { id: string; total: number };
          toast({
            title: '🔔 Nowe zamówienie!',
            description: `Zamówienie #${order.id.slice(0, 8).toUpperCase()} na kwotę ${Number(order.total).toFixed(2)} zł`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, toast]);
}
