import { Building, Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <img 
                src="/lovable-uploads/6c522438-4426-4558-834c-931bef48b71f.png" 
                alt="Mais Trampo" 
                className="h-12 w-auto"
              />
            </div>
            <p className="text-muted leading-relaxed mb-4">
              A maior plataforma de serviços do Brasil. Conectamos clientes e profissionais 
              de forma segura e eficiente.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-muted hover:text-background transition-colors cursor-pointer" />
              <Instagram className="h-5 w-5 text-muted hover:text-background transition-colors cursor-pointer" />
              <Linkedin className="h-5 w-5 text-muted hover:text-background transition-colors cursor-pointer" />
              <Twitter className="h-5 w-5 text-muted hover:text-background transition-colors cursor-pointer" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Links Rápidos</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted hover:text-background transition-colors">Como Funciona</a></li>
              <li><a href="#" className="text-muted hover:text-background transition-colors">Categorias</a></li>
              <li><a href="#" className="text-muted hover:text-background transition-colors">Área do Cliente</a></li>
              <li><a href="#" className="text-muted hover:text-background transition-colors">Área do Fornecedor</a></li>
              <li><a href="#" className="text-muted hover:text-background transition-colors">Central de Ajuda</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Legal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted hover:text-background transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="text-muted hover:text-background transition-colors">Política de Privacidade</a></li>
              <li><a href="#" className="text-muted hover:text-background transition-colors">Política de Cookies</a></li>
              <li><a href="#" className="text-muted hover:text-background transition-colors">Regulamento</a></li>
              <li><a href="#" className="text-muted hover:text-background transition-colors">Segurança</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contato</h4>
            <ul className="space-y-4">
              <li className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted" />
                <span className="text-muted">contato@maistrampo.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-muted" />
                <span className="text-muted">(11) 3000-0000</span>
              </li>
              <li className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-muted" />
                <span className="text-muted">São Paulo, SP - Brasil</span>
              </li>
            </ul>
            
            <div className="mt-6">
              <h5 className="font-medium mb-3">Horário de Atendimento</h5>
              <p className="text-sm text-muted">
                Segunda a Sexta: 8h às 18h<br />
                Sábado: 8h às 14h
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted text-sm mb-4 md:mb-0">
              © 2024 Mais Trampo. Todos os direitos reservados.
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <a href="#" className="text-muted hover:text-background transition-colors">
                CNPJ: 00.000.000/0001-00
              </a>
              <span className="text-muted">•</span>
              <a href="#" className="text-muted hover:text-background transition-colors">
                Versão 1.0.0
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;