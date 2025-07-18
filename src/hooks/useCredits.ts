import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

export const useCredits = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user credits
  const { data: credits, isLoading: isLoadingCredits } = useQuery({
    queryKey: ['credits', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('credits')
        .select('*')
        .eq('provider_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch credit transactions
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['credit_transactions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Purchase credits
  const purchaseCredits = useMutation({
    mutationFn: async (packageType: 'basic' | 'standard' | 'premium') => {
      if (!user?.email) throw new Error('User not authenticated');

      const packages = {
        basic: { credits: 10, price: 2999 },
        standard: { credits: 25, price: 6999 },
        premium: { credits: 50, price: 12999 }
      };

      const selectedPackage = packages[packageType];

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          credits: selectedPackage.credits,
          amount: selectedPackage.price,
          provider_id: user.id
        }
      });

      if (error) throw error;

      // Open Stripe checkout in new tab
      if (data?.url) {
        window.open(data.url, '_blank');
      }

      return data;
    },
    onError: (error) => {
      toast({
        title: "Erro ao processar pagamento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Spend credits (for unlocking leads)
  const spendCredits = useMutation({
    mutationFn: async ({ serviceRequestId, amount = 1 }: { serviceRequestId: string; amount?: number }) => {
      if (!user) throw new Error('User not authenticated');

      // Check if user has enough credits
      if (!credits || credits.balance < amount) {
        throw new Error('Créditos insuficientes');
      }

      // Create lead unlock record and update credits
      const { data, error } = await supabase.rpc('unlock_lead', {
        p_provider_id: user.id,
        p_service_request_id: serviceRequestId,
        p_credits_used: amount
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credits'] });
      queryClient.invalidateQueries({ queryKey: ['credit_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['lead_unlocks'] });
      toast({
        title: "Lead desbloqueado!",
        description: "Você agora tem acesso aos dados de contato do cliente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao desbloquear lead",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    credits,
    transactions,
    isLoadingCredits,
    isLoadingTransactions,
    purchaseCredits: purchaseCredits.mutate,
    spendCredits: spendCredits.mutate,
    isPurchasing: purchaseCredits.isPending,
    isSpending: spendCredits.isPending,
  };
};