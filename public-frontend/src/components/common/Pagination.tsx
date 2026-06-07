import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onNextPage: () => void;
  onPrevPage: () => void;
}

const Pagination = ({
  currentPage,
  totalPages,
  hasNextPage,
  hasPrevPage,
  onNextPage,
  onPrevPage,
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <nav className="flex justify-between items-center mt-12 pt-6 border-t border-gray-100 select-none">
      <button
        onClick={onPrevPage}
        disabled={!hasPrevPage}
        className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition"
      >
        <FiChevronLeft size={16} />
        <span>Previous</span>
      </button>

      <span className="text-sm font-medium text-gray-500">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={onNextPage}
        disabled={!hasNextPage}
        className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition"
      >
        <span>Next</span>
        <FiChevronRight size={16} />
      </button>
    </nav>
  );
};

export default Pagination;