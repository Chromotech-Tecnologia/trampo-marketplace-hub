import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useServiceRequests } from '@/hooks/useServiceRequests';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Edit, Trash2, Eye, Search, Calendar, MapPin, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Database } from '@/integrations/supabase/types';
import { EditServiceRequestDialog } from './EditServiceRequestDialog';

interface ServiceRequestListProps {
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
}

export const ServiceRequestList = ({ onEdit, onView }: ServiceRequestListProps) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [editingRequest, setEditingRequest] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { requests, isLoading, deleteRequest, updateStatus } = useServiceRequests({
    search,
    status: (statusFilter && statusFilter !== 'all' ? statusFilter : undefined) as Database['public']['Enums']['service_request_status'] | undefined,
    category_id: categoryFilter && categoryFilter !== 'all' ? categoryFilter : undefined,
  });

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'paused':
        return 'Pausado';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
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
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <Input
                placeholder="Buscar por título ou descrição..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="paused">Pausado</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
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
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Nenhuma solicitação encontrada.</p>
            </CardContent>
          </Card>
        ) : (
          requests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{request.title}</h3>
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusLabel(request.status)}
                      </Badge>
                      {request.urgency && (
                        <Badge variant="outline" className={getUrgencyColor(request.urgency)}>
                          {request.urgency}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-muted-foreground mb-3 line-clamp-2">
                      {request.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {request.city}, {request.state}
                      </div>
                      
                      {(request.budget_min || request.budget_max) && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          R$ {request.budget_min?.toLocaleString()} - R$ {request.budget_max?.toLocaleString()}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(request.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </div>

                      {request.service_categories && (
                        <div className="flex items-center gap-1">
                          <Badge variant="secondary">
                            {request.service_categories.name}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    {onView && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onView(request.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {request.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingRequest(request);
                          setIsEditDialogOpen(true);
                          onEdit?.(request.id);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}

                    {request.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateStatus({ id: request.id, status: 'paused' as Database['public']['Enums']['service_request_status'] })}
                      >
                        Pausar
                      </Button>
                    )}

                    {request.status === 'paused' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateStatus({ id: request.id, status: 'active' as Database['public']['Enums']['service_request_status'] })}
                      >
                        Reativar
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteRequest(request.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {request.expires_at && (
                  <div className="text-xs text-muted-foreground">
                    Expira em: {format(new Date(request.expires_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <EditServiceRequestDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        request={editingRequest}
      />
    </div>
  );
};