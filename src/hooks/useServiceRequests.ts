import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

interface ServiceRequestFilters {
  status?: Database['public']['Enums']['service_request_status'];
  category_id?: string;
  search?: string;
}

export interface ServiceRequestForm {
  title: string;
  description: string;
  category_id: string;
  urgency: string;
  city: string;
  state: string;
  budget_min?: number;
  budget_max?: number;
  contact_email?: string;
  contact_phone?: string;
}

export const useServiceRequests = (filters: ServiceRequestFilters = {}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch service requests for current user
  const { data: requests, isLoading, error } = useQuery({
    queryKey: ['service_requests', user?.id, filters],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('service_requests')
        .select(`
          *,
          service_categories (
            id,
            name
          )
        `)
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Create service request
  const createRequest = useMutation({
    mutationFn: async (requestData: ServiceRequestForm) => {
      console.log('Creating service request:', { user: user?.id, requestData });
      
      if (!user) {
        console.error('No user found');
        throw new Error('User not authenticated');
      }

      const insertData = {
        title: requestData.title,
        description: requestData.description,
        category_id: requestData.category_id,
        city: requestData.city,
        state: requestData.state,
        urgency: requestData.urgency || null,
        budget_min: requestData.budget_min || null,
        budget_max: requestData.budget_max || null,
        contact_phone: requestData.contact_phone || null,
        contact_email: requestData.contact_email || user.email || null,
        client_id: user.id,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active' as Database['public']['Enums']['service_request_status']
      };

      console.log('Insert data:', insertData);

      const { data, error } = await supabase
        .from('service_requests')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Request created successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Mutation success, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['service_requests'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: "Solicitação criada!",
        description: "Sua solicitação foi criada com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Error creating service request:', error);
      toast({
        title: "Erro ao criar solicitação",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    },
  });

  // Update service request
  const updateRequest = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<ServiceRequestForm>) => {
      const { data, error } = await supabase
        .from('service_requests')
        .update(updates)
        .eq('id', id)
        .eq('client_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service_requests'] });
      toast({
        title: "Solicitação atualizada!",
        description: "Sua solicitação foi atualizada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar solicitação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete service request
  const deleteRequest = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('service_requests')
        .delete()
        .eq('id', id)
        .eq('client_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service_requests'] });
      toast({
        title: "Solicitação removida!",
        description: "Sua solicitação foi removida com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover solicitação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update status
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Database['public']['Enums']['service_request_status'] }) => {
      const { data, error } = await supabase
        .from('service_requests')
        .update({ status })
        .eq('id', id)
        .eq('client_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service_requests'] });
      toast({
        title: "Status atualizado!",
        description: "O status da solicitação foi atualizado.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    requests: requests || [],
    isLoading,
    error,
    createRequest: createRequest.mutate,
    updateRequest: updateRequest.mutate,
    deleteRequest: deleteRequest.mutate,
    updateStatus: updateStatus.mutate,
    isCreating: createRequest.isPending,
    isUpdating: updateRequest.isPending,
    isDeleting: deleteRequest.isPending,
  };
};