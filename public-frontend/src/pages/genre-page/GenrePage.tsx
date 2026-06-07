import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../../api/axiosInstance";
import Pagination from "../../components/common/Pagination";

export interface IGenre { _id: string; name: string; desc?: string; isApproved: boolean; }

const GenrePage = () => {
  const [searchParams] = useSearchParams();
  const [genres, setGenres] = useState<IGenre[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const globalSearchTerm = searchParams.get("search") || "";

  useEffect(() => { setCurrentPage(1); }, [globalSearchTerm]);

  useEffect(() => {
    const fetchGenres = async () => {
      setLoading(true);
      try {
        const res = await api.get("/genres/approved", {
          params: { page: currentPage, limit: 12, search: globalSearchTerm.trim() || undefined }
        });
        setGenres(res.data.genres || []);
        setMeta(res.data.meta || null);
      } catch (error) {
        console.error("Error fetching genres:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGenres();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage, globalSearchTerm]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* HEADER SECTION (Simplified, natural text) */}
      <div className="mb-10 pb-6 border-b border-gray-100">
        <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">
          {globalSearchTerm ? `Search Results for "${globalSearchTerm}"` : "Book Genres"}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {globalSearchTerm ? "Here is what we found matching your search." : "Find your next read by category."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="border border-gray-100 rounded-2xl p-6 bg-white animate-pulse h-[140px] flex flex-col justify-between">
              <div>
                <div className="h-5 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-full mb-1" />
              </div>
            </div>
          ))
        ) : genres.length > 0 ? (
          genres.map((genre) => (
            <Link 
              to={`/all-books?genre=${genre._id}`}
              key={genre._id} 
              className="border border-gray-100 hover:border-ui-dark/20 rounded-2xl p-6 bg-card-bg/10 hover:bg-white transition-all duration-300 shadow-xs hover:shadow-sm flex flex-col h-[150px] justify-between cursor-pointer group outline-none"
            >
              <div>
                <h3 className="text-base font-bold text-gray-900 group-hover:text-ui-dark transition-colors capitalize tracking-tight">
                  {genre.name}
                </h3>
                <p className="text-xs text-gray-500 mt-2 line-clamp-3 font-medium leading-relaxed">
                  {genre.desc || "Explore our collection of books in this category."}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-20 border border-dashed border-gray-200 rounded-2xl max-w-md mx-auto">
            <p className="text-gray-500 text-sm font-medium">No genres match your search.</p>
          </div>
        )}
      </div>

      {!loading && meta && meta.totalPages > 1 && (
        <Pagination
          currentPage={meta.currentPage}
          totalPages={meta.totalPages}
          hasNextPage={meta.hasNextPage}
          hasPrevPage={meta.hasPrevPage}
          onNextPage={() => meta.hasNextPage && setCurrentPage((prev) => prev + 1)}
          onPrevPage={() => meta.hasPrevPage && setCurrentPage((prev) => prev - 1)}
        />
      )}
    </main>
  );
};

export default GenrePage;