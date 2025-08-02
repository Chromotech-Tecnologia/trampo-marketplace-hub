import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, ClipboardList, TrendingUp, Coins, UserCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const AdminStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_stats');
      if (error) throw error;
      return data[0];
    },
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard Administrativo</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard Administrativo</h1>
        <p>Erro ao carregar estatísticas.</p>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total de Clientes",
      value: stats.total_clients,
      icon: Users,
      description: "Usuários cadastrados como clientes",
      color: "text-blue-600",
    },
    {
      title: "Total de Fornecedores",
      value: stats.total_providers,
      icon: UserCheck,
      description: "Usuários cadastrados como fornecedores",
      color: "text-green-600",
    },
    {
      title: "Solicitações de Serviço",
      value: stats.total_requests,
      icon: ClipboardList,
      description: "Total de solicitações criadas",
      color: "text-orange-600",
    },
    {
      title: "Créditos Comprados",
      value: stats.total_credits_purchased,
      icon: CreditCard,
      description: "Total de créditos adquiridos",
      color: "text-purple-600",
    },
    {
      title: "Créditos Utilizados",
      value: stats.total_credits_used,
      icon: Coins,
      description: "Total de créditos gastos",
      color: "text-red-600",
    },
    {
      title: "Créditos Disponíveis",
      value: stats.total_credits_available,
      icon: TrendingUp,
      description: "Créditos em carteira",
      color: "text-emerald-600",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard Administrativo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminStats;