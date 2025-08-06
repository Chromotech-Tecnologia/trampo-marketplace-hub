import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, Building } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Add error boundary for auth context
  let user = null;
  let signOut = () => {};
  
  try {
    const auth = useAuth();
    user = auth.user;
    signOut = auth.signOut;
  } catch (error) {
    console.error('Auth context not available:', error);
  }
  
  const navigate = useNavigate();

  const handleDashboardClick = () => {
    if (user) {
      const userType = user.user_metadata?.user_type;
      if (userType === 'client') {
        navigate('/cliente');
      } else if (userType === 'provider') {
        navigate('/fornecedor');
      }
    }
  };

  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <img 
              src="/lovable-uploads/6c522438-4426-4558-834c-931bef48b71f.png" 
              alt="Mais Trampo" 
              className="h-10 w-auto"
            />
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
            {user ? (
              <>
                <Button variant="outline" className="flex items-center gap-2" onClick={handleDashboardClick}>
                  <User className="h-4 w-4" />
                  Minha Área
                </Button>
                <Button variant="ghost" onClick={signOut}>
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" className="flex items-center gap-2" onClick={() => navigate('/auth')}>
                  <User className="h-4 w-4" />
                  Entrar
                </Button>
                <Button variant="gradient" className="flex items-center gap-2" onClick={() => navigate('/auth')}>
                  <Building className="h-4 w-4" />
                  Cadastrar
                </Button>
              </>
            )}
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
                {user ? (
                  <>
                    <Button variant="outline" className="flex items-center gap-2 justify-center" onClick={handleDashboardClick}>
                      <User className="h-4 w-4" />
                      Minha Área
                    </Button>
                    <Button variant="ghost" onClick={signOut}>
                      Sair
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="flex items-center gap-2 justify-center" onClick={() => navigate('/auth')}>
                      <User className="h-4 w-4" />
                      Entrar
                    </Button>
                    <Button variant="gradient" className="flex items-center gap-2 justify-center" onClick={() => navigate('/auth')}>
                      <Building className="h-4 w-4" />
                      Cadastrar
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;