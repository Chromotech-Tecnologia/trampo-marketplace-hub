import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserCheck, Shield, Search } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface User {
  id: string;
  user_id: string;
  name: string;
  user_type: 'client' | 'provider' | 'admin';
  phone: string | null;
  company_name: string | null;
  description: string | null;
  city: string | null;
  state: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as User[];
    },
  });

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone?.includes(searchTerm);
    
    const matchesType = filterType === 'all' || user.user_type === filterType;
    
    return matchesSearch && matchesType;
  }) || [];

  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case 'client':
        return <Users className="w-4 h-4" />;
      case 'provider':
        return <UserCheck className="w-4 h-4" />;
      case 'admin':
        return <Shield className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getUserTypeBadge = (type: string) => {
    switch (type) {
      case 'client':
        return <Badge variant="default">Cliente</Badge>;
      case 'provider':
        return <Badge variant="secondary">Fornecedor</Badge>;
      case 'admin':
        return <Badge variant="destructive">Admin</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const stats = {
    total: users?.length || 0,
    clients: users?.filter(u => u.user_type === 'client').length || 0,
    providers: users?.filter(u => u.user_type === 'provider').length || 0,
    admins: users?.filter(u => u.user_type === 'admin').length || 0,
    active: users?.filter(u => u.is_active).length || 0,
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Gerenciar Usuários</h1>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gerenciar Usuários</h1>
      
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
              <div className="text-2xl font-bold text-blue-600">{stats.clients}</div>
              <div className="text-sm text-muted-foreground">Clientes</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.providers}</div>
              <div className="text-sm text-muted-foreground">Fornecedores</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.admins}</div>
              <div className="text-sm text-muted-foreground">Admins</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{stats.active}</div>
              <div className="text-sm text-muted-foreground">Ativos</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por nome, empresa ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os usuários</SelectItem>
            <SelectItem value="client">Clientes</SelectItem>
            <SelectItem value="provider">Fornecedores</SelectItem>
            <SelectItem value="admin">Administradores</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {getUserTypeIcon(user.user_type)}
                  <CardTitle className="text-lg">{user.name}</CardTitle>
                </div>
                <div className="flex gap-2">
                  {getUserTypeBadge(user.user_type)}
                  <Badge variant={user.is_active ? 'default' : 'secondary'}>
                    {user.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {user.company_name && (
                  <div className="flex justify-between">
                    <span>Empresa:</span>
                    <span className="font-medium">{user.company_name}</span>
                  </div>
                )}
                {user.phone && (
                  <div className="flex justify-between">
                    <span>Telefone:</span>
                    <span className="font-medium">{user.phone}</span>
                  </div>
                )}
                {user.city && user.state && (
                  <div className="flex justify-between">
                    <span>Localização:</span>
                    <span className="font-medium">{user.city}, {user.state}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Cadastro:</span>
                  <span className="font-medium">
                    {format(new Date(user.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </span>
                </div>
                {user.description && (
                  <div className="mt-2 p-2 bg-muted rounded text-xs">
                    <span className="font-medium">Descrição:</span>
                    <p className="mt-1">{user.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nenhum usuário encontrado com os filtros aplicados.</p>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;