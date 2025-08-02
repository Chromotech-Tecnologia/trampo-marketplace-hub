-- Create plans table for credit packages and cycles
CREATE TABLE public.credit_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('package', 'cycle')),
  credits_amount INTEGER NOT NULL,
  recurrence TEXT CHECK (recurrence IN ('monthly', 'quarterly', 'semester', 'annual') OR recurrence IS NULL),
  payment_link TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create credit purchases table for tracking purchases
CREATE TABLE public.credit_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL,
  plan_id UUID NOT NULL REFERENCES public.credit_plans(id),
  amount DECIMAL(10,2) NOT NULL,
  credits_amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  payment_reference TEXT,
  admin_notes TEXT,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.credit_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_purchases ENABLE ROW LEVEL SECURITY;

-- Policies for credit_plans
CREATE POLICY "Plans are publicly readable" ON public.credit_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage plans" ON public.credit_plans
  FOR ALL USING (is_admin());

-- Policies for credit_purchases  
CREATE POLICY "Providers can view their own purchases" ON public.credit_purchases
  FOR SELECT USING (provider_id = auth.uid());

CREATE POLICY "Providers can create purchases" ON public.credit_purchases
  FOR INSERT WITH CHECK (provider_id = auth.uid());

CREATE POLICY "Admins can manage all purchases" ON public.credit_purchases
  FOR ALL USING (is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_credit_plans_updated_at
  BEFORE UPDATE ON public.credit_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_credit_purchases_updated_at
  BEFORE UPDATE ON public.credit_purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create admin stats view for dashboard
CREATE OR REPLACE VIEW public.admin_stats AS
SELECT 
  (SELECT COUNT(*) FROM public.profiles WHERE user_type = 'client') as total_clients,
  (SELECT COUNT(*) FROM public.profiles WHERE user_type = 'provider') as total_providers,
  (SELECT COUNT(*) FROM public.service_requests) as total_requests,
  (SELECT COALESCE(SUM(total_purchased), 0) FROM public.credits) as total_credits_purchased,
  (SELECT COALESCE(SUM(total_used), 0) FROM public.credits) as total_credits_used,
  (SELECT COALESCE(SUM(balance), 0) FROM public.credits) as total_credits_available;

-- Grant access to admin stats
GRANT SELECT ON public.admin_stats TO authenticated;