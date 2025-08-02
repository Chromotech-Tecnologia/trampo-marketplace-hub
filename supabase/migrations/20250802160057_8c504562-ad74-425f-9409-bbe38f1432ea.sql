-- Remove the view and create a security definer function instead
DROP VIEW IF EXISTS public.admin_stats;

-- Create secure function for admin stats
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS TABLE(
  total_clients BIGINT,
  total_providers BIGINT,
  total_requests BIGINT,
  total_credits_purchased BIGINT,
  total_credits_used BIGINT,
  total_credits_available BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow admins to access this function
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.profiles WHERE user_type = 'client')::BIGINT as total_clients,
    (SELECT COUNT(*) FROM public.profiles WHERE user_type = 'provider')::BIGINT as total_providers,
    (SELECT COUNT(*) FROM public.service_requests)::BIGINT as total_requests,
    (SELECT COALESCE(SUM(total_purchased), 0) FROM public.credits)::BIGINT as total_credits_purchased,
    (SELECT COALESCE(SUM(total_used), 0) FROM public.credits)::BIGINT as total_credits_used,
    (SELECT COALESCE(SUM(balance), 0) FROM public.credits)::BIGINT as total_credits_available;
END;
$$;