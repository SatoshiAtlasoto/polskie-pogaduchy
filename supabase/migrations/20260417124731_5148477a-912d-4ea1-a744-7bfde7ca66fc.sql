-- Enum for transaction types
CREATE TYPE public.deposit_transaction_type AS ENUM ('topup', 'deduction', 'refund', 'adjustment');

-- Deposit transactions table
CREATE TABLE public.deposit_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type public.deposit_transaction_type NOT NULL,
  amount NUMERIC NOT NULL,
  balance_after NUMERIC NOT NULL,
  description TEXT NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_deposit_transactions_user_id_created_at 
  ON public.deposit_transactions(user_id, created_at DESC);

ALTER TABLE public.deposit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own deposit transactions"
  ON public.deposit_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all deposit transactions"
  ON public.deposit_transactions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Top-up function (mock payment)
CREATE OR REPLACE FUNCTION public.topup_deposit(_amount NUMERIC, _description TEXT DEFAULT 'Doładowanie depozytu')
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
  _new_balance NUMERIC;
BEGIN
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RETURN false;
  END IF;
  
  IF _amount <= 0 OR _amount > 10000 THEN
    RETURN false;
  END IF;
  
  UPDATE public.profiles
  SET deposit_amount = COALESCE(deposit_amount, 0) + _amount,
      updated_at = now()
  WHERE user_id = _user_id
  RETURNING deposit_amount INTO _new_balance;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  INSERT INTO public.deposit_transactions (user_id, type, amount, balance_after, description)
  VALUES (_user_id, 'topup', _amount, _new_balance, _description);
  
  RETURN true;
END;
$$;

-- Updated cancel_order with transaction logging
CREATE OR REPLACE FUNCTION public.cancel_order(_order_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user_id uuid;
  _delivery_cost numeric;
  _current_deposit numeric;
  _new_balance numeric;
BEGIN
  SELECT user_id, delivery_cost INTO _user_id, _delivery_cost
  FROM public.orders
  WHERE id = _order_id
    AND user_id = auth.uid()
    AND status = 'pending';

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  SELECT COALESCE(deposit_amount, 0) INTO _current_deposit
  FROM public.profiles
  WHERE user_id = _user_id;

  IF _current_deposit < _delivery_cost THEN
    RETURN false;
  END IF;

  UPDATE public.profiles
  SET deposit_amount = COALESCE(deposit_amount, 0) - _delivery_cost,
      updated_at = now()
  WHERE user_id = _user_id
  RETURNING deposit_amount INTO _new_balance;

  UPDATE public.orders
  SET status = 'cancelled', updated_at = now()
  WHERE id = _order_id;

  INSERT INTO public.deposit_transactions (user_id, type, amount, balance_after, description, order_id)
  VALUES (_user_id, 'deduction', _delivery_cost, _new_balance, 'Opłata za anulowanie zamówienia', _order_id);

  RETURN true;
END;
$$;

-- Backfill historical deductions for already-cancelled orders
INSERT INTO public.deposit_transactions (user_id, type, amount, balance_after, description, order_id, created_at)
SELECT 
  o.user_id,
  'deduction'::public.deposit_transaction_type,
  o.delivery_cost,
  COALESCE(p.deposit_amount, 0),
  'Opłata za anulowanie zamówienia (historyczne)',
  o.id,
  o.updated_at
FROM public.orders o
LEFT JOIN public.profiles p ON p.user_id = o.user_id
WHERE o.status = 'cancelled' AND o.delivery_cost > 0;