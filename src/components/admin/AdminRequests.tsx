import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardList, Calendar, MapPin, Search, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  budget_min: number | null;
  budget_max: number | null;
  city: string;
  state: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  urgency: string | null;
  created_at: string;
  expires_at: string | null;
  client_id: string;
  category_id: string;
  contact_email: string | null;
  contact_phone: string | null;
  // Join fields
  client_name?: string;
  category_name?: string;
}

const AdminRequests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const { data: requests, isLoading } = useQuery({
    queryKey: ['admin-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_requests')
        .select(`
          *,
          client:profiles!service_requests_client_id_fkey(name),
          category:service_categories(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(request => ({
        ...request,
        client_name: request.client?.name || 'Cliente não encontrado',
        category_name: request.category?.name || 'Categoria não encontrada'
      })) as ServiceRequest[];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['service-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const filteredRequests = requests?.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || request.category_id === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  }) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Ativo</Badge>;
      case 'paused':
        return <Badge variant="secondary">Pausado</Badge>;
      case 'completed':
        return <Badge variant="outline">Concluído</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUrgencyBadge = (urgency: string | null) => {
    if (!urgency) return null;
    
    switch (urgency.toLowerCase()) {
      case 'baixa':
        return <Badge variant="outline">Baixa</Badge>;
      case 'média':
        return <Badge variant="secondary">Média</Badge>;
      case 'alta':
        return <Badge variant="destructive">Alta</Badge>;
      default:
        return <Badge variant="outline">{urgency}</Badge>;
    }
  };

  const stats = {
    total: requests?.length || 0,
    active: requests?.filter(r => r.status === 'active').length || 0,
    paused: requests?.filter(r => r.status === 'paused').length || 0,
    completed: requests?.filter(r => r.status === 'completed').length || 0,
    cancelled: requests?.filter(r => r.status === 'cancelled').length || 0,
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Solicitações de Serviço</h1>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Solicitações de Serviço</h1>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-muted-foreground">Ativos</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.paused}</div>
              <div className="text-sm text-muted-foreground">Pausados</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
              <div className="text-sm text-muted-foreground">Concluídos</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
              <div className="text-sm text-muted-foreground">Cancelados</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por título, descrição, cliente ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="paused">Pausado</SelectItem>
            <SelectItem value="completed">Concluído</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories?.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Requests List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRequests.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-2">{request.title}</CardTitle>
                <div className="flex flex-col gap-1">
                  {getStatusBadge(request.status)}
                  {getUrgencyBadge(request.urgency)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground line-clamp-3">{request.description}</p>
                
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <ClipboardList className="w-3 h-3" />
                    Cliente:
                  </span>
                  <span className="font-medium">{request.client_name}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Categoria:</span>
                  <span className="font-medium">{request.category_name}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Local:
                  </span>
                  <span className="font-medium">{request.city}, {request.state}</span>
                </div>
                
                {(request.budget_min || request.budget_max) && (
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      Orçamento:
                    </span>
                    <span className="font-medium">
                      {request.budget_min && request.budget_max
                        ? `R$ ${request.budget_min} - R$ ${request.budget_max}`
                        : request.budget_min
                        ? `A partir de R$ ${request.budget_min}`
                        : request.budget_max
                        ? `Até R$ ${request.budget_max}`
                        : 'A negociar'}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Criado:
                  </span>
                  <span className="font-medium">
                    {format(new Date(request.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </span>
                </div>
                
                {request.expires_at && (
                  <div className="flex justify-between">
                    <span>Expira:</span>
                    <span className="font-medium">
                      {format(new Date(request.expires_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </div>
                )}

                {(request.contact_email || request.contact_phone) && (
                  <div className="mt-2 p-2 bg-muted rounded text-xs">
                    <span className="font-medium">Contato:</span>
                    {request.contact_email && <p>Email: {request.contact_email}</p>}
                    {request.contact_phone && <p>Telefone: {request.contact_phone}</p>}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nenhuma solicitação encontrada com os filtros aplicados.</p>
        </div>
      )}
    </div>
  );
};

export default AdminRequests;