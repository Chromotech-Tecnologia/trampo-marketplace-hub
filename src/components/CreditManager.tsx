import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCredits } from '@/hooks/useCredits';
import { Coins, CreditCard, History, Package } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const CreditManager = () => {
  const { credits, transactions, isLoadingCredits, purchaseCredits, isPurchasing } = useCredits();

  const creditPackages = [
    {
      id: 'basic',
      name: 'Pacote Básico',
      credits: 10,
      price: 29.99,
      description: 'Ideal para começar',
      popular: false,
    },
    {
      id: 'standard',
      name: 'Pacote Padrão',
      credits: 25,
      price: 69.99,
      description: 'Melhor custo-benefício',
      popular: true,
    },
    {
      id: 'premium',
      name: 'Pacote Premium',
      credits: 50,
      price: 129.99,
      description: 'Para profissionais',
      popular: false,
    },
  ];

  if (isLoadingCredits) {
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {creditPackages.map((pkg) => (
              <Card 
                key={pkg.id} 
                className={`relative ${pkg.popular ? 'ring-2 ring-primary' : ''}`}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    Mais Popular
                  </Badge>
                )}
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold text-lg mb-2">{pkg.name}</h3>
                  <div className="text-3xl font-bold text-primary mb-2">
                    {pkg.credits}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">créditos</p>
                  <div className="text-xl font-semibold mb-3">
                    R$ {pkg.price.toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {pkg.description}
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    R$ {(pkg.price / pkg.credits).toFixed(2)} por crédito
                  </p>
                  <Button
                    onClick={() => purchaseCredits(pkg.id as 'basic' | 'standard' | 'premium')}
                    disabled={isPurchasing}
                    className="w-full"
                    variant={pkg.popular ? 'default' : 'outline'}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {isPurchasing ? 'Processando...' : 'Comprar'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
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