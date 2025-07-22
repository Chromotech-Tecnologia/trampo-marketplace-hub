import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useServiceRequests, type ServiceRequestForm } from '@/hooks/useServiceRequests';

interface EditServiceRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: any;
}

export const EditServiceRequestDialog = ({ open, onOpenChange, request }: EditServiceRequestDialogProps) => {
  const { updateRequest, isUpdating } = useServiceRequests();
  
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

  // Fetch service categories
  const { data: categories } = useQuery({
    queryKey: ['service-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) throw error;
      return data;
    },
  });

  // Update form data when request changes
  useEffect(() => {
    if (request) {
      setFormData({
        title: request.title || '',
        description: request.description || '',
        category_id: request.category_id || '',
        city: request.city || '',
        state: request.state || '',
        budget_min: request.budget_min || undefined,
        budget_max: request.budget_max || undefined,
        urgency: request.urgency || '',
        contact_phone: request.contact_phone || '',
        contact_email: request.contact_email || '',
      });
    }
  }, [request]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category_id || !formData.city || !formData.state) {
      return;
    }

    updateRequest({
      id: request.id,
      ...formData,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Solicitação</DialogTitle>
          <DialogDescription>
            Atualize as informações da sua solicitação de serviço
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="edit-title">Título da Solicitação *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="edit-description">Descrição *</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="edit-category">Categoria *</Label>
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
              <Label htmlFor="edit-urgency">Urgência</Label>
              <Select 
                value={formData.urgency} 
                onValueChange={(value) => setFormData({ ...formData, urgency: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a urgência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-city">Cidade *</Label>
              <Input
                id="edit-city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-state">Estado *</Label>
              <Input
                id="edit-state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-budget-min">Orçamento Mínimo (R$)</Label>
              <Input
                id="edit-budget-min"
                type="number"
                value={formData.budget_min || ''}
                onChange={(e) => setFormData({ ...formData, budget_min: e.target.value ? parseInt(e.target.value) : undefined })}
              />
            </div>

            <div>
              <Label htmlFor="edit-budget-max">Orçamento Máximo (R$)</Label>
              <Input
                id="edit-budget-max"
                type="number"
                value={formData.budget_max || ''}
                onChange={(e) => setFormData({ ...formData, budget_max: e.target.value ? parseInt(e.target.value) : undefined })}
              />
            </div>

            <div>
              <Label htmlFor="edit-phone">Telefone</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={formData.contact_phone || ''}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.contact_email || ''}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};