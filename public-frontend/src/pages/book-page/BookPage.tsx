import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../api/axiosInstance";
import Pagination from "../../components/common/Pagination";
import type { IBook } from "../../components/books/BookCard";
import BookCard from "../../components/books/BookCard";

interface IPaginationMeta {
  totalBooks: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const BookPage = () => {
  const [searchParams] = useSearchParams();
  const [books, setBooks] = useState<IBook[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [meta, setMeta] = useState<IPaginationMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 1. Intercept search text from global Navbar via URL params state
  const globalSearchTerm = searchParams.get("search") || "";

  // 2. Reset back to the first page when a new global search is initiated
  useEffect(() => {
    setCurrentPage(1);
  }, [globalSearchTerm]);

  const fetchBooks = async (page: number, search: string) => {
    setLoading(true);
    try {
      // 3. Dynamically pass both page values and global search tokens through Axios query params
      const res = await api.get("/books/public", {
        params: {
          page,
          limit: 12,
          search: search.trim() || undefined // Only append to query string if text exists
        }
      });
      setBooks(res.data.books || []);
      setMeta(res.data.meta || null);
    } catch (error) {
      console.error("Error fetching book inventory data:", error);
    } finally {
      setLoading(false);
    }
  };

  // 4. Listen to both pagination shifts and global search execution triggers
  useEffect(() => {
    fetchBooks(currentPage, globalSearchTerm);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage, globalSearchTerm]);

  const handleNextPage = () => {
    if (meta?.hasNextPage) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    // Fixed: Decrement state to move backward in pagination
    if (meta?.hasPrevPage) setCurrentPage((prev) => prev - 1); 
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Search Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">
            {globalSearchTerm ? `Search Results for "${globalSearchTerm}"` : "Explore Books"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Browse through our network of verified independent vendors.
          </p>
        </div>

        {/* 
          NOTE: Localized layout input container was intentionally stripped out 
          to avoid rendering duplicate text field boxes parallel to your new global NavSearch element.
        */}
      </div>

      {/* Grid Layout Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="border border-gray-100 rounded-2xl p-4 bg-white flex flex-col justify-between animate-pulse h-[440px]">
              <div>
                <div className="w-full bg-gray-200 rounded-xl aspect-[3/4] mb-4" />
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
              </div>
              <div className="h-10 bg-gray-200 rounded-xl w-full" />
            </div>
          ))
        ) : books.length > 0 ? (
          books.map((book: IBook) => (
            <BookCard key={book._id} book={book} />
          ))
        ) : (
          <div className="col-span-full text-center py-20 border border-dashed border-gray-200 rounded-2xl max-w-md mx-auto">
            <p className="text-gray-500 text-sm font-medium">No results found matching your criteria.</p>
          </div>
        )}
      </div>

      {!loading && meta && meta.totalPages > 1 && (
        <Pagination
          currentPage={meta.currentPage}
          totalPages={meta.totalPages}
          hasNextPage={meta.hasNextPage}
          hasPrevPage={meta.hasPrevPage}
          onNextPage={handleNextPage}
          onPrevPage={handlePrevPage}
        />
      )}
    </main>
  );
};

export default BookPage;