import { MessageCircle, Waves } from "lucide-react";
import { Button } from "./ui/button";
import heroImage from "@/assets/hero-ocean.jpg";

const Hero = () => {
  return (
    <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60" />
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="flex items-center justify-center gap-2 mb-6 animate-fade-in">
          <Waves className="h-8 w-8 text-ocean-light animate-wave" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-slow">
          Trilhas do Mar
        </h1>
        
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-white/90 animate-fade-in-slow">
          Turismo Náutico e Ecológico em Florianópolis
        </p>
        
        <p className="text-lg mb-10 max-w-2xl mx-auto text-white/80 animate-fade-in">
          Translados seguros e profissionais | Pântano do Sul - Armação | Florianópolis/SC
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
          <Button 
            size="lg"
            onClick={() => window.open("https://wa.me/5511999999999?text=Olá! Gostaria de reservar um passeio ecológico", "_blank")}
            className="bg-gradient-to-r from-ocean to-ocean-deep hover:opacity-90 text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
          >
            Reserve Seu Passeio Agora
          </Button>
          
          <Button 
            size="lg"
            onClick={() => window.open("https://wa.me/5511999999999?text=Olá! Gostaria de mais informações sobre os passeios", "_blank")}
            className="bg-success hover:bg-success/90 text-white text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Fale Conosco no WhatsApp
          </Button>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white/50 rounded-full animate-wave" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
