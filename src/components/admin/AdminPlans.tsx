import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit2, Trash2, Package, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface CreditPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  credits_amount: number;
  plan_type: string;
  recurrence: string | null;
  payment_link: string | null;
  is_active: boolean;
  created_at: string;
}

const AdminPlans = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<CreditPlan | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    credits_amount: '',
    plan_type: 'package',
    recurrence: '',
    payment_link: '',
  });

  const { data: plans, isLoading } = useQuery({
    queryKey: ['credit-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('credit_plans')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as CreditPlan[];
    },
  });

  const createPlanMutation = useMutation({
    mutationFn: async (planData: any) => {
      const { error } = await supabase
        .from('credit_plans')
        .insert([planData]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-plans'] });
      toast({ title: "Plano criado com sucesso!" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ 
        title: "Erro ao criar plano", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, ...planData }: any) => {
      const { error } = await supabase
        .from('credit_plans')
        .update(planData)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-plans'] });
      toast({ title: "Plano atualizado com sucesso!" });
      setIsDialogOpen(false);
      setEditingPlan(null);
      resetForm();
    },
    onError: (error) => {
      toast({ 
        title: "Erro ao atualizar plano", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { error } = await supabase
        .from('credit_plans')
        .delete()
        .eq('id', planId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-plans'] });
      toast({ title: "Plano excluído com sucesso!" });
    },
    onError: (error) => {
      toast({ 
        title: "Erro ao excluir plano", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      credits_amount: '',
      plan_type: 'package',
      recurrence: '',
      payment_link: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const planData = {
      ...formData,
      price: parseFloat(formData.price),
      credits_amount: parseInt(formData.credits_amount),
      recurrence: formData.plan_type === 'cycle' ? formData.recurrence : null,
    };

    if (editingPlan) {
      updatePlanMutation.mutate({ id: editingPlan.id, ...planData });
    } else {
      createPlanMutation.mutate(planData);
    }
  };

  const handleEdit = (plan: CreditPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || '',
      price: plan.price.toString(),
      credits_amount: plan.credits_amount.toString(),
      plan_type: plan.plan_type,
      recurrence: plan.recurrence || '',
      payment_link: plan.payment_link || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (planId: string) => {
    if (confirm('Tem certeza que deseja excluir este plano?')) {
      deletePlanMutation.mutate(planId);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciar Planos</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingPlan(null); }}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Plano
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? 'Editar Plano' : 'Criar Novo Plano'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Plano</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="price">Valor (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="plan_type">Tipo de Plano</Label>
                <Select value={formData.plan_type} onValueChange={(value) => setFormData({ ...formData, plan_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="package">Pacote</SelectItem>
                    <SelectItem value="cycle">Ciclo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.plan_type === 'cycle' && (
                <div>
                  <Label htmlFor="recurrence">Recorrência</Label>
                  <Select value={formData.recurrence} onValueChange={(value) => setFormData({ ...formData, recurrence: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a recorrência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="quarterly">Trimestral</SelectItem>
                      <SelectItem value="semiannual">Semestral</SelectItem>
                      <SelectItem value="annual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div>
                <Label htmlFor="credits_amount">Quantidade de Créditos</Label>
                <Input
                  id="credits_amount"
                  type="number"
                  value={formData.credits_amount}
                  onChange={(e) => setFormData({ ...formData, credits_amount: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="payment_link">Link de Pagamento</Label>
                <Input
                  id="payment_link"
                  type="url"
                  value={formData.payment_link}
                  onChange={(e) => setFormData({ ...formData, payment_link: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingPlan ? 'Atualizar' : 'Criar'} Plano
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans?.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={plan.plan_type === 'package' ? 'default' : 'secondary'}>
                      {plan.plan_type === 'package' ? (
                        <>
                          <Package className="w-3 h-3 mr-1" />
                          Pacote
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 mr-1" />
                          Ciclo
                        </>
                      )}
                    </Badge>
                    <Badge variant={plan.is_active ? 'default' : 'destructive'}>
                      {plan.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(plan)}>
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(plan.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                <div className="flex justify-between">
                  <span className="text-sm">Preço:</span>
                  <span className="font-medium">R$ {plan.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Créditos:</span>
                  <span className="font-medium">{plan.credits_amount}</span>
                </div>
                {plan.recurrence && (
                  <div className="flex justify-between">
                    <span className="text-sm">Recorrência:</span>
                    <span className="font-medium capitalize">{plan.recurrence}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm">Valor por crédito:</span>
                  <span className="font-medium">R$ {(plan.price / plan.credits_amount).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminPlans;