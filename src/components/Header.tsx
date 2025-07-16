import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, Building, Shield } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-hero p-2 rounded-lg">
              <Building className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Mais Trampo</h1>
              <p className="text-xs text-muted-foreground">Conectando você ao trabalho</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#como-funciona" className="text-foreground hover:text-primary transition-colors">
              Como Funciona
            </a>
            <a href="#categorias" className="text-foreground hover:text-primary transition-colors">
              Categorias
            </a>
            <a href="#sobre" className="text-foreground hover:text-primary transition-colors">
              Sobre
            </a>
            <a href="#contato" className="text-foreground hover:text-primary transition-colors">
              Contato
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="outline" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Área do Cliente
            </Button>
            <Button variant="gradient" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Sou Fornecedor
            </Button>
            <Button variant="ghost" size="icon">
              <Shield className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-accent"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col space-y-4">
              <a href="#como-funciona" className="text-foreground hover:text-primary transition-colors">
                Como Funciona
              </a>
              <a href="#categorias" className="text-foreground hover:text-primary transition-colors">
                Categorias
              </a>
              <a href="#sobre" className="text-foreground hover:text-primary transition-colors">
                Sobre
              </a>
              <a href="#contato" className="text-foreground hover:text-primary transition-colors">
                Contato
              </a>
              <div className="flex flex-col space-y-3 pt-4">
                <Button variant="outline" className="flex items-center gap-2 justify-center">
                  <User className="h-4 w-4" />
                  Área do Cliente
                </Button>
                <Button variant="gradient" className="flex items-center gap-2 justify-center">
                  <Building className="h-4 w-4" />
                  Sou Fornecedor
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;