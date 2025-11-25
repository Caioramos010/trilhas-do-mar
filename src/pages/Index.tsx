import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Tours from "@/components/Tours";
import About from "@/components/About";
import Sustainability from "@/components/Sustainability";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Tours />
      <About />
      <Sustainability />
      <Gallery />
      <Testimonials />
      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default Index;
