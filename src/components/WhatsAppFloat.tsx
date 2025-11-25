import { MessageCircle } from "lucide-react";
import { Button } from "./ui/button";

const WhatsAppFloat = () => {
  const handleWhatsAppClick = () => {
    window.open("https://wa.me/5511999999999?text=Olá! Gostaria de informações sobre os passeios náuticos", "_blank");
  };

  return (
    <Button
      onClick={handleWhatsAppClick}
      size="lg"
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-success hover:bg-success/90 shadow-2xl hover:shadow-success/50 transition-all duration-300 p-0"
      aria-label="Contato WhatsApp"
    >
      <MessageCircle className="h-7 w-7 text-white" />
    </Button>
  );
};

export default WhatsAppFloat;
