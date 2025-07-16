import { Card, CardContent } from "@/components/ui/card";
import { 
  Wrench, 
  Zap, 
  Hammer, 
  Paintbrush, 
  Leaf, 
  Code, 
  Palette, 
  TrendingUp, 
  Camera, 
  Scale, 
  Calculator, 
  Sparkles 
} from "lucide-react";

const Categories = () => {
  const categories = [
    {
      icon: Wrench,
      name: "Encanador",
      description: "Instalações e reparos hidráulicos",
      count: "245+ profissionais"
    },
    {
      icon: Zap,
      name: "Eletricista",
      description: "Serviços elétricos residenciais e comerciais",
      count: "189+ profissionais"
    },
    {
      icon: Hammer,
      name: "Pedreiro",
      description: "Construção e reformas",
      count: "321+ profissionais"
    },
    {
      icon: Paintbrush,
      name: "Pintor",
      description: "Pintura residencial e comercial",
      count: "156+ profissionais"
    },
    {
      icon: Leaf,
      name: "Jardineiro",
      description: "Paisagismo e manutenção de jardins",
      count: "98+ profissionais"
    },
    {
      icon: Code,
      name: "Desenvolvedor Web",
      description: "Sites, apps e sistemas",
      count: "287+ profissionais"
    },
    {
      icon: Palette,
      name: "Design Gráfico",
      description: "Criação visual e branding",
      count: "145+ profissionais"
    },
    {
      icon: TrendingUp,
      name: "Marketing Digital",
      description: "Estratégias online e vendas",
      count: "203+ profissionais"
    },
    {
      icon: Camera,
      name: "Fotógrafo",
      description: "Eventos, produtos e retratos",
      count: "167+ profissionais"
    },
    {
      icon: Scale,
      name: "Advogado",
      description: "Consultoria e representação legal",
      count: "234+ profissionais"
    },
    {
      icon: Calculator,
      name: "Contador",
      description: "Contabilidade e gestão fiscal",
      count: "178+ profissionais"
    },
    {
      icon: Sparkles,
      name: "Limpeza",
      description: "Limpeza residencial e comercial",
      count: "312+ profissionais"
    }
  ];

  return (
    <section id="categorias" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Categorias de Serviços
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Encontre profissionais qualificados em diversas áreas. 
            Desde serviços domésticos até soluções digitais.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer bg-gradient-card border-0"
            >
              <CardContent className="p-6 text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <category.icon className="h-8 w-8 text-primary group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {category.description}
                </p>
                <span className="inline-block bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full">
                  {category.count}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* More Categories CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Não encontrou sua categoria? Temos muito mais!
          </p>
          <a 
            href="#" 
            className="inline-flex items-center justify-center h-10 px-6 bg-outline border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-all duration-200"
          >
            Ver Todas as Categorias
          </a>
        </div>
      </div>
    </section>
  );
};

export default Categories;