import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useCredits } from '@/hooks/useCredits';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, Eye, CheckCircle, TrendingUp } from 'lucide-react';
import { LeadsList } from '@/components/LeadsList';

const ProviderDashboard = () => {
  const { signOut } = useAuth();
  const { data: profile } = useProfile();
  const { credits } = useCredits();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Área do Fornecedor</h1>
              <p className="text-muted-foreground">Bem-vindo, {profile?.name}</p>
            </div>
            <Button variant="outline" onClick={signOut}>
              Sair
            </Button>
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
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Novos hoje</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads Desbloqueados</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
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
          <LeadsList />

          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Créditos</CardTitle>
              <CardDescription>
                Compre créditos para desbloquear leads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">1 Crédito</h4>
                    <p className="text-sm text-muted-foreground">Desbloqueio de 1 lead</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">R$ 5,00</p>
                    <Button size="sm">Comprar</Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Pacote 10 Créditos</h4>
                    <p className="text-sm text-muted-foreground">Desbloqueio de 10 leads</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">R$ 45,00</p>
                    <p className="text-xs text-green-600">Economize 10%</p>
                    <Button size="sm">Comprar</Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Pacote 50 Créditos</h4>
                    <p className="text-sm text-muted-foreground">Desbloqueio de 50 leads</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">R$ 200,00</p>
                    <p className="text-xs text-green-600">Economize 20%</p>
                    <Button size="sm">Comprar</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ProviderDashboard;