import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ServiceRequestForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    category: "",
    description: ""
  });
  const { toast } = useToast();

  const categories = [
    "Encanador",
    "Eletricista", 
    "Pedreiro",
    "Pintor",
    "Jardineiro",
    "Desenvolvedor Web",
    "Design Gráfico",
    "Marketing Digital",
    "Fotógrafo",
    "Advogado",
    "Contador",
    "Limpeza",
    "Outros"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validação básica
    if (!formData.name || !formData.phone || !formData.city || !formData.category || !formData.description) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Solicitação enviada!",
      description: "Em breve você receberá propostas de profissionais qualificados.",
    });
    
    // Reset form
    setFormData({
      name: "",
      phone: "",
      city: "",
      category: "",
      description: ""
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <section id="solicitar-servico" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Solicite seu Serviço
            </h2>
            <p className="text-lg text-muted-foreground">
              Descreva o que você precisa e receba propostas de profissionais qualificados
            </p>
          </div>

          <Card className="bg-gradient-card shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Nova Solicitação</CardTitle>
              <CardDescription className="text-center">
                Preencha os dados abaixo para receber propostas personalizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nome */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                {/* Telefone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone/WhatsApp *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>

                {/* Cidade */}
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="Sua cidade"
                    required
                  />
                </div>

                {/* Categoria */}
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria do Serviço *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição do Serviço *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Descreva detalhadamente o que você precisa..."
                    rows={4}
                    required
                  />
                </div>

                {/* Upload de arquivos */}
                <div className="space-y-2">
                  <Label>Anexar Imagens/Documentos (opcional)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Clique ou arraste arquivos aqui
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, PDF até 10MB
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <Button type="submit" size="lg" variant="gradient" className="w-full">
                  <Send className="mr-2 h-5 w-5" />
                  Enviar Solicitação
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ServiceRequestForm;