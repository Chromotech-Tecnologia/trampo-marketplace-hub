-- Fix search_path for existing functions
CREATE OR REPLACE FUNCTION public.unlock_lead(p_provider_id uuid, p_service_request_id uuid, p_credits_used integer DEFAULT 1)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND user_type = 'admin'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, user_type, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'client')::public.user_type,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  
  -- If provider, create credits record
  IF COALESCE(NEW.raw_user_meta_data->>'user_type', 'client') = 'provider' THEN
    INSERT INTO public.credits (provider_id, balance, total_purchased, total_used)
    VALUES (NEW.id, 0, 0, 0);
  END IF;
  
  RETURN NEW;
END;
$function$;