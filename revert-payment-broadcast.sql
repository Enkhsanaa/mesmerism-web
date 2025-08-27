-- Revert to using pg_notify with LIVE_EVENTS channel
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
    
    -- Use pg_notify to broadcast to LIVE_EVENTS channel
    PERFORM pg_notify(
      'LIVE_EVENTS',
      json_build_object(
        'event', 'PAYMENT_CONFIRMED',
        'payload', json_build_object(
          'user_id', new.user_id,
          'topup_id', new.id,
          'amount', new.amount,
          'new_balance', v_new_balance,
          'provider', new.provider,
          'provider_ref', new.provider_ref,
          'confirmed_at', NOW()
        )
      )::text
    );
  END IF;
  RETURN new;
END;
$$;
