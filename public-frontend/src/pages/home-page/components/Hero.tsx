import Slider from "react-slick";
import { FiArrowRight, FiStar } from "react-icons/fi";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const SlickSliderComponent = (Slider as any).default || Slider;

interface BookSlide {
  id: number;
  title: string;
  author: string;
  tag: string;
  rating: number;
  desc: string;
  image: string;
}

export function Hero() {
  const settings = {
    arrows: false,
    className: "center",
    centerMode: true,
    infinite: true,
    centerPadding: "120px",
    slidesToShow: 1,
    speed: 700,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 1,
          centerPadding: "60px",
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          centerPadding: "0px",
        }
      }
    ]
  };

  const featuredSlides: BookSlide[] = [
    {
      id: 1,
      title: "The Midnight Library",
      author: "Matt Haig",
      tag: "Fiction",
      rating: 4.8,
      desc: "Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.",
      image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: 2,
      title: "A History of Architecture",
      author: "Sir Banister Fletcher",
      tag: "Design",
      rating: 4.9,
      desc: "A monumental surveying of structural achievement, tracing civilizations through their monuments, iconic layout movements, and materials used across eras.",
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: 3,
      title: "The Art of Creative Writing",
      author: "Julia Cameron",
      tag: "Education",
      rating: 4.7,
      desc: "Unlocking artistic pathways, this guidebook uncovers the spiritual and practical practices that allow storytellers to find their authentic voice.",
      image: "https://images.unsplash.com/photo-1495640388908-05fa85288e61?q=80&w=600&auto=format&fit=crop",
    }
  ];

  return (
    <section className="w-full bg-background pt-16 pb-20 overflow-hidden">
      {/* Title Header */}
      <div className="max-w-[1400px] mx-auto px-6 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-[1px] w-8 bg-ui-muted/40"></span>
            <span className="font-sans text-xs uppercase tracking-widest text-ui-muted font-bold">Pana.Hub Picks</span>
          </div>
          <h2 className="font-serif text-heading text-4xl md:text-5xl font-normal tracking-tight">
            Featured <span className="italic font-light text-ui-muted">Books</span>
          </h2>
        </div>
        <p className="font-sans text-sm text-ui-muted max-w-sm md:text-right">
          Hand-picked stories and trending titles, chosen weekly by our staff.
        </p>
      </div>

      {/* Slick Slider Track */}
      <div className="w-full max-w-[1400px] mx-auto px-2">
        <SlickSliderComponent {...settings}>
          {featuredSlides.map((slide) => (
            <div key={slide.id} className="px-4 py-4 outline-none">

              <div
                className="group grid grid-cols-1 md:grid-cols-12 rounded-3xl overflow-hidden bg-card-bg   shadow-xs hover:shadow-md transition-all duration-300 min-h-[420px] block outline-none"
              >

                {/* Left Side: Editorial Typography Context */}
                <div className="md:col-span-7 p-8 md:p-14 flex flex-col justify-between items-start bg-card-bg transition-colors duration-300 group-hover:bg-background/40">

                  <div className="space-y-4 w-full">
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-[11px] font-extrabold tracking-widest text-ui-muted uppercase  px-2.5 py-1 rounded-md bg-background">
                        {slide.tag}
                      </span>
                      <div className="flex items-center gap-1.5 bg-background  px-2.5 py-1 rounded-md">
                        <FiStar className="text-amber-500 fill-amber-500" size={12} />
                        <span className="font-sans text-xs font-bold text-ui-dark">{slide.rating}</span>
                      </div>
                    </div>

                    <h3 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight text-heading leading-tight pt-2 group-hover:text-brand-primary transition-colors duration-200">
                      {slide.title}
                    </h3>

                    <p className="font-sans text-sm text-ui-muted">
                      By <span className="text-heading font-medium underline underline-offset-4 group-hover:decoration-brand-primary/40 transition-colors duration-200">{slide.author}</span>
                    </p>

                    <p className="font-sans text-sm text-ui-muted/80 leading-relaxed max-w-xl pt-2 line-clamp-3">
                      {slide.desc}
                    </p>
                  </div>

                  {/* Clean Navigation Prompt instead of hard CTA Button rows */}
                  <div className="inline-flex items-center gap-2 mt-8 font-sans text-xs font-semibold text-brand-primary tracking-wide uppercase">
                    <span>View Exhibition Details</span>
                    <FiArrowRight size={14} className="transform group-hover:translate-x-1.5 transition-transform duration-200" />
                  </div>
                </div>

                {/* Right Side: Tangible Book Cover */}
                <div className="md:col-span-5 relative bg-background/50 flex items-center justify-center p-8 md:p-0 min-h-[320px] md:min-h-full ">

                  {/* Subtle Background Ambiance Glow */}
                  <div className="absolute inset-0 overflow-hidden opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                    <img src={slide.image} alt="" className="w-full h-full object-cover scale-150 blur-2xl" />
                  </div>

                  {/* Suspended Shadow-Cast Cover */}
                  <div className="relative z-10 w-[160px] md:w-[200px] aspect-[2/3] rounded-r-xl overflow-hidden shadow-[8px_12px_24px_rgba(15,23,42,0.14)] group-hover:shadow-[16px_20px_32px_rgba(15,23,42,0.2)] transform -rotate-2 group-hover:rotate-0 group-hover:scale-[1.02] transition-all duration-500 ease-out">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

              </div>

            </div>
          ))}
        </SlickSliderComponent>
      </div>
    </section>
  );
}

export default Hero;