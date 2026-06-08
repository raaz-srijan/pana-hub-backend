import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../api/axiosInstance";
import Pagination from "../../components/common/Pagination";

export interface ICategory { _id: string; name: string; desc?: string; isApproved: boolean; }

const CategoryPage = () => {
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const globalSearchTerm = searchParams.get("search") || "";

  useEffect(() => { setCurrentPage(1); }, [globalSearchTerm]);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await api.get("/categories/approved", {
          params: { page: currentPage, limit: 12, search: globalSearchTerm.trim() || undefined }
        });
        setCategories(res.data.categories || []);
        setMeta(res.data.meta || null);
      } catch (error) {
        console.error("Error fetching category configurations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage, globalSearchTerm]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 pb-6 border-b border-gray-100">
        <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">
          {globalSearchTerm ? `Search Results for "${globalSearchTerm}"` : "Product Categories"}
        </h1>
        <p className="text-gray-500 text-sm mt-1">Filter inventory item collections by administrative domain.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="border border-gray-100 rounded-2xl p-6 bg-white animate-pulse h-[140px] flex flex-col justify-between">
              <div>
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-full mb-1" />
              </div>
            </div>
          ))
        ) : categories.length > 0 ? (
          categories.map((category) => (
            <div key={category._id} className="border border-gray-100 hover:border-ui-dark/20 rounded-2xl p-6 bg-card-bg/10 hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between cursor-pointer">
              <div>
                <h3 className="text-base font-bold text-gray-900 capitalize tracking-tight">{category.name}</h3>
                <p className="text-xs text-gray-500 mt-2 line-clamp-3 font-medium leading-relaxed">{category.desc || "No comprehensive summary description provided for this collection."}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20 border border-dashed border-gray-200 rounded-2xl max-w-md mx-auto">
            <p className="text-gray-500 text-sm font-medium">No category structures match your keyword query.</p>
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

export default CategoryPage;