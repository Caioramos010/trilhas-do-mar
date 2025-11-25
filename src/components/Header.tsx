import { Anchor, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection("hero")}>
            <div className="bg-gradient-to-br from-ocean to-ocean-deep p-2 rounded-lg">
              <Anchor className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-ocean to-ocean-deep bg-clip-text text-transparent">
              Trilhas do Mar
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => scrollToSection("tours")} className="text-foreground hover:text-ocean transition-colors">
              Rotas
            </button>
            <button onClick={() => scrollToSection("about")} className="text-foreground hover:text-ocean transition-colors">
              Sobre Nós
            </button>
            <button onClick={() => scrollToSection("sustainability")} className="text-foreground hover:text-ocean transition-colors">
              Sustentabilidade
            </button>
            <button onClick={() => scrollToSection("gallery")} className="text-foreground hover:text-ocean transition-colors">
              Galeria
            </button>
            <button onClick={() => scrollToSection("testimonials")} className="text-foreground hover:text-ocean transition-colors">
              Depoimentos
            </button>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button 
              onClick={() => window.open("https://wa.me/5511999999999", "_blank")}
              variant="outline"
              className="border-success text-success hover:bg-success hover:text-white"
            >
              Fale Conosco
            </Button>
            <Button 
              onClick={() => window.open("https://wa.me/5511999999999", "_blank")}
              className="bg-gradient-to-r from-ocean to-ocean-deep hover:opacity-90"
            >
              Reserve Agora
            </Button>
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden mt-4 py-4 border-t border-border flex flex-col gap-3 animate-fade-in">
            <button onClick={() => scrollToSection("tours")} className="text-left py-2 text-foreground hover:text-ocean">
              Rotas
            </button>
            <button onClick={() => scrollToSection("about")} className="text-left py-2 text-foreground hover:text-ocean">
              Sobre Nós
            </button>
            <button onClick={() => scrollToSection("sustainability")} className="text-left py-2 text-foreground hover:text-ocean">
              Sustentabilidade
            </button>
            <button onClick={() => scrollToSection("gallery")} className="text-left py-2 text-foreground hover:text-ocean">
              Galeria
            </button>
            <button onClick={() => scrollToSection("testimonials")} className="text-left py-2 text-foreground hover:text-ocean">
              Depoimentos
            </button>
            <div className="flex flex-col gap-2 mt-2">
              <Button 
                onClick={() => window.open("https://wa.me/5511999999999", "_blank")}
                variant="outline"
                className="border-success text-success hover:bg-success hover:text-white w-full"
              >
                Fale Conosco
              </Button>
              <Button 
                onClick={() => window.open("https://wa.me/5511999999999", "_blank")}
                className="bg-gradient-to-r from-ocean to-ocean-deep w-full"
              >
                Reserve Agora
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
