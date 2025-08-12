import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CreditPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  credits_amount: number;
  plan_type: string;
  recurrence: string | null;
  payment_link: string | null;
  payment_method?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useCreditPlans = () => {
  return useQuery({
    queryKey: ['credit_plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('credit_plans')
        .select('*')
        .eq('is_active', true)
        .order('price');

      if (error) throw error;
      return data as CreditPlan[];
    },
  });
};