import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { CreditPlan } from '@/hooks/useCreditPlans';

export const usePurchases = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: pendingPurchase, isLoading: isLoadingPending } = useQuery({
    queryKey: ['pending-purchase', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('credit_purchases')
        .select('*')
        .eq('provider_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // ignore no rows error
      return data || null;
    },
    enabled: !!user,
  });

  const createPurchase = useMutation({
    mutationFn: async ({ plan, notes }: { plan: CreditPlan; notes?: string }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('credit_purchases')
        .insert({
          provider_id: user.id,
          plan_id: plan.id,
          amount: plan.price,
          credits_amount: plan.credits_amount,
          status: 'pending',
          payment_method: (plan as any).payment_method || 'pix',
          provider_notes: notes || null,
        })
        .select('*')
        .single();

      if (error) throw error as any;
      return data;
    },
    onSuccess: (purchase) => {
      queryClient.invalidateQueries({ queryKey: ['pending-purchase'] });
      queryClient.invalidateQueries({ queryKey: ['admin-purchases'] });
      const method = (purchase as any).payment_method || 'pix';
      toast({
        title: 'Compra criada e em análise',
        description:
          method === 'pix'
            ? 'Pagamento via Pix: em minutos seu crédito deve ser liberado após aprovação.'
            : 'Pagamento via Boleto: liberação prevista entre 24 e 48 horas úteis após aprovação.',
      });
    },
    onError: (error: any) => {
      const message = error?.message?.includes('uq_credit_purchases_pending_per_provider')
        ? 'Você já possui uma compra pendente. Aguarde a aprovação para fazer outra compra.'
        : error?.message || 'Não foi possível criar a compra.';
      toast({ title: 'Erro ao criar compra', description: message, variant: 'destructive' });
    },
  });

  return {
    pendingPurchase,
    isLoadingPending,
    createPurchase: createPurchase.mutate,
    isCreating: createPurchase.isPending,
  };
};
