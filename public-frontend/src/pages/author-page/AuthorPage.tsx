import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../api/axiosInstance";
import Pagination from "../../components/common/Pagination";

export interface IAuthor {
  _id: string;
  name: string;
  bio?: string;
  image?: { imageUrl: string; publicUrl: string };
  isVerified: boolean;
}

const AuthorPage = () => {
  const [searchParams] = useSearchParams();
  const [authors, setAuthors] = useState<IAuthor[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const globalSearchTerm = searchParams.get("search") || "";

  useEffect(() => { setCurrentPage(1); }, [globalSearchTerm]);

  useEffect(() => {
    const fetchAuthors = async () => {
      setLoading(true);
      try {
        const res = await api.get("/authors/verified", {
          params: { page: currentPage, limit: 12, search: globalSearchTerm.trim() || undefined }
        });
        setAuthors(res.data.authors || []);
        setMeta(res.data.meta || null);
      } catch (error) {
        console.error("Error fetching author directory data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAuthors();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage, globalSearchTerm]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 pb-6 border-b border-gray-100">
        <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">
          {globalSearchTerm ? `Search Results for "${globalSearchTerm}"` : "Meet Our Authors"}
        </h1>
        <p className="text-gray-500 text-sm mt-1">Discover incredible storytellers from across our platform.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {loading ? (
          Array.from({ length: 12 }).map((_, idx) => (
            <div key={idx} className="flex flex-col items-center text-center animate-pulse">
              <div className="w-24 h-24 bg-gray-200 rounded-full mb-3" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))
        ) : authors.length > 0 ? (
          authors.map((author) => (
            <div key={author._id} className="flex flex-col items-center text-center group border border-transparent hover:border-gray-100 rounded-2xl p-4 transition-all duration-300">
              <img
                src={author.image?.imageUrl || "https://via.placeholder.com/150"}
                alt={author.name}
                className="w-24 h-24 object-cover rounded-full shadow-sm group-hover:scale-105 transition-transform duration-300 bg-gray-50 mb-3"
              />
              <h3 className="text-sm font-semibold text-gray-900 capitalize line-clamp-1">{author.name}</h3>
              <p className="text-xs text-gray-400 mt-1 line-clamp-2 px-1">{author.bio || "No biography info added yet."}</p>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20 border border-dashed border-gray-200 rounded-2xl max-w-md mx-auto">
            <p className="text-gray-500 text-sm font-medium">No authors found matching your criteria.</p>
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

export default AuthorPage;