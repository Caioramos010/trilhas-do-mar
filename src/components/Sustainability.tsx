import { Recycle, Trash, TreePine } from "lucide-react";
import sustainabilityImage from "@/assets/sustainability.jpg";

const practices = [
  {
    icon: Recycle,
    title: "Zero Resíduos",
    description: "Coleta e reciclagem de 100% dos resíduos gerados durante os passeios.",
  },
  {
    icon: Trash,
    title: "Coleta de desejetos",
    description: "Campanhas de coleta de lixos por todo parque.",
  },
  {
    icon: TreePine,
    title: "Conservação",
    description: "Participação em campanhas de conservação costeira.",
  },
];

const Sustainability = () => {
  return (
    <section id="sustainability" className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-ocean to-success bg-clip-text text-transparent">
            Nossa Missão Verde
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Turismo náutico pode e deve ser sustentável. Conheça nossas práticas que protegem o oceano que tanto amamos.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="animate-fade-in">
            <img 
              src={sustainabilityImage} 
              alt="Conservação Marinha" 
              className="rounded-2xl shadow-2xl w-full h-[400px] object-cover"
            />
          </div>

          <div className="space-y-6 animate-fade-in">
            {practices.map((practice, index) => (
              <div 
                key={index} 
                className="flex gap-4 p-4 rounded-xl bg-card hover:shadow-lg transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-success to-ocean flex items-center justify-center">
                    <practice.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-ocean-deep">{practice.title}</h3>
                  <p className="text-muted-foreground">{practice.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto bg-gradient-to-r from-ocean/10 to-success/10 rounded-2xl p-8 md:p-12 border border-ocean/20 animate-scale-in">
          <h3 className="text-2xl font-bold mb-4 text-center text-ocean-deep">Compromisso com o Futuro</h3>
          <p className="text-center text-lg text-muted-foreground leading-relaxed mb-6">
            Cada passeio contribui diretamente para a preservação desse nosso paraíso. Realizamos limpeza de praias. Quando você escolhe Trilhas do Mar, você escolhe proteger nossos oceanos.
          </p>
          <div className="flex justify-center gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-ocean">2+</div>
              <div className="text-sm text-muted-foreground">Toneladas de lixo coletadas</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Sustainability;
