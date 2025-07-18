import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLeads } from '@/hooks/useLeads';
import { useCredits } from '@/hooks/useCredits';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Unlock, Lock, MapPin, DollarSign, Calendar, Phone, Mail, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const LeadsList = () => {
  const [cityFilter, setCityFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const { leads, isLoading, isLeadUnlocked, getUnlockedLeadData } = useLeads({
    city: cityFilter || undefined,
    state: stateFilter || undefined,
    category_id: categoryFilter || undefined,
  });

  const { credits, spendCredits, isSpending } = useCredits();

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

  const handleUnlockLead = (serviceRequestId: string) => {
    if (!credits || credits.balance < 1) {
      alert('Você não possui créditos suficientes. Compre mais créditos para desbloquear leads.');
      return;
    }

    if (confirm('Deseja gastar 1 crédito para desbloquear este lead?')) {
      spendCredits({ serviceRequestId, amount: 1 });
    }
  };

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
          <CardTitle>Filtros de Leads</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cidade</label>
              <Input
                placeholder="Digite a cidade..."
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Input
                placeholder="Digite o estado..."
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
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

      {/* Credits Balance */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-yellow-600">
                {credits?.balance || 0} créditos disponíveis
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Cada lead custa 1 crédito para desbloquear
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Leads List */}
      <div className="space-y-4">
        {leads.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Nenhum lead encontrado com os filtros aplicados.</p>
            </CardContent>
          </Card>
        ) : (
          leads.map((lead) => {
            const isUnlocked = isLeadUnlocked(lead.id);
            const unlockedData = getUnlockedLeadData(lead.id);
            
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
                        {isUnlocked ? (
                          <Badge className="bg-green-100 text-green-800">
                            <Unlock className="h-3 w-3 mr-1" />
                            Desbloqueado
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <Lock className="h-3 w-3 mr-1" />
                            Bloqueado
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-muted-foreground mb-3">
                        {isUnlocked 
                          ? lead.description 
                          : `${lead.description.substring(0, 100)}${lead.description.length > 100 ? '...' : ''}`
                        }
                      </p>

                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {lead.city}, {lead.state}
                          </div>
                          
                          {(lead.budget_min || lead.budget_max) && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              R$ {lead.budget_min?.toLocaleString()} - R$ {lead.budget_max?.toLocaleString()}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(lead.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                          </div>

                          {lead.service_categories && (
                            <Badge variant="secondary">
                              {lead.service_categories.name}
                            </Badge>
                          )}
                        </div>

                        {/* Contact Information (only visible when unlocked) */}
                        {isUnlocked && unlockedData && (
                          <div className="bg-green-50 p-4 rounded-lg border border-green-200 mt-4">
                            <h4 className="font-semibold text-green-800 mb-2">Dados de Contato:</h4>
                            <div className="space-y-2 text-sm">
                              {unlockedData.contact_email && (
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-green-600" />
                                  <span>{unlockedData.contact_email}</span>
                                </div>
                              )}
                              {unlockedData.contact_phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-green-600" />
                                  <span>{unlockedData.contact_phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ml-4">
                      {!isUnlocked && (
                        <div className="text-center">
                          <Button
                            onClick={() => handleUnlockLead(lead.id)}
                            disabled={isSpending || !credits || credits.balance < 1}
                            className="mb-2"
                          >
                            <Unlock className="h-4 w-4 mr-2" />
                            {isSpending ? 'Desbloqueando...' : 'Desbloquear (1 crédito)'}
                          </Button>
                          
                          {(!credits || credits.balance < 1) && (
                            <div className="flex items-center gap-1 text-xs text-red-600">
                              <AlertTriangle className="h-3 w-3" />
                              Sem créditos
                            </div>
                          )}
                        </div>
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