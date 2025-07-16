import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Star, Users, Zap } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative bg-gradient-hero min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/5 rounded-full blur-lg"></div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Hero Content */}
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Conecte-se ao
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Trabalho dos Sonhos
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
              A maior plataforma de serviços do Brasil. Encontre profissionais qualificados 
              ou ofereça seus serviços para milhares de clientes.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="xl" variant="accent" className="animate-pulse-glow">
                <Search className="mr-2 h-5 w-5" />
                Encontrar Profissionais
              </Button>
              <Button size="xl" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                <Users className="mr-2 h-5 w-5" />
                Oferecer Serviços
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-6">
                <div className="flex items-center justify-center mb-3">
                  <div className="bg-white/20 p-3 rounded-full">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">10K+</h3>
                <p className="text-white/80">Profissionais Ativos</p>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-6">
                <div className="flex items-center justify-center mb-3">
                  <div className="bg-white/20 p-3 rounded-full">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">4.9★</h3>
                <p className="text-white/80">Avaliação Média</p>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-6">
                <div className="flex items-center justify-center mb-3">
                  <div className="bg-white/20 p-3 rounded-full">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">24h</h3>
                <p className="text-white/80">Resposta Média</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;