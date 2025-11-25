import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { Anchor } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-ocean-deep text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-white/10 p-2 rounded-lg">
                <Anchor className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold">Trilhas do Mar</span>
            </div>
            <p className="text-white/80 text-sm">
              Cooperativa de turismo náutico para a Lagoinha do Leste com translados seguros e profissionais.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-lg">Navegação</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li><a href="#tours" className="hover:text-white transition-colors">Rotas</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">Sobre Nós</a></li>
              <li><a href="#sustainability" className="hover:text-white transition-colors">Sustentabilidade</a></li>
              <li><a href="#gallery" className="hover:text-white transition-colors">Galeria</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-lg">Contato</h3>
            <ul className="space-y-3 text-sm text-white/80">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>(11) 99999-9999</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>contato@trilhasdomax.com.br</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1" />
                <span>Pântano do Sul e Armação<br />Florianópolis/SC</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-lg">Redes Sociais</h3>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/trilhas_domar" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-sm text-white/60">
          <p>© 2025 Trilhas do Mar - Cooperativa. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
