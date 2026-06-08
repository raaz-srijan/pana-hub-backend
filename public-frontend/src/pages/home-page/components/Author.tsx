import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; 
import api from "../../../api/axiosInstance";
import Loading from "../../../components/common/Loading";
import { RiUser3Line, RiVerifiedBadgeFill } from "react-icons/ri";
import { FiArrowRight } from "react-icons/fi";

interface IAuthor {
  _id: string;
  name: string;
  bio: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

const Author = () => {
  const [authors, setAuthors] = useState<IAuthor[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  const fetchAuthors = async () => {
    setLoading(true);
    try {
      const res = await api.get("/authors/verified");
      setAuthors(res.data.authors || []);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  if (loading) return <Loading variant="inline" />;

  return (
    <section className="bg-background py-24 px-4 md:px-8">
      <div className="max-w-[1400px] mx-auto">
        
        <div className="mb-14 pb-6 border-b border-ui-muted/10">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-[1px] w-6 bg-ui-dark/40" />
            <span className="font-sans text-xs uppercase tracking-widest text-ui-dark font-semibold">Meet the Writers</span>
          </div>
          <h2 className="font-serif text-heading text-3xl md:text-4xl font-normal tracking-tight">
            Popular <span className="italic font-light text-ui-muted">Authors</span>
          </h2>
        </div>

        {/* AUTHORS GRID INTERFACE */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {authors.length > 0 ? (
            authors.map((author: IAuthor) => (
              <Link 
                to={`/all-books?author=${author._id}`}
                key={author._id} 
                className="bg-card-bg border border-ui-muted/15 p-6 rounded-2xl transition-all duration-300 hover:border-ui-dark hover:shadow-md flex flex-col justify-between group h-[240px] outline-none"
              >
                <div>
                  {/* Top Profile Header Block */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Avatar Mock Container */}
                      <div className="w-11 h-11 rounded-full bg-background border border-ui-muted/10 text-ui-muted flex items-center justify-center shrink-0 group-hover:bg-ui-dark group-hover:text-card-bg group-hover:border-ui-dark transition-all duration-300 shadow-2xs">
                        <RiUser3Line className="w-4 h-4" />
                      </div>
                      <h3 className="font-serif font-medium text-lg leading-snug text-heading truncate group-hover:text-ui-dark transition-colors">
                        {author.name}
                      </h3>
                    </div>

                    {/* Validation Stamp */}
                    {author.isVerified && (
                      <span 
                        className="flex items-center gap-1 bg-background/90 text-blue-600 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-lg border border-blue-100 shadow-3xs shrink-0 select-none"
                        title="Verified Author Profile"
                      >
                        <RiVerifiedBadgeFill className="w-3.5 h-3.5 text-blue-500" />
                        Verified
                      </span>
                    )}
                  </div>
                  
                  {/* Biography Segment */}
                  <div className="border-t border-ui-muted/5 pt-4 mt-3">
                    {/* Simplified placeholder copy to make it look less artificial */}
                    <p className="font-sans text-xs md:text-sm text-ui-muted leading-relaxed font-normal line-clamp-3">
                      {author.bio || "Biography details coming soon for this writer."}
                    </p>
                  </div>
                </div>

                {/* Micro-Interactive Link Prompt */}
                <div className="pt-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-sans font-bold tracking-wider uppercase text-ui-dark select-none">
                    <span>View Books</span>
                    <FiArrowRight size={12} className="transform group-hover:translate-x-1.5 transition-transform duration-200 text-ui-dark" />
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-20 bg-card-bg rounded-2xl border border-dashed border-ui-muted/20 max-w-xl mx-auto col-span-full">
              <p className="text-ui-muted font-sans text-sm">No authors found at this time.</p>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};

export default Author;