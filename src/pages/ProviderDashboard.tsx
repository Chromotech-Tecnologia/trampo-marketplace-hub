import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Coins, Eye, CheckCircle, TrendingUp, ExternalLink, CreditCard, History, ShoppingCart, Filter } from 'lucide-react';
import { useCredits } from '@/hooks/useCredits';
import { useLeads } from '@/hooks/useLeads';
import { useCreditPlans } from '@/hooks/useCreditPlans';
import { LeadsList } from '@/components/LeadsList';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { usePurchases } from '@/hooks/usePurchases';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatBRL } from '@/lib/utils';
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
  const { credits, transactions, isLoadingCredits, purchaseCredits, isPurchasing, spendCredits } = useCredits();
  const { leads, isLoading: isLoadingLeads } = useLeads();
  const { data: creditPlans, isLoading: isLoadingPlans } = useCreditPlans();
  const { pendingPurchase, isLoadingPending, createPurchase, isCreating } = usePurchases();
  const [leadFilter, setLeadFilter] = useState<'all' | 'unlocked'>('all');
  const [showPlansModal, setShowPlansModal] = useState(false);
  
  const availableLeads = leads.filter(lead => !lead.isUnlocked);
  const unlockedLeads = leads.filter(lead => lead.isUnlocked);
  const filteredLeads = leadFilter === 'all' ? leads : unlockedLeads;

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
            <div className="flex items-center gap-4">
              {/* Credit Balance */}
              <Card className="bg-primary/10 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Saldo de Créditos</p>
                      <p className="text-2xl font-bold text-primary">{credits?.balance || 0}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setShowPlansModal(true)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Comprar
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <History className="h-4 w-4 mr-2" />
                      Histórico
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Histórico de Transações</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      {transactions?.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          Nenhuma transação encontrada.
                        </p>
                      ) : (
                        transactions?.map((transaction) => (
                          <div 
                            key={transaction.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${
                                transaction.transaction_type === 'purchase' 
                                  ? 'bg-green-500' 
                                  : 'bg-red-500'
                              }`} />
                              <div>
                                <p className="font-medium">
                                  {transaction.transaction_type === 'purchase' 
                                    ? `+${transaction.amount} créditos` 
                                    : `-${transaction.amount} créditos`
                                  }
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {transaction.description || 
                                    (transaction.transaction_type === 'purchase' 
                                      ? 'Compra de créditos' 
                                      : 'Lead desbloqueado'
                                    )
                                  }
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(transaction.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  variant="ghost" 
                  onClick={() => window.open('/', '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Home
                </Button>
                <Button variant="outline" onClick={signOut}>
                  Sair
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {pendingPurchase && (
          <div className="mb-6">
            <Alert>
              <AlertTitle>Compra pendente em análise</AlertTitle>
              <AlertDescription>
                Você possui uma compra de {pendingPurchase.credits_amount} créditos aguardando aprovação. 
                Método: {(pendingPurchase as any).payment_method?.toUpperCase() || 'PIX'}.
              </AlertDescription>
            </Alert>
          </div>
        )}
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
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Leads Disponíveis</CardTitle>
                  <CardDescription>
                    Visualize e desbloqueie leads de clientes
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <Tabs value={leadFilter} onValueChange={(value) => setLeadFilter(value as 'all' | 'unlocked')}>
                    <TabsList>
                      <TabsTrigger value="all">Todos ({leads.length})</TabsTrigger>
                      <TabsTrigger value="unlocked">Meus Leads ({unlockedLeads.length})</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingLeads ? (
                <div className="text-center py-8">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 mx-auto"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                  </div>
                </div>
              ) : filteredLeads.length === 0 ? (
                <div className="text-center py-8">
                  <Eye className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold text-foreground">
                    {leadFilter === 'all' ? 'Nenhum lead disponível' : 'Nenhum lead desbloqueado'}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {leadFilter === 'all' 
                      ? 'Não há leads disponíveis no momento.' 
                      : 'Você ainda não desbloqueou nenhum lead.'
                    }
                  </p>
                </div>
              ) : (
                <LeadsList onShowPlansModal={() => setShowPlansModal(true)} />
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Plans Modal */}
      <Dialog open={showPlansModal} onOpenChange={setShowPlansModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Comprar Créditos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {isLoadingPlans ? (
              <div className="text-center py-8">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 mx-auto"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              </div>
            ) : !creditPlans || creditPlans.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum plano de créditos disponível no momento.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {creditPlans.map((plan, index) => (
                  <Card 
                    key={plan.id} 
                    className={`relative ${index === 1 ? 'ring-2 ring-primary' : ''}`}
                  >
                    {index === 1 && (
                      <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        Mais Popular
                      </Badge>
                    )}
                    <CardContent className="p-6 text-center">
                      <h3 className="font-semibold text-lg mb-2">{plan.name}</h3>
                      <div className="text-3xl font-bold text-primary mb-2">
                        {plan.credits_amount}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">créditos</p>
                      <div className="text-xl font-semibold mb-3">
                        {formatBRL(Number(plan.price))}
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {plan.description}
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">
                        {formatBRL(Number(plan.price) / plan.credits_amount)} por crédito
                      </p>
                      <Button
                        onClick={() => createPurchase({ plan })}
                        disabled={isCreating || !!pendingPurchase}
                        className="w-full"
                        variant={index === 1 ? 'default' : 'outline'}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        {pendingPurchase ? 'Compra pendente' : isCreating ? 'Processando...' : 'Comprar'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProviderDashboard;