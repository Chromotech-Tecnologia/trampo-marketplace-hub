-- Create enums for the system
CREATE TYPE public.user_type AS ENUM ('client', 'provider', 'admin');
CREATE TYPE public.service_request_status AS ENUM ('active', 'paused', 'completed', 'cancelled');
CREATE TYPE public.credit_transaction_type AS ENUM ('purchase', 'use', 'refund', 'bonus');

-- Create profiles table for users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type public.user_type NOT NULL DEFAULT 'client',
  name TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  description TEXT,
  city TEXT,
  state TEXT,
  profile_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create service categories table
CREATE TABLE public.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES public.service_categories(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create service requests table (leads)
CREATE TABLE public.service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.service_categories(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  budget_min INTEGER,
  budget_max INTEGER,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  urgency TEXT,
  status public.service_request_status DEFAULT 'active',
  expires_at TIMESTAMPTZ,
  contact_phone TEXT,
  contact_email TEXT,
  additional_info JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create provider categories (which categories each provider works with)
CREATE TABLE public.provider_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(provider_id, category_id)
);

-- Create credits table for providers
CREATE TABLE public.credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL UNIQUE REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0,
  total_purchased INTEGER DEFAULT 0,
  total_used INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create credit transactions table
CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type public.credit_transaction_type NOT NULL,
  description TEXT,
  service_request_id UUID REFERENCES public.service_requests(id),
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create lead unlocks table (track which leads each provider unlocked)
CREATE TABLE public.lead_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  service_request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  credits_used INTEGER NOT NULL DEFAULT 1,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(provider_id, service_request_id)
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  related_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Public profiles are viewable" ON public.profiles FOR SELECT USING (user_type = 'provider' AND is_active = true);

-- Create RLS policies for service categories (public read)
CREATE POLICY "Service categories are publicly readable" ON public.service_categories FOR SELECT USING (is_active = true);

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND user_type = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create RLS policies for service requests
CREATE POLICY "Clients can manage their own requests" ON public.service_requests 
  FOR ALL USING (client_id = auth.uid());
CREATE POLICY "Providers can view active requests" ON public.service_requests 
  FOR SELECT USING (status = 'active' AND expires_at > now());
CREATE POLICY "Admins can manage all requests" ON public.service_requests 
  FOR ALL USING (public.is_admin());

-- Create RLS policies for provider categories
CREATE POLICY "Providers can manage their categories" ON public.provider_categories 
  FOR ALL USING (provider_id = auth.uid());
CREATE POLICY "Provider categories are publicly readable" ON public.provider_categories 
  FOR SELECT USING (true);

-- Create RLS policies for credits
CREATE POLICY "Providers can view their own credits" ON public.credits 
  FOR SELECT USING (provider_id = auth.uid());
CREATE POLICY "Providers can update their own credits" ON public.credits 
  FOR UPDATE USING (provider_id = auth.uid());
CREATE POLICY "Providers can insert their own credits" ON public.credits 
  FOR INSERT WITH CHECK (provider_id = auth.uid());

-- Create RLS policies for credit transactions
CREATE POLICY "Providers can view their own transactions" ON public.credit_transactions 
  FOR SELECT USING (provider_id = auth.uid());
CREATE POLICY "System can insert transactions" ON public.credit_transactions 
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for lead unlocks
CREATE POLICY "Providers can view their own unlocks" ON public.lead_unlocks 
  FOR SELECT USING (provider_id = auth.uid());
CREATE POLICY "Providers can create unlocks" ON public.lead_unlocks 
  FOR INSERT WITH CHECK (provider_id = auth.uid());

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications 
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their own notifications" ON public.notifications 
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System can insert notifications" ON public.notifications 
  FOR INSERT WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON public.service_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_credits_updated_at BEFORE UPDATE ON public.credits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default service categories
INSERT INTO public.service_categories (name, description, sort_order) VALUES
('Construção', 'Serviços de construção e reforma', 1),
('Elétrica', 'Serviços elétricos residenciais e comerciais', 2),
('Encanamento', 'Serviços hidráulicos e encanamento', 3),
('Pintura', 'Serviços de pintura residencial e comercial', 4),
('Limpeza', 'Serviços de limpeza residencial e comercial', 5),
('Jardinagem', 'Serviços de jardinagem e paisagismo', 6),
('Tecnologia', 'Serviços de TI e tecnologia', 7),
('Educação', 'Serviços educacionais e cursos', 8),
('Saúde', 'Serviços de saúde e bem-estar', 9),
('Beleza', 'Serviços de beleza e estética', 10);

-- Create admin user function
CREATE OR REPLACE FUNCTION public.create_admin_user()
RETURNS VOID AS $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- This function will be called manually to create admin user
  -- The actual user creation must be done through Supabase Auth
  NULL;
END;
$$ LANGUAGE plpgsql;