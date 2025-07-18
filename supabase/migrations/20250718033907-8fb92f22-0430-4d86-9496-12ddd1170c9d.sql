-- Create the unlock_lead function
CREATE OR REPLACE FUNCTION public.unlock_lead(
  p_provider_id UUID,
  p_service_request_id UUID,
  p_credits_used INTEGER DEFAULT 1
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  -- Get current balance
  SELECT balance INTO current_balance 
  FROM public.credits 
  WHERE provider_id = p_provider_id;
  
  -- Check if user has enough credits
  IF current_balance IS NULL OR current_balance < p_credits_used THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;
  
  -- Check if lead is already unlocked
  IF EXISTS (
    SELECT 1 FROM public.lead_unlocks 
    WHERE provider_id = p_provider_id AND service_request_id = p_service_request_id
  ) THEN
    RAISE EXCEPTION 'Lead already unlocked';
  END IF;
  
  -- Create lead unlock record
  INSERT INTO public.lead_unlocks (provider_id, service_request_id, credits_used)
  VALUES (p_provider_id, p_service_request_id, p_credits_used);
  
  -- Update credits balance
  UPDATE public.credits 
  SET 
    balance = balance - p_credits_used,
    total_used = total_used + p_credits_used,
    updated_at = now()
  WHERE provider_id = p_provider_id;
  
  -- Create credit transaction record
  INSERT INTO public.credit_transactions (
    provider_id, 
    amount, 
    transaction_type, 
    service_request_id,
    description
  )
  VALUES (
    p_provider_id, 
    -p_credits_used, 
    'spent'::credit_transaction_type, 
    p_service_request_id,
    'Lead unlocked'
  );
  
  RETURN TRUE;
END;
$$;