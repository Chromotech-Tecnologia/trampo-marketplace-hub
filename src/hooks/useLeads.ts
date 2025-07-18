import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface LeadFilters {
  category_id?: string;
  city?: string;
  state?: string;
  budget_min?: number;
  budget_max?: number;
}

export const useLeads = (filters: LeadFilters = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch available leads (service requests that are active)
  const { data: leads, isLoading } = useQuery({
    queryKey: ['leads', filters],
    queryFn: async () => {
      let query = supabase
        .from('service_requests')
        .select(`
          id,
          title,
          description,
          city,
          state,
          urgency,
          budget_min,
          budget_max,
          created_at,
          expires_at,
          service_categories (
            id,
            name
          )
        `)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .neq('client_id', user?.id || '') // Don't show user's own requests
        .order('created_at', { ascending: false });

      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id);
      }

      if (filters.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }

      if (filters.state) {
        query = query.eq('state', filters.state);
      }

      if (filters.budget_min) {
        query = query.gte('budget_min', filters.budget_min);
      }

      if (filters.budget_max) {
        query = query.lte('budget_max', filters.budget_max);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch unlocked leads for current user
  const { data: unlockedLeads } = useQuery({
    queryKey: ['lead_unlocks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('lead_unlocks')
        .select(`
          *,
          service_requests (
            id,
            title,
            description,
            contact_email,
            contact_phone,
            city,
            state,
            urgency,
            budget_min,
            budget_max,
            service_categories (
              name
            )
          )
        `)
        .eq('provider_id', user.id)
        .order('unlocked_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Check if a lead is unlocked
  const isLeadUnlocked = (serviceRequestId: string) => {
    return unlockedLeads?.some(unlock => unlock.service_request_id === serviceRequestId) || false;
  };

  // Get unlocked lead data
  const getUnlockedLeadData = (serviceRequestId: string) => {
    const unlock = unlockedLeads?.find(unlock => unlock.service_request_id === serviceRequestId);
    return unlock?.service_requests || null;
  };

  return {
    leads: leads || [],
    unlockedLeads: unlockedLeads || [],
    isLoading,
    isLeadUnlocked,
    getUnlockedLeadData,
  };
};