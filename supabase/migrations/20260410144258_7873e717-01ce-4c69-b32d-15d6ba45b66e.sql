
CREATE OR REPLACE FUNCTION public.cancel_order(_order_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.orders
  SET status = 'cancelled', updated_at = now()
  WHERE id = _order_id
    AND user_id = auth.uid()
    AND status = 'pending';
  
  RETURN FOUND;
END;
$$;
