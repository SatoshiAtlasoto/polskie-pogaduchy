
CREATE OR REPLACE FUNCTION public.cancel_order(_order_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
  _delivery_cost numeric;
  _current_deposit numeric;
BEGIN
  -- Get order info
  SELECT user_id, delivery_cost INTO _user_id, _delivery_cost
  FROM public.orders
  WHERE id = _order_id
    AND user_id = auth.uid()
    AND status = 'pending';

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Check deposit
  SELECT COALESCE(deposit_amount, 0) INTO _current_deposit
  FROM public.profiles
  WHERE user_id = _user_id;

  IF _current_deposit < _delivery_cost THEN
    RETURN false;
  END IF;

  -- Deduct fee from deposit
  UPDATE public.profiles
  SET deposit_amount = COALESCE(deposit_amount, 0) - _delivery_cost,
      updated_at = now()
  WHERE user_id = _user_id;

  -- Cancel the order
  UPDATE public.orders
  SET status = 'cancelled', updated_at = now()
  WHERE id = _order_id;

  RETURN true;
END;
$$;
