import { Card, CardContent } from "@/components/ui/card";
import { Search, MessageSquare, CheckCircle, Star } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: Search,
      title: "1. Descreva seu Projeto",
      description: "Conte-nos o que você precisa. Seja específico sobre o serviço, localização e prazo.",
      color: "bg-primary"
    },
    {
      icon: MessageSquare,
      title: "2. Receba Propostas",
      description: "Profissionais qualificados enviarão propostas personalizadas para seu projeto.",
      color: "bg-secondary"
    },
    {
      icon: CheckCircle,
      title: "3. Escolha o Profissional",
      description: "Compare propostas, veja avaliações e escolha quem melhor atende suas necessidades.",
      color: "bg-accent"
    },
    {
      icon: Star,
      title: "4. Avalie o Trabalho",
      description: "Após a conclusão, avalie o serviço para ajudar outros clientes.",
      color: "bg-primary"
    }
  ];

  return (
    <section id="como-funciona" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Como Funciona o Mais Trampo
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Nossa plataforma simplifica a conexão entre clientes e profissionais. 
            Veja como é fácil encontrar o serviço que você precisa.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className={`${step.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <step.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </CardContent>
              
              {/* Connecting line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary to-transparent z-10"></div>
              )}
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-card rounded-2xl p-8 md:p-12 text-center shadow-xl">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Pronto para Começar?
          </h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de clientes satisfeitos que já encontraram os melhores profissionais através do Mais Trampo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#solicitar-servico" 
              className="inline-flex items-center justify-center h-12 px-8 bg-gradient-hero text-white rounded-lg hover:opacity-90 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
            >
              Solicitar Serviço Agora
            </a>
            <a 
              href="#" 
              className="inline-flex items-center justify-center h-12 px-8 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
            >
              Cadastrar como Profissional
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;