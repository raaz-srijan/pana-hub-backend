import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../api/axiosInstance";
import Loading from "../../../components/common/Loading";
import { 
  BiBookOpen, 
  BiPalette, 
  BiAtom, 
  BiHeart, 
  BiGhost, 
  BiCompass, 
  BiHistory, 
  BiBriefcase,
  BiTrendingUp,
  BiBadgeCheck
} from "react-icons/bi";
import { FiChevronDown } from "react-icons/fi";

interface ICategory {
  _id: string;
  name: string;
  slug?: string;
}

const getCategoryIcon = (name: string) => {
  const normalized = name.toLowerCase().trim();
  
  if (normalized.includes("art") || normalized.includes("design")) return <BiPalette className="w-5 h-5" />;
  if (normalized.includes("sci") || normalized.includes("tech")) return <BiAtom className="w-5 h-5" />;
  if (normalized.includes("romance") || normalized.includes("love")) return <BiHeart className="w-5 h-5" />;
  if (normalized.includes("horror") || normalized.includes("thriller") || normalized.includes("mystery")) return <BiGhost className="w-5 h-5" />;
  if (normalized.includes("travel") || normalized.includes("adventure")) return <BiCompass className="w-5 h-5" />;
  if (normalized.includes("history") || normalized.includes("biography")) return <BiHistory className="w-5 h-5" />;
  if (normalized.includes("business") || normalized.includes("finance")) return <BiBriefcase className="w-5 h-5" />;
  if (normalized.includes("self") || normalized.includes("motivation")) return <BiTrendingUp className="w-5 h-5" />;
  if (normalized.includes("academic") || normalized.includes("education")) return <BiBadgeCheck className="w-5 h-5" />;
  
  return <BiBookOpen className="w-5 h-5" />;
};

const Categories = () => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const VISIBLE_THRESHOLD = 6;

  const fetchCat = async () => {
    setLoading(true);
    try {
      const res = await api.get("/categories/approved");
      setCategories(res.data.categories);
    } catch (error: any) {
      console.error("Error fetching categories:", error.message || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCat();
  }, []);

  if (loading) return <Loading variant="inline" />;

  const initialBatch = categories.slice(0, VISIBLE_THRESHOLD);
  const hiddenBatch = categories.slice(VISIBLE_THRESHOLD);

  return (
    <section className="bg-background py-20 px-4 md:px-8">
      <div className="max-w-[1400px] mx-auto">
        
        {/* EDITORIAL SECTION HEADING */}
        <div className="mb-12 pb-6 border-b border-ui-muted/10">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-[1px] w-6 bg-ui-dark/40" />
            <span className="font-sans text-xs uppercase tracking-widest text-ui-dark font-semibold">Curated Genres</span>
          </div>
          <h2 className="font-serif text-heading text-3xl md:text-4xl font-normal tracking-tight">
            Browse <span className="italic font-light text-ui-muted">Categories</span>
          </h2>
        </div>

        {/* ALWAYS VISIBLE CATEGORIES GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {initialBatch.length > 0 ? (
            initialBatch.map((cat: ICategory) => (
              <Link 
                to={`/all-books?category=${cat.slug || cat._id}`}
                key={cat._id} 
                className="bg-card-bg border border-ui-muted/15 rounded-2xl p-6 text-center transition-all duration-300 hover:border-ui-dark hover:-translate-y-1 hover:shadow-sm flex flex-col items-center justify-center gap-4 min-h-[140px] group select-none outline-none"
              >
                <div className="h-12 w-12 rounded-xl bg-background border border-ui-muted/10 text-ui-muted group-hover:text-ui-dark group-hover:bg-ui-dark/5 flex items-center justify-center transition-all duration-300">
                  {getCategoryIcon(cat.name)}
                </div>
                <span className="font-sans font-semibold text-xs text-heading tracking-wide capitalize transition-colors duration-200 group-hover:text-ui-dark max-w-full truncate px-1">
                  {cat.name}
                </span>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-16 bg-card-bg rounded-2xl border border-dashed border-ui-muted/20">
              <p className="text-ui-muted font-sans text-sm">No categories found.</p>
            </div>
          )}
        </div>

        {/* SMOOTH EXPANDABLE TRAY OVERLAY */}
        <div 
          className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5 transition-all duration-500 ease-in-out overflow-hidden ${
            isExpanded ? "mt-5 opacity-100 max-h-[2000px]" : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
          {hiddenBatch.map((cat: ICategory) => (
            <Link 
              to={`/all-books?category=${cat.slug || cat._id}`}
              key={cat._id} 
              className="bg-card-bg border border-ui-muted/15 rounded-2xl p-6 text-center transition-all duration-300 hover:border-ui-dark hover:-translate-y-1 hover:shadow-sm flex flex-col items-center justify-center gap-4 min-h-[140px] group select-none outline-none"
            >
              <div className="h-12 w-12 rounded-xl bg-background border border-ui-muted/10 text-ui-muted group-hover:text-ui-dark group-hover:bg-ui-dark/5 flex items-center justify-center transition-all duration-300">
                {getCategoryIcon(cat.name)}
              </div>
              <span className="font-sans font-semibold text-xs text-heading tracking-wide capitalize transition-colors duration-200 group-hover:text-ui-dark max-w-full truncate px-1">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>

        {/* ACTION TOGGLE TRIGGER */}
        {categories.length > VISIBLE_THRESHOLD && (
          <div className="mt-14 flex justify-center items-center relative">
            <div className="absolute inset-x-0 h-[1px] bg-ui-muted/10 z-0" />
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="relative z-10 flex items-center gap-2.5 bg-card-bg border border-ui-muted/20 hover:border-ui-dark text-ui-dark font-sans font-semibold text-xs px-6 py-3.5 rounded-full transition-all cursor-pointer shadow-2xs active:scale-95 select-none group"
            >
              <span>{isExpanded ? "Show Less" : "See All Categories"}</span>
              <FiChevronDown 
                className={`text-ui-muted group-hover:text-ui-dark transition-transform duration-300 ease-out ${isExpanded ? "rotate-180" : ""}`} 
                size={14} 
              />
            </button>
          </div>
        )}

      </div>
    </section>
  );
};

export default Categories;