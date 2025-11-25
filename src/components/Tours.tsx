import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Clock, Users, MessageCircle } from "lucide-react";
import snorkelingImage from "@/assets/tour-snorkeling.jpg";
import sunsetImage from "@/assets/tour-sunset.jpg";
import wildlifeImage from "@/assets/tour-wildlife.jpg";

const tours = [
  {
    title: "Pântano do Sul → Lagoinha do Leste",
    description: "Translado seguro e profissional saindo do Pântano do Sul até a paradisíaca Lagoinha do Leste. Trajeto ida e volta com todo conforto.",
    image: snorkelingImage,
    duration: "30/40 minutos",
    capacity: "Conforme capacidade da embarcação",
    highlights: ["Translado seguro", "Cooperativa", "Horário flexível"],
    price: "R$ 65,00 por trajeto | R$ 130,00 ida e volta"
  },
  {
    title: "Armação → Lagoinha do Leste",
    description: "Rota pela Armação até a Lagoinha do Leste. Funciona durante a alta temporada com saídas do Trapiche da Armação.",
    image: sunsetImage,
    duration: "30/40 minutos",
    capacity: "Conforme capacidade da embarcação",
    highlights: ["Alta temporada", "Trapiche da Armação", "Retorno garantido"],
    price: "R$ 65,00 por trajeto | R$ 130,00 ida e volta"
  },
];

const Tours = () => {
  const handleWhatsAppClick = (tourTitle: string) => {
    const message = `Olá! Tenho interesse no passeio "${tourTitle}". Gostaria de mais informações e disponibilidade.`;
    window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <section id="tours" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-ocean to-ocean-deep bg-clip-text text-transparent">
            Nossas Rotas
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Atualmente possuímos duas rotas de transporte para a Lagoinha do Leste. Translados seguros e profissionais com horários flexíveis.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {tours.map((tour, index) => (
            <Card 
              key={index} 
              className="overflow-hidden hover:shadow-xl transition-all duration-300 animate-fade-in border-none bg-card"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={tour.image} 
                  alt={tour.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              
              <CardHeader>
                <CardTitle className="text-2xl text-ocean-deep">{tour.title}</CardTitle>
                <CardDescription className="text-base">{tour.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-ocean" />
                  <span>{tour.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4 text-ocean" />
                  <span>{tour.capacity}</span>
                </div>
                <div className="pt-2 space-y-1">
                  {tour.highlights.map((highlight, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-ocean" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-border">
                  <p className="text-lg font-semibold text-ocean">{tour.price}</p>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-2">
                <Button 
                  onClick={() => handleWhatsAppClick(tour.title)}
                  className="w-full bg-success hover:bg-success/90 text-white"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Reservar no WhatsApp
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Tours;
