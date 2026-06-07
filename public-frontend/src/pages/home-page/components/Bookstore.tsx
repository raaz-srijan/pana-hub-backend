import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import Loading from "../../../components/common/Loading";
import { RiStore2Line, RiVerifiedBadgeFill, RiMapPin2Line } from "react-icons/ri";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface IVendorAddress {
  state: string;
  city: string;
  tole: string;
}

interface IVendor {
  _id: string;
  vendorName: string;
  isVerified: boolean;
  address: IVendorAddress;
}

interface IPaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const Bookstore = () => {
  const [stores, setStores] = useState<IVendor[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Pagination State
  const [page, setPage] = useState<number>(1);
  const [paginationMeta, setPaginationMeta] = useState<IPaginationMeta | null>(null);
  const LIMIT = 6; 

  const fetchStores = async (currentPage: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/vendors/verified?page=${currentPage}&limit=${LIMIT}`);
      setStores(res.data.vendors);
      setPaginationMeta(res.data.pagination);
    } catch (error) {
      console.error("Error fetching stores:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores(page);
  }, [page]); 

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" }); 
  };

  if (loading && stores.length === 0) return <Loading variant="inline" />;

  return (
    <section className="bg-background min-h-screen py-24 px-4 md:px-8">
      <div className="max-w-[1400px] mx-auto">
        
        {/* EDITORIAL SECTION HEADING */}
        <div className="mb-14 pb-6 border-b border-ui-muted/10">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-[1px] w-6 bg-ui-dark/40" />
            <span className="font-sans text-xs uppercase tracking-widest text-ui-dark font-semibold">Distribution Networks</span>
          </div>
          <h2 className="font-serif text-heading text-3xl md:text-4xl font-normal tracking-tight">
            Featured <span className="italic font-light text-ui-muted">Bookstores</span>
          </h2>
        </div>

        {/* BOOKSTORES GRID INTERFACE */}
        <div className="relative min-h-[300px]">
          {/* Refined backdrop mask overlay when page shifting */}
          {loading && (
            <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-2xl transition-all" />
          )}

          {stores.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.map((store: IVendor) => (
                <div 
                  key={store._id} 
                  className="bg-card-bg border border-ui-muted/15 p-6 rounded-2xl transition-all duration-300 hover:border-ui-muted/30 hover:shadow-md flex flex-col justify-between group h-[180px]"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Smooth morphing minimalist icon container */}
                        <div className="w-11 h-11 rounded-xl bg-background border border-ui-muted/10 text-ui-muted flex items-center justify-center shrink-0 group-hover:bg-ui-dark group-hover:text-card-bg group-hover:border-ui-dark transition-all duration-300 shadow-2xs">
                          <RiStore2Line className="w-5 h-5" />
                        </div>
                        <h3 className="font-serif font-medium text-lg leading-snug capitalize text-heading truncate group-hover:text-ui-muted transition-colors">
                          {store.vendorName}
                        </h3>
                      </div>

                      {/* Clean line/glass validation label */}
                      {store.isVerified && (
                        <span className="flex items-center gap-1 bg-background/90 text-blue-600 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-lg border border-blue-100 shadow-3xs shrink-0 select-none">
                          <RiVerifiedBadgeFill className="w-3.5 h-3.5 text-blue-500" />
                          Verified
                        </span>
                      )}
                    </div>
                    
                    {/* Clean contextual map container */}
                    <div className="flex items-start gap-2.5 text-ui-muted text-xs border-t border-ui-muted/5 pt-4 mt-3">
                      <RiMapPin2Line className="w-4 h-4 text-ui-muted/60 mt-0.5 shrink-0" />
                      <p className="font-sans leading-relaxed text-ui-muted font-normal truncate">
                        <span className="capitalize text-heading font-medium">{store.address.tole}</span>,{" "}
                        <span className="capitalize">{store.address.city}</span>,{" "}
                        <span className="capitalize text-[10px] tracking-wide font-bold text-ui-muted bg-background border border-ui-muted/10 px-2 py-0.5 rounded-md ml-1">
                          {store.address.state}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-card-bg rounded-2xl border border-dashed border-ui-muted/20 max-w-xl mx-auto">
              <p className="text-ui-muted font-sans text-sm">No verified partner bookstores found near your location.</p>
            </div>
          )}
        </div>

        {/* REFINED PAGINATION UI MODULE */}
        {paginationMeta && paginationMeta.totalPages > 1 && (
          <div className="mt-16 flex items-center justify-center gap-2 border-t border-ui-muted/10 pt-8 relative">
            
            {/* Prev Page Button */}
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={!paginationMeta.hasPrevPage}
              className="w-10 h-10 rounded-xl border border-ui-muted/20 flex items-center justify-center text-ui-dark hover:bg-ui-dark hover:text-white disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-ui-dark disabled:cursor-not-allowed transition-all duration-200 cursor-pointer shadow-3xs"
              aria-label="Go to previous portal page"
            >
              <FiChevronLeft size={16} />
            </button>

            {/* Dynamic Numeric Page Selector Sequence */}
            {Array.from({ length: paginationMeta.totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`w-10 h-10 rounded-xl font-sans text-xs font-bold transition-all duration-200 cursor-pointer ${
                  page === pageNum
                    ? "bg-ui-dark text-card-bg shadow-2xs border border-ui-dark"
                    : "border border-ui-muted/15 bg-card-bg text-ui-muted hover:border-ui-dark hover:text-ui-dark"
                }`}
              >
                {pageNum}
              </button>
            ))}

            {/* Next Page Button */}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={!paginationMeta.hasNextPage}
              className="w-10 h-10 rounded-xl border border-ui-muted/20 flex items-center justify-center text-ui-dark hover:bg-ui-dark hover:text-white disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-ui-dark disabled:cursor-not-allowed transition-all duration-200 cursor-pointer shadow-3xs"
              aria-label="Go to next portal page"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Bookstore;