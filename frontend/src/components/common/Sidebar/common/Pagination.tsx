import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiChevronsLeft, 
  FiChevronsRight 
} from "react-icons/fi";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
}

export const Pagination = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 15, 25],
  itemLabel = "items"
}: PaginationProps) => {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const handlePageChange = (targetPage: number) => {
    if (targetPage >= 1 && targetPage <= totalPages) {
      onPageChange(targetPage);
    }
  };

  const startRecord = totalItems ? (currentPage - 1) * pageSize + 1 : 0;
  const endRecord = Math.min(currentPage * pageSize, totalItems);

  // Generate dynamic pagination page numbers to avoid breaking space on massive offsets
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisiblePages = 3;
    let start = Math.max(1, currentPage - 1);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 bg-card-bg border-t border-slate-200 mt-2 rounded-b-xl font-sans text-sm">
      
      {/* Left side: Meta details & Row Selector */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-text-muted">
        <div className="flex items-center gap-2">
          <label htmlFor="pageSizeSelector" className="text-xs font-medium whitespace-nowrap">
            Rows per page:
          </label>
          <select
            id="pageSizeSelector"
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1); // Safely reset back to front-page on count changes
            }}
            className="bg-background border border-slate-200 text-text-main rounded-md px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer transition-all"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs font-medium">
          Showing <span className="font-bold text-text-main">{startRecord}</span> to{" "}
          <span className="font-bold text-text-main">{endRecord}</span> of{" "}
          <span className="font-bold text-text-main">{totalItems}</span> {itemLabel}
        </span>
      </div>

      {/* Right side: Directional Navigation Controls */}
      <div className="flex items-center gap-1.5">
        
        {/* Double Prev (Jump to First) */}
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-md border border-slate-200 text-text-muted hover:text-text-main hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-text-muted transition-colors cursor-pointer disabled:cursor-not-allowed"
          title="First Page"
        >
          <FiChevronsLeft size={16} />
        </button>

        {/* Prev Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-md border border-slate-200 text-text-muted hover:text-text-main hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-text-muted transition-colors cursor-pointer disabled:cursor-not-allowed"
          title="Previous Page"
        >
          <FiChevronLeft size={16} />
        </button>

        {/* Dynamic Context Page Buttons */}
        <div className="flex items-center gap-1 mx-1">
          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`min-w-[32px] h-8 px-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                currentPage === page
                  ? "bg-primary text-white shadow-sm shadow-indigo-600/10"
                  : "text-text-main hover:bg-slate-100 border border-transparent hover:border-slate-200"
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-md border border-slate-200 text-text-muted hover:text-text-main hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-text-muted transition-colors cursor-pointer disabled:cursor-not-allowed"
          title="Next Page"
        >
          <FiChevronRight size={16} />
        </button>

        {/* Double Next (Jump to Last) */}
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-md border border-slate-200 text-text-muted hover:text-text-main hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-text-muted transition-colors cursor-pointer disabled:cursor-not-allowed"
          title="Last Page"
        >
          <FiChevronsRight size={16} />
        </button>

      </div>
    </div>
  );
};