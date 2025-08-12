-- Add payment_method to credit_plans
ALTER TABLE public.credit_plans
ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'pix';

-- Add provider_notes and payment_method to credit_purchases
ALTER TABLE public.credit_purchases
ADD COLUMN IF NOT EXISTS provider_notes text,
ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'pix';

-- Enforce at most one pending purchase per provider
CREATE UNIQUE INDEX IF NOT EXISTS uq_credit_purchases_pending_per_provider
ON public.credit_purchases (provider_id)
WHERE status = 'pending';