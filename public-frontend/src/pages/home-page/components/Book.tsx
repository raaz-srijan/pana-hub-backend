import { useRef } from "react";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight, FiShoppingBag } from "react-icons/fi";

const books = [
  {
    id: 1,
    title: "Atomic Habits",
    author: "James Clear",
    price: 1299,
    cover: "https://placehold.co/400x600",
    category: "Self-Improvement"
  },
  {
    id: 2,
    title: "The Alchemist",
    author: "Paulo Coelho",
    price: 999,
    cover: "https://placehold.co/400x600",
    category: "Fiction"
  },
  {
    id: 3,
    title: "Deep Work",
    author: "Cal Newport",
    price: 1199,
    cover: "https://placehold.co/400x600",
    category: "Productivity"
  },
  {
    id: 4,
    title: "1984",
    author: "George Orwell",
    price: 899,
    cover: "https://placehold.co/400x600",
    category: "Classic Literature"
  },
  {
    id: 5,
    title: "Rich Dad Poor Dad",
    author: "Robert Kiyosaki",
    price: 1099,
    cover: "https://placehold.co/400x600",
    category: "Finance"
  },
];

// Safely unpack the slider component for various build environments
const SlickSliderComponent = (Slider as any).default || Slider;

const Books = () => {
  const sliderRef = useRef<Slider | null>(null);

  // Responsive settings for a single-row slider structure
  const settings = {
    dots: false,
    infinite: books.length > 4,
    speed: 700,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false,
    swipeToSlide: true,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3,
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  const handleAddToCart = (id: number) => {
    console.log(`Added book ${id} to cart`);
  };

  return (
    <section className="bg-background py-24 px-4 md:px-8 overflow-hidden select-none">
      <div className="max-w-[1400px] mx-auto">
        
        {/* EDITORIAL SECTION HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 pb-6 border-b border-ui-muted/10 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-[1px] w-6 bg-ui-dark/40" />
              <span className="font-sans text-xs uppercase tracking-widest text-ui-dark font-semibold">Handpicked Collections</span>
            </div>
            <h2 className="font-serif text-heading text-4xl md:text-5xl font-normal tracking-tight">
              Top Marketplace <span className="italic font-light text-ui-muted">Releases</span>
            </h2>
          </div>
          
          {/* Minimalist Slide Triggers */}
          {books.length > 1 && (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => sliderRef.current?.slickPrev()}
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-ui-muted/20 bg-card-bg text-ui-dark hover:bg-ui-dark hover:text-white transition-all cursor-pointer shadow-3xs active:scale-95"
                aria-label="Previous slide"
              >
                <FiChevronLeft size={20} />
              </button>
              <button 
                onClick={() => sliderRef.current?.slickNext()}
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-ui-muted/20 bg-card-bg text-ui-dark hover:bg-ui-dark hover:text-white transition-all cursor-pointer shadow-3xs active:scale-95"
                aria-label="Next slide"
              >
                <FiChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* SINGLE ROW SLIDER CONTAINER */}
        <div className="w-full -mx-4">
          <SlickSliderComponent ref={sliderRef} {...settings}>
            {books.map((book) => (
              <div key={book.id} className="p-4 outline-none">
                
                <article className="group bg-card-bg rounded-2xl border border-ui-muted/10 overflow-hidden transition-all duration-400 hover:shadow-lg hover:border-ui-muted/20 flex flex-col h-[520px]">
                  
                  {/* Top: Book Cover Presentation Area */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-ui-dark/5 flex items-center justify-center p-6 group-hover:bg-ui-dark/[0.02] transition-colors">
                    {/* Floating Context Label */}
                    <span className="absolute top-4 left-4 z-10 bg-card-bg/90 backdrop-blur-md text-ui-dark font-sans text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-lg border border-ui-muted/10 shadow-3xs">
                      {book.category}
                    </span>

                    {/* Book Canvas Layout */}
                    <div className="w-full h-full shadow-[8px_12px_24px_rgba(15,23,42,0.18)] border-l border-black/5 rounded-r transform group-hover:scale-[1.03] group-hover:-translate-y-1 transition-all duration-500 ease-out overflow-hidden">
                      <img 
                        src={book.cover} 
                        alt={book.title} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {/* Bottom: Book Details Section */}
                  <div className="p-6 flex flex-col flex-grow justify-between">
                    <div>
                      <Link to={`/book/${book.id}`} className="outline-none">
                        <h3 className="font-serif text-heading font-medium text-xl leading-snug tracking-tight mb-1.5 line-clamp-2 hover:text-ui-muted transition-colors capitalize">
                          {book.title}
                        </h3>
                      </Link>
                      <p className="font-sans text-sm text-ui-muted font-normal">
                        by <span className="text-heading font-medium">{book.author}</span>
                      </p>
                    </div>

                    {/* Pricing and Actions Layer */}
                    <div className="pt-4 border-t border-ui-muted/10 flex items-center justify-between gap-4">
                      <div className="flex flex-col">
                        <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-ui-muted/60">Fulfillment Price</span>
                        <span className="font-sans font-bold text-lg text-heading">
                          Rs. {book.price.toLocaleString()}
                        </span>
                      </div>

                      {/* Interactive Basket Trigger */}
                      <button
                        onClick={() => handleAddToCart(book.id)}
                        className="flex h-11 w-11 items-center justify-center rounded-xl bg-ui-dark text-card-bg hover:bg-ui-dark/90 active:scale-95 transition-all cursor-pointer shadow-xs outline-none"
                        title="Add to basket"
                      >
                        <FiShoppingBag size={15} />
                      </button>
                    </div>

                  </div>
                </article>
                
              </div>
            ))}
          </SlickSliderComponent>
        </div>

      </div>
    </section>
  );
};

export default Books;