import { Card, CardContent } from "./ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Marina Silva",
    location: "São Paulo, SP",
    text: "Experiência incrível! A equipe é extremamente cuidadosa com o meio ambiente e nos proporcionou momentos únicos. Ver as tartarugas foi mágico!",
    rating: 5,
  },
  {
    name: "Carlos Mendes",
    location: "Rio de Janeiro, RJ",
    text: "O pôr do sol no barco foi o momento mais romântico da nossa viagem. Tudo impecável, desde o atendimento até os drinks. Recomendo demais!",
    rating: 5,
  },
  {
    name: "Ana Paula Costa",
    location: "Belo Horizonte, MG",
    text: "Adorei saber que parte do valor vai para projetos ambientais. Fizemos o snorkeling e a experiência educativa com o biólogo foi sensacional!",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-ocean to-ocean-deep bg-clip-text text-transparent">
            O Que Nossos Clientes Dizem
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Histórias reais de quem já viveu a experiência AzulEco
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="animate-fade-in border-none shadow-lg hover:shadow-xl transition-all duration-300"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-ocean-deep">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
