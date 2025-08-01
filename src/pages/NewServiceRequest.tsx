import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
export interface ServiceRequestForm {
  title: string;
  description: string;
  category_id: string;
  urgency: string;
  city: string;
  state: string;
  budget_min?: number;
  budget_max?: number;
  contact_email?: string;
  contact_phone?: string;
}

const NewServiceRequest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  
  const [formData, setFormData] = useState<ServiceRequestForm>({
    title: '',
    description: '',
    category_id: '',
    city: '',
    state: '',
    budget_min: undefined,
    budget_max: undefined,
    urgency: '',
    contact_phone: '',
    contact_email: '',
  });

  // Temporary mock categories until database is set up
  const categories = [
    { id: '1', name: 'Encanador' },
    { id: '2', name: 'Eletricista' },
    { id: '3', name: 'Pedreiro' },
    { id: '4', name: 'Pintor' },
    { id: '5', name: 'Jardineiro' },
    { id: '6', name: 'Desenvolvedor Web' },
    { id: '7', name: 'Design Gráfico' },
    { id: '8', name: 'Marketing Digital' },
    { id: '9', name: 'Fotógrafo' },
    { id: '10', name: 'Advogado' },
    { id: '11', name: 'Contador' },
    { id: '12', name: 'Limpeza' },
    { id: '13', name: 'Outros' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para criar uma solicitação.",
      });
      return;
    }

    if (!formData.title || !formData.description || !formData.category_id || !formData.city || !formData.state) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
      });
      return;
    }

    // Simulate successful creation (temporary until database is configured)
    setIsCreating(true);
    
    setTimeout(() => {
      setIsCreating(false);
      toast({
        title: "Solicitação criada!",
        description: "Sua solicitação foi criada com sucesso.",
      });
      
      // Navigate after successful creation
      navigate('/cliente');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/cliente')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Nova Solicitação de Serviço</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Detalhes da Solicitação</CardTitle>
            <CardDescription>
              Preencha as informações sobre o serviço que você precisa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Título da Solicitação *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Pintura de apartamento 2 quartos"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Descrição Detalhada *</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva em detalhes o serviço que você precisa..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <Select 
                    value={formData.category_id} 
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="urgency">Urgência</Label>
                  <Select 
                    value={formData.urgency} 
                    onValueChange={(value) => setFormData({ ...formData, urgency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a urgência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa - Posso esperar</SelectItem>
                      <SelectItem value="media">Média - Em algumas semanas</SelectItem>
                      <SelectItem value="alta">Alta - Preciso urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="city">Cidade *</Label>
                  <Input
                    id="city"
                    placeholder="Ex: São Paulo"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="state">Estado *</Label>
                  <Input
                    id="state"
                    placeholder="Ex: SP"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="budget_min">Orçamento Mínimo (R$)</Label>
                  <Input
                    id="budget_min"
                    type="number"
                    placeholder="1000"
                    value={formData.budget_min || ''}
                    onChange={(e) => setFormData({ ...formData, budget_min: e.target.value ? parseInt(e.target.value) : undefined })}
                  />
                </div>

                <div>
                  <Label htmlFor="budget_max">Orçamento Máximo (R$)</Label>
                  <Input
                    id="budget_max"
                    type="number"
                    placeholder="5000"
                    value={formData.budget_max || ''}
                    onChange={(e) => setFormData({ ...formData, budget_max: e.target.value ? parseInt(e.target.value) : undefined })}
                  />
                </div>

                <div>
                  <Label htmlFor="contact_phone">Telefone de Contato</Label>
                  <Input
                    id="contact_phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="contact_email">Email de Contato</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/cliente')}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar Solicitação
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default NewServiceRequest;