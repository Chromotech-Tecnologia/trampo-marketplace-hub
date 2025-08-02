import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, TrendingUp, TrendingDown, BarChart3, Users } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FinancialData {
  total_revenue: number;
  total_transactions: number;
  avg_transaction_value: number;
  top_providers: Array<{
    provider_name: string;
    total_spent: number;
    total_credits: number;
  }>;
  monthly_revenue: Array<{
    month: string;
    revenue: number;
    transactions: number;
  }>;
}

interface Transaction {
  id: string;
  provider_id: string;
  amount: number;
  transaction_type: string;
  description: string | null;
  created_at: string;
  provider_name?: string;
}

const AdminFinancials = () => {
  const [dateFilter, setDateFilter] = useState('last_30_days');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const getDateRange = () => {
    const now = new Date();
    switch (dateFilter) {
      case 'last_7_days':
        return { start: subDays(now, 7), end: now };
      case 'last_30_days':
        return { start: subDays(now, 30), end: now };
      case 'this_month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'this_year':
        return { start: startOfYear(now), end: endOfYear(now) };
      case 'custom':
        return { 
          start: startDate ? new Date(startDate) : subDays(now, 30), 
          end: endDate ? new Date(endDate) : now 
        };
      default:
        return { start: subDays(now, 30), end: now };
    }
  };

  const { start: dateStart, end: dateEnd } = getDateRange();

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['admin-transactions', dateStart, dateEnd],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select(`
          *,
          provider:profiles!credit_transactions_provider_id_fkey(name)
        `)
        .gte('created_at', dateStart.toISOString())
        .lte('created_at', dateEnd.toISOString())
        .eq('transaction_type', 'purchase')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(transaction => ({
        ...transaction,
        provider_name: 'Fornecedor'
      })) as Transaction[];
    },
  });

  const { data: purchases, isLoading: isLoadingPurchases } = useQuery({
    queryKey: ['admin-financial-purchases', dateStart, dateEnd],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('credit_purchases')
        .select('*')
        .gte('created_at', dateStart.toISOString())
        .lte('created_at', dateEnd.toISOString())
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Calculate financial metrics
  const totalRevenue = purchases?.reduce((sum, purchase) => sum + purchase.amount, 0) || 0;
  const totalTransactions = purchases?.length || 0;
  const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  // Top providers by spending
  const providerStats = purchases?.reduce((acc, purchase) => {
    const providerId = purchase.provider_id;
    if (!acc[providerId]) {
      acc[providerId] = {
        provider_name: 'Fornecedor',
        total_spent: 0,
        total_credits: 0,
        transactions: 0
      };
    }
    acc[providerId].total_spent += purchase.amount;
    acc[providerId].total_credits += purchase.credits_amount;
    acc[providerId].transactions += 1;
    return acc;
  }, {} as Record<string, any>) || {};

  const topProviders = Object.values(providerStats)
    .sort((a: any, b: any) => b.total_spent - a.total_spent)
    .slice(0, 10);

  // Monthly revenue (for the chart-like display)
  const monthlyStats = purchases?.reduce((acc, purchase) => {
    const month = format(new Date(purchase.created_at), 'yyyy-MM');
    if (!acc[month]) {
      acc[month] = { revenue: 0, transactions: 0 };
    }
    acc[month].revenue += purchase.amount;
    acc[month].transactions += 1;
    return acc;
  }, {} as Record<string, { revenue: number; transactions: number }>) || {};

  const isLoading = isLoadingTransactions || isLoadingPurchases;

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Relatório Financeiro</h1>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Relatório Financeiro</h1>
      
      {/* Date Filters */}
      <div className="flex gap-4 mb-6">
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last_7_days">Últimos 7 dias</SelectItem>
            <SelectItem value="last_30_days">Últimos 30 dias</SelectItem>
            <SelectItem value="this_month">Este mês</SelectItem>
            <SelectItem value="this_year">Este ano</SelectItem>
            <SelectItem value="custom">Período personalizado</SelectItem>
          </SelectContent>
        </Select>
        
        {dateFilter === 'custom' && (
          <>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-48"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-48"
            />
          </>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Período: {format(dateStart, 'dd/MM', { locale: ptBR })} - {format(dateEnd, 'dd/MM', { locale: ptBR })}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Transações</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Compras aprovadas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {avgTransactionValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Por transação
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fornecedores Ativos</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(providerStats).length}</div>
            <p className="text-xs text-muted-foreground">
              Com compras no período
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Providers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Fornecedores por Gasto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProviders.map((provider: any, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-muted rounded">
                  <div>
                    <div className="font-medium">{provider.provider_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {provider.transactions} transações • {provider.total_credits} créditos
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">R$ {provider.total_spent.toFixed(2)}</div>
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(monthlyStats)
                .sort(([a], [b]) => b.localeCompare(a))
                .slice(0, 6)
                .map(([month, stats]) => (
                <div key={month} className="flex justify-between items-center p-3 bg-muted rounded">
                  <div>
                    <div className="font-medium">
                      {format(new Date(`${month}-01`), 'MMMM yyyy', { locale: ptBR })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stats.transactions} transações
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">R$ {stats.revenue.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">
                      R$ {(stats.revenue / stats.transactions).toFixed(2)} / transação
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {purchases?.slice(0, 10).map((purchase) => (
              <div key={purchase.id} className="flex justify-between items-center p-3 bg-muted rounded">
                <div>
                  <div className="font-medium">Fornecedor</div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(purchase.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">R$ {purchase.amount.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">
                    {purchase.credits_amount} créditos
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFinancials;