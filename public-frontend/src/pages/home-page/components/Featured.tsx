import { useEffect, useState, useRef } from "react";
import Slider from "react-slick";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import api from "../../../api/axiosInstance";
import Loading from "../../../components/common/Loading";
import type { IBook } from "../../../components/books/BookCard";
import BookCard from "../../../components/books/BookCard";

const SlickSliderComponent = (Slider as any).default || Slider;

const Featured = () => {
  const [books, setBooks] = useState<IBook[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const sliderRef = useRef<Slider | null>(null);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await api.get("/books");
      setBooks(res.data.books);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const settings = {
    dots: false,
    infinite: true,
    speed: 700,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false,
    autoplay: false,
    centerMode: true,
    centerPadding: "30px",
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

  if (loading) return <Loading variant="inline" />;

  return (
    <section className="bg-background py-24 px-4 md:px-8 overflow-hidden">
      <div className="max-w-[1400px] mx-auto">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 pb-6 border-b border-ui-muted/10 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-[1px] w-6 bg-ui-dark/40" />
              <span className="font-sans text-xs uppercase tracking-widest text-ui-dark font-semibold">Pana.Hub Picks</span>
            </div>
            <h2 className="font-serif text-heading text-4xl md:text-5xl font-normal tracking-tight">
              Featured <span className="italic font-light text-ui-muted">Books</span>
            </h2>
          </div>

          {books.length > 1 && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => sliderRef.current?.slickPrev()}
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-ui-muted/20 bg-card-bg text-ui-dark hover:bg-ui-dark hover:text-white transition-all cursor-pointer shadow-xs active:scale-95"
                aria-label="Previous slide"
              >
                <FiChevronLeft size={20} />
              </button>
              <button
                onClick={() => sliderRef.current?.slickNext()}
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-ui-muted/20 bg-card-bg text-ui-dark hover:bg-ui-dark hover:text-white transition-all cursor-pointer shadow-xs active:scale-95"
                aria-label="Next slide"
              >
                <FiChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* SINGLE ROW CAROUSEL TRACK */}
        {books.length > 0 ? (
          <div className="w-full -mx-4">
            <SlickSliderComponent ref={sliderRef} {...settings}>
              {books.map((book: IBook) => (
                <div key={book._id} className="p-4 h-full outline-none">
                  <BookCard book={book} showStock={false} showPrice={false} showActionBtn={false} />
                </div>
              ))}
            </SlickSliderComponent>
          </div>
        ) : (
          <div className="text-center py-24 bg-card-bg rounded-3xl border border-dashed border-ui-muted/20 max-w-xl mx-auto">
            <p className="text-ui-muted font-sans text-base">No featured entries found at this time.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Featured;