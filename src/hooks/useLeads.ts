import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

export const useLeads = () => {
  const { user } = useAuth();

  // Fetch available leads for providers
  const { data: leads, isLoading, error, refetch } = useQuery({
    queryKey: ['leads', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('Fetching leads for provider:', user.id);

      // Get leads (service requests) that are active and not expired
      const { data: serviceRequests, error: requestsError } = await supabase
        .from('service_requests')
        .select(`
          *,
          service_categories (
            id,
            name
          )
        `)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (requestsError) {
        console.error('Error fetching service requests:', requestsError);
        throw requestsError;
      }

      console.log('Available service requests:', serviceRequests);

      // Get unlocked leads for this provider
      const { data: unlockedLeads, error: unlockedError } = await supabase
        .from('lead_unlocks')
        .select('service_request_id')
        .eq('provider_id', user.id);

      if (unlockedError) {
        console.error('Error fetching unlocked leads:', unlockedError);
        throw unlockedError;
      }

      console.log('Unlocked leads:', unlockedLeads);

      const unlockedIds = new Set(unlockedLeads?.map(unlock => unlock.service_request_id) || []);

      // Mark leads as unlocked or locked
      const leadsWithStatus = serviceRequests?.map(request => ({
        ...request,
        isUnlocked: unlockedIds.has(request.id),
      })) || [];

      console.log('Leads with unlock status:', leadsWithStatus);
      
      return leadsWithStatus;
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return {
    leads: leads || [],
    isLoading,
    error,
    refetch,
  };
};