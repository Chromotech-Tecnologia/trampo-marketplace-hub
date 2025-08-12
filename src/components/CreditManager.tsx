import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCredits } from '@/hooks/useCredits';
import { useCreditPlans } from '@/hooks/useCreditPlans';
import { Coins, CreditCard, History, Package } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { usePurchases } from '@/hooks/usePurchases';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatBRL } from '@/lib/utils';
export const CreditManager = () => {
  const { credits, transactions, isLoadingCredits, purchaseCredits, isPurchasing } = useCredits();
  const { data: creditPlans, isLoading: isLoadingPlans } = useCreditPlans();

  if (isLoadingCredits || isLoadingPlans) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-12 bg-gray-200 rounded w-1/2"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            Saldo Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-yellow-600">
                {credits?.balance || 0} créditos
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Total comprado: {credits?.total_purchased || 0} | Total usado: {credits?.total_used || 0}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Cada crédito = 1 lead desbloqueado</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Packages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Comprar Créditos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!creditPlans || creditPlans.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum plano de créditos disponível no momento.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      R$ {(Number(plan.price) / 100).toFixed(2)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {plan.description}
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      R$ {(Number(plan.price) / 100 / plan.credits_amount).toFixed(2)} por crédito
                    </p>
                    <Button
                      onClick={() => {
                        if (plan.payment_link) {
                          window.open(plan.payment_link, '_blank');
                        }
                      }}
                      disabled={isPurchasing || !plan.payment_link}
                      className="w-full"
                      variant={index === 1 ? 'default' : 'outline'}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      {isPurchasing ? 'Processando...' : 'Comprar'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Transações
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma transação encontrada.
            </p>
          ) : (
            <div className="space-y-3">
              {transactions?.map((transaction) => (
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};