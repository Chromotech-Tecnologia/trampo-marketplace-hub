import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useServiceRequests } from '@/hooks/useServiceRequests';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileText, Users, MessageSquare, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ServiceRequestList } from '@/components/ServiceRequestList';

const ClientDashboard = () => {
  // Add error boundary for auth context
  let signOut = () => {};
  let user = null;
  
  try {
    const auth = useAuth();
    signOut = auth.signOut;
    user = auth.user;
  } catch (error) {
    console.error('Auth context not available in ClientDashboard:', error);
  }
  
  const { requests } = useServiceRequests();
  const navigate = useNavigate();

  const activeRequests = requests.filter(req => req.status === 'active');
  const completedRequests = requests.filter(req => req.status === 'completed');

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Área do Cliente</h1>
              <p className="text-muted-foreground">Bem-vindo, {user?.user_metadata?.name || user?.email}</p>
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
              <CardTitle className="text-sm font-medium">Solicitações Ativas</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeRequests.length}</div>
              <p className="text-xs text-muted-foreground">Aguardando propostas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Propostas Recebidas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Aguardando análise</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Serviços Concluídos</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedRequests.length}</div>
              <p className="text-xs text-muted-foreground">Histórico total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nova Solicitação</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => navigate('/nova-solicitacao')}
              >
                Criar Solicitação
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Minhas Solicitações</CardTitle>
              <CardDescription>
                Acompanhe o status das suas solicitações de serviço
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ServiceRequestList />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Propostas Recebidas</CardTitle>
              <CardDescription>
                Analise as propostas dos fornecedores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold text-foreground">Nenhuma proposta</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Você ainda não recebeu propostas para suas solicitações.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;