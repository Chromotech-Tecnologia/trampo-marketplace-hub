import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatBRL } from '@/lib/utils';

interface Purchase {
  id: string;
  provider_id: string;
  plan_id: string;
  amount: number;
  credits_amount: number;
  status: string;
  payment_reference: string | null;
  admin_notes: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  // Buyer details
  buyer_name?: string | null;
  buyer_email?: string | null;
  buyer_phone?: string | null;
  buyer_cpf?: string | null;
  // Join fields
  provider_name?: string;
  plan_name?: string;
}

const AdminPurchases = () => {
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerCpf, setBuyerCpf] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updatePurchaseMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase.from('credit_purchases').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-purchases'] });
      toast({ title: 'Alterações salvas.' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao salvar alterações', description: error.message, variant: 'destructive' });
    },
  });

  const { data: purchases, isLoading } = useQuery({
    queryKey: ['admin-purchases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('credit_purchases')
        .select(`
          *,
          plan:credit_plans(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(purchase => ({
        ...purchase,
        plan_name: purchase.plan?.name || 'Plano não encontrado',
        provider_name: purchase.buyer_name || 'Fornecedor'
      })) as Purchase[];
    },
  });

  const approvePurchaseMutation = useMutation({
    mutationFn: async ({ purchaseId, notes, approved }: { purchaseId: string; notes: string; approved: boolean }) => {
      const { error } = await supabase
        .from('credit_purchases')
        .update({
          status: approved ? 'approved' : 'rejected',
          admin_notes: notes,
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', purchaseId);
      
      if (error) throw error;

      // If approved, update provider credits
      if (approved) {
        const purchase = purchases?.find(p => p.id === purchaseId);
        if (purchase) {
          // Update credits balance
          {
            // If RPC doesn't exist, use direct update
            const { data: currentCredits } = await supabase
              .from('credits')
              .select('balance, total_purchased')
              .eq('provider_id', purchase.provider_id)
              .single();
            
            if (currentCredits) {
              await supabase
                .from('credits')
                .update({
                  balance: currentCredits.balance + purchase.credits_amount,
                  total_purchased: currentCredits.total_purchased + purchase.credits_amount
                })
                .eq('provider_id', purchase.provider_id);
            }
          }

          // Create credit transaction
          await supabase
            .from('credit_transactions')
            .insert({
              provider_id: purchase.provider_id,
              amount: purchase.credits_amount,
              transaction_type: 'purchase',
              description: `Compra de ${purchase.credits_amount} créditos - ${purchase.plan_name}`
            });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-purchases'] });
      toast({ title: "Compra processada com sucesso!" });
      setSelectedPurchase(null);
      setAdminNotes('');
    },
    onError: (error) => {
      toast({ 
        title: "Erro ao processar compra", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleApprove = (approved: boolean) => {
    if (!selectedPurchase) return;
    
    approvePurchaseMutation.mutate({
      purchaseId: selectedPurchase.id,
      notes: adminNotes,
      approved
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case 'approved':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingPurchases = purchases?.filter(p => p.status === 'pending') || [];
  const processedPurchases = purchases?.filter(p => p.status !== 'pending') || [];

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Compras Pendentes</h1>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gerenciar Compras</h1>
      
      {pendingPurchases.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-orange-600">
            Compras Pendentes ({pendingPurchases.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingPurchases.map((purchase) => (
              <Card key={purchase.id} className="border-orange-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-sm">{purchase.provider_name}</CardTitle>
                    {getStatusBadge(purchase.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Plano:</span>
                      <span className="font-medium">{purchase.plan_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Valor:</span>
                      <span className="font-medium">R$ {purchase.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Créditos:</span>
                      <span className="font-medium">{purchase.credits_amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Data:</span>
                      <span className="font-medium">
                        {format(new Date(purchase.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    </div>
                    {purchase.payment_reference && (
                      <div className="flex justify-between">
                        <span>Ref. Pagamento:</span>
                        <span className="font-medium text-xs">{purchase.payment_reference}</span>
                      </div>
                    )}
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        className="w-full mt-4" 
                        onClick={() => {
                          setSelectedPurchase(purchase);
                          setAdminNotes(purchase.admin_notes || '');
                          setBuyerName(purchase.buyer_name || '');
                          setBuyerEmail(purchase.buyer_email || '');
                          setBuyerPhone(purchase.buyer_phone || '');
                          setBuyerCpf(purchase.buyer_cpf || '');
                        }}
                      >
                        <Eye className="w-3 h-3 mr-2" />
                        Analisar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Analisar Compra</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Fornecedor:</span>
                            <p>{purchase.provider_name}</p>
                          </div>
                          <div>
                            <span className="font-medium">Plano:</span>
                            <p>{purchase.plan_name}</p>
                          </div>
                          <div>
                            <span className="font-medium">Valor:</span>
                            <p>R$ {purchase.amount.toFixed(2)}</p>
                          </div>
                          <div>
                            <span className="font-medium">Créditos:</span>
                            <p>{purchase.credits_amount}</p>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Dados do comprador</label>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs mb-1">Nome</label>
                              <Input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} />
                            </div>
                            <div>
                              <label className="block text-xs mb-1">Email</label>
                              <Input value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} />
                            </div>
                            <div>
                              <label className="block text-xs mb-1">Telefone</label>
                              <Input value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} />
                            </div>
                            <div>
                              <label className="block text-xs mb-1">CPF</label>
                              <Input value={buyerCpf} onChange={(e) => setBuyerCpf(e.target.value)} />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Observações do Administrador:
                          </label>
                          <Textarea
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            placeholder="Adicione observações sobre esta compra..."
                            rows={3}
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1" 
                            onClick={() => handleApprove(true)}
                            disabled={approvePurchaseMutation.isPending}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Aprovar
                          </Button>
                          <Button 
                            variant="destructive" 
                            className="flex-1" 
                            onClick={() => handleApprove(false)}
                            disabled={approvePurchaseMutation.isPending}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Rejeitar
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-4">
          Histórico de Compras ({processedPurchases.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {processedPurchases.map((purchase) => (
            <Card key={purchase.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-sm">{purchase.provider_name}</CardTitle>
                  {getStatusBadge(purchase.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Plano:</span>
                    <span className="font-medium">{purchase.plan_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valor:</span>
                    <span className="font-medium">R$ {purchase.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Créditos:</span>
                    <span className="font-medium">{purchase.credits_amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processado em:</span>
                    <span className="font-medium">
                      {purchase.approved_at && format(new Date(purchase.approved_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </div>
                  {purchase.admin_notes && (
                    <div className="mt-2 p-2 bg-muted rounded text-xs">
                      <span className="font-medium">Observações:</span>
                      <p>{purchase.admin_notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPurchases;