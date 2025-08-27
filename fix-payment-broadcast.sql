-- Alternative approach: Update the realtime provider to also listen for postgres_changes on coin_topups
-- OR manually trigger the broadcast from the frontend when admin confirms payment

-- For now, let's create a simpler approach by updating the trigger to insert into a broadcast table
-- that the realtime provider can listen to

-- First, let's try a different approach - use postgres_changes instead of broadcast
-- The realtime provider can listen for changes on the coin_topups table

-- Update the trigger to be simpler and rely on postgres_changes
CREATE OR REPLACE FUNCTION public.broadcast_payment_confirmation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_new_balance bigint;
BEGIN
  IF new.status = 'confirmed' AND (old.status IS DISTINCT FROM 'confirmed') THEN
    -- Get the user's current balance
    SELECT COALESCE(SUM(delta), 0) INTO v_new_balance
    FROM public.coin_ledger
    WHERE user_id = new.user_id;
    
    -- Log the event (this can be picked up by postgres_changes listener)
    -- We'll add this functionality to the realtime provider
    RAISE LOG 'Payment confirmed for user % amount % new_balance %', 
      new.user_id, new.amount, v_new_balance;
  END IF;
  RETURN new;
END;
$$;

-- Alternative: Create a simple events table for broadcasting
CREATE TABLE IF NOT EXISTS public.payment_events (
  id bigserial PRIMARY KEY,
  event_type text NOT NULL,
  user_id uuid NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

-- Allow public to read events (they'll be filtered by the app)
CREATE POLICY "payment_events_select_all" ON public.payment_events
  FOR SELECT TO public USING (true);

-- Allow the trigger to insert events
CREATE POLICY "payment_events_insert_system" ON public.payment_events
  FOR INSERT TO public USING (true);

-- Update the broadcast function to use the events table
CREATE OR REPLACE FUNCTION public.broadcast_payment_confirmation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_new_balance bigint;
BEGIN
  IF new.status = 'confirmed' AND (old.status IS DISTINCT FROM 'confirmed') THEN
    -- Get the user's current balance
    SELECT COALESCE(SUM(delta), 0) INTO v_new_balance
    FROM public.coin_ledger
    WHERE user_id = new.user_id;
    
    -- Insert event into payment_events table
    -- This will trigger postgres_changes that the realtime provider can listen to
    INSERT INTO public.payment_events (event_type, user_id, payload)
    VALUES (
      'PAYMENT_CONFIRMED',
      new.user_id,
      json_build_object(
        'user_id', new.user_id,
        'topup_id', new.id,
        'amount', new.amount,
        'new_balance', v_new_balance,
        'provider', new.provider,
        'provider_ref', new.provider_ref,
        'confirmed_at', NOW()
      )
    );
  END IF;
  RETURN new;
END;
$$;
