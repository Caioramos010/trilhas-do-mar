import { Heart, Shield, Leaf, Award } from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Cooperativa",
    description: "União de apaixonados pelo mar e por aventuras aquáticas.",
  },
  {
    icon: Shield,
    title: "Translados Seguros",
    description: "Profissionais experientes e embarcações certificadas.",
  },
  {
    icon: Leaf,
    title: "Preservação Ambiental",
    description: "Compromisso inabalável com a conservação marinha.",
  },
  {
    icon: Award,
    title: "Fundada em 2019",
    description: "Experiências náuticas excepcionais desde o início.",
  },
];

const About = () => {
  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-ocean to-ocean-deep bg-clip-text text-transparent">
            Trilhas do Mar - Cooperativa
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            A Cooperativa Trilhas do Mar surgiu da união de apaixonados pelo mar e por aventuras aquáticas que também compartilham um compromisso inabalável com a preservação ambiental. Fundada em 2019, nossa missão é proporcionar experiências náuticas excepcionais, ao mesmo tempo que promovemos a conservação marinha.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {values.map((value, index) => (
            <div 
              key={index}
              className="text-center animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-ocean to-ocean-deep mb-4">
                <value.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-ocean-deep">{value.title}</h3>
              <p className="text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto bg-card rounded-2xl p-8 md:p-12 shadow-lg animate-scale-in">
          <h3 className="text-2xl font-bold mb-4 text-center text-ocean-deep">Nossa Localização</h3>
          <p className="text-center text-lg text-muted-foreground leading-relaxed mb-4">
            Estamos localizados na Ilha de Florianópolis/SC em dois pontos estratégicos para translados seguros e profissionais para a paradisíaca Lagoinha do Leste:
          </p>
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="bg-muted/30 rounded-xl p-6">
              <h4 className="font-semibold text-ocean-deep mb-2">Pântano do Sul</h4>
              <p className="text-sm text-muted-foreground">Funciona durante todo ano. Canto da praia no Pântano do Sul.</p>
            </div>
            <div className="bg-muted/30 rounded-xl p-6">
              <h4 className="font-semibold text-ocean-deep mb-2">Armação</h4>
              <p className="text-sm text-muted-foreground">Funciona durante a alta temporada. Trapiche da Armação.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
