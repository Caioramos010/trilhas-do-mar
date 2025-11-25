import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";

const images = [
  { src: gallery1, alt: "Vida marinha colorida" },
  { src: gallery2, alt: "Golfinhos em sincronia" },
  { src: gallery3, alt: "Praia paradisíaca" },
];

const Gallery = () => {
  return (
    <section id="gallery" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-ocean to-ocean-deep bg-clip-text text-transparent">
            Momentos Inesquecíveis
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Veja a beleza que nossos visitantes experimentam em cada passeio
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <div 
              key={index}
              className="group relative overflow-hidden rounded-2xl aspect-square animate-fade-in hover:shadow-2xl transition-all duration-300"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <img 
                src={image.src} 
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-6">
                <p className="text-white font-medium text-lg">{image.alt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
