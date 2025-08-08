import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, Eye, CheckCircle, TrendingUp, ExternalLink } from 'lucide-react';
import { useCredits } from '@/hooks/useCredits';
import { useLeads } from '@/hooks/useLeads';
import { LeadsList } from '@/components/LeadsList';
import { CreditManager } from '@/components/CreditManager';


const ProviderDashboard = () => {
  // Add error boundary for auth context
  let signOut = () => {};
  let user = null;
  
  try {
    const auth = useAuth();
    signOut = auth.signOut;
    user = auth.user;
  } catch (error) {
    console.error('Auth context not available in ProviderDashboard:', error);
  }
  
  // Fetch real data from the database
  const { credits, isLoadingCredits, purchaseCredits } = useCredits();
  const { leads, isLoading: isLoadingLeads } = useLeads();
  const availableLeads = leads.filter(lead => !lead.isUnlocked);
  const unlockedLeads = leads.filter(lead => lead.isUnlocked);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <img 
                src="/lovable-uploads/6c522438-4426-4558-834c-931bef48b71f.png" 
                alt="Mais Trampo" 
                className="h-8 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Área do Fornecedor</h1>
                <p className="text-muted-foreground">Bem-vindo, {user?.user_metadata?.name || user?.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                onClick={() => window.open('/', '_blank')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Ir para Home
              </Button>
              <Button variant="outline" onClick={signOut}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Créditos Disponíveis</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{credits?.balance || 0}</div>
              <p className="text-xs text-muted-foreground">Para desbloquear leads</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads Disponíveis</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{availableLeads.length}</div>
              <p className="text-xs text-muted-foreground">Disponíveis agora</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads Desbloqueados</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unlockedLeads.length}</div>
              <p className="text-xs text-muted-foreground">Este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0%</div>
              <p className="text-xs text-muted-foreground">Leads → Contratos</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Leads Disponíveis</CardTitle>
              <CardDescription>
                Visualize e desbloqueie leads de clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingLeads ? (
                <div className="text-center py-8">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 mx-auto"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                  </div>
                </div>
              ) : leads.length === 0 ? (
                <div className="text-center py-8">
                  <Eye className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold text-foreground">Nenhum lead disponível</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Não há leads disponíveis no momento.
                  </p>
                </div>
              ) : (
                <LeadsList />
              )}
            </CardContent>
          </Card>

          <CreditManager />
        </div>
      </main>
    </div>
  );
};

export default ProviderDashboard;