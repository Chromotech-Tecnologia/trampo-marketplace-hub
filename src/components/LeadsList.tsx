import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Eye, Search, Calendar, MapPin, DollarSign, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCredits } from '@/hooks/useCredits';
import { useToast } from '@/hooks/use-toast';
import { useLeads } from '@/hooks/useLeads';
import { useAuth } from '@/contexts/AuthContext';

export const LeadsList = () => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const { user } = useAuth();
  const { credits, spendCredits, isSpending } = useCredits();
  const { toast } = useToast();
  const { leads, isLoading, refetch } = useLeads();

  // Fetch categories for filter
  const { data: categories } = useQuery({
    queryKey: ['service_categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  // Filter leads based on search and category
  const filteredLeads = leads?.filter((lead) => {
    const matchesSearch = !search || 
      lead.title.toLowerCase().includes(search.toLowerCase()) ||
      lead.description.toLowerCase().includes(search.toLowerCase()) ||
      lead.city.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = !categoryFilter || lead.category_id === categoryFilter;
    
    return matchesSearch && matchesCategory;
  }) || [];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'baixa':
        return 'bg-blue-100 text-blue-800';
      case 'media':
        return 'bg-yellow-100 text-yellow-800';
      case 'alta':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUnlockLead = async (serviceRequestId: string) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para desbloquear leads.",
        variant: "destructive",
      });
      return;
    }

    if (!credits || credits.balance < 1) {
      toast({
        title: "Créditos insuficientes",
        description: "Você precisa de pelo menos 1 crédito para desbloquear um lead.",
        variant: "destructive",
      });
      return;
    }

    console.log('Attempting to unlock lead:', serviceRequestId);
    
    try {
      await spendCredits({ serviceRequestId, amount: 1 });
      console.log('Lead unlocked successfully, refreshing list');
      refetch(); // Refresh the leads list
    } catch (error) {
      console.error('Error unlocking lead:', error);
      // Error is handled by the spendCredits function
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <Input
                placeholder="Buscar por título, descrição ou cidade..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as categorias</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {!filteredLeads || filteredLeads.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Eye className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum lead disponível</h3>
              <p className="text-muted-foreground">
                No momento não há leads disponíveis que correspondam aos seus filtros.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredLeads.map((lead) => {
            const isUnlocked = lead.isUnlocked;
            
            return (
              <Card key={lead.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{lead.title}</h3>
                        {lead.urgency && (
                          <Badge variant="outline" className={getUrgencyColor(lead.urgency)}>
                            {lead.urgency}
                          </Badge>
                        )}
                        {!isUnlocked && (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800">
                            <Lock className="h-3 w-3 mr-1" />
                            Bloqueado
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-muted-foreground mb-3 line-clamp-2">
                        {lead.description}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {lead.city}, {lead.state}
                        </div>
                        
                        {(lead.budget_min || lead.budget_max) && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {lead.budget_min && lead.budget_max 
                              ? `R$ ${lead.budget_min?.toLocaleString()} - R$ ${lead.budget_max?.toLocaleString()}`
                              : lead.budget_min 
                              ? `A partir de R$ ${lead.budget_min?.toLocaleString()}`
                              : `Até R$ ${lead.budget_max?.toLocaleString()}`
                            }
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(lead.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </div>

                        {lead.service_categories && (
                          <div className="flex items-center gap-1">
                            <Badge variant="secondary">
                              {lead.service_categories.name}
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Contact info - only shown if unlocked */}
                      {isUnlocked && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <h4 className="font-semibold text-green-800 mb-2">Dados de Contato:</h4>
                          <div className="space-y-1 text-sm">
                            {lead.contact_email && (
                              <p><strong>Email:</strong> {lead.contact_email}</p>
                            )}
                            {lead.contact_phone && (
                              <p><strong>Telefone:</strong> {lead.contact_phone}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      {!isUnlocked ? (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleUnlockLead(lead.id)}
                          disabled={isSpending || !credits || credits.balance < 1}
                        >
                          <Lock className="h-4 w-4 mr-2" />
                          Desbloquear (1 crédito)
                        </Button>
                      ) : (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          <Eye className="h-3 w-3 mr-1" />
                          Desbloqueado
                        </Badge>
                      )}
                    </div>
                  </div>

                  {lead.expires_at && (
                    <div className="text-xs text-muted-foreground">
                      Expira em: {format(new Date(lead.expires_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};