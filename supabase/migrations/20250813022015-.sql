-- Add buyer details columns to credit_purchases for admin visibility and editing
ALTER TABLE public.credit_purchases
  ADD COLUMN IF NOT EXISTS buyer_name text,
  ADD COLUMN IF NOT EXISTS buyer_email text,
  ADD COLUMN IF NOT EXISTS buyer_phone text,
  ADD COLUMN IF NOT EXISTS buyer_cpf text;
