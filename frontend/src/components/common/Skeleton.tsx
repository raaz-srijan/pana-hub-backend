import { FiSearch, FiRefreshCw, FiXCircle } from "react-icons/fi";
import { Pagination } from "./Sidebar/common/Pagination";
import type { ReactNode } from "react";
import { TableRowSkeleton } from "./TableRow";

interface MetricsItem {
  label: string;
  value: string | number;
  icon: ReactNode;
  iconBgClass?: string;
  valueClass?: string;
  pulseAlert?: boolean;
}

interface DashboardLayoutTemplateProps {
  title: string;
  description: string;
  syncButtonText: string;
  actionButton?: React.ReactNode; // Enabled in Props Definition
  isLoading: boolean;
  onSync: () => void;
  
  // Metrics Configuration
  metrics: MetricsItem[];
  
  // Search & Filter Workbench
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterId: string;
  filterValue: string;
  onFilterChange: (value: string) => void;
  filterLabel?: string;
  filterOptions: { value: string; label: string; }[];
  
  // Grid / Table Properties
  tableHeaders: string[];
  tableMinW?: string;
  hasData: boolean;
  renderRows: () => ReactNode;
  emptyIcon?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  
  // Pagination Integration
  totalItems: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
}

export const DashboardLayoutTemplate = ({
  title,
  description,
  syncButtonText,
  actionButton, // Destructured for consumption
  isLoading,
  onSync,
  metrics,
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search matching entries...",
  filterId,
  filterValue,
  onFilterChange,
  filterLabel = "Filter Status:",
  filterOptions,
  tableHeaders,
  tableMinW = "min-w-[950px]",
  hasData,
  renderRows,
  emptyIcon = <FiXCircle className="text-3xl mx-auto mb-3 text-text-muted/40" />,
  emptyTitle = "No matched data assets found",
  emptyDescription = "Try adjusting your search queries or clearing active status filters.",
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  itemLabel = "items"
}: DashboardLayoutTemplateProps) => {
  return (
    <div className="dashboard-container space-y-6">
      
      {/* 1. Page Header Shell */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-heading">{title}</h1>
          <p className="text-xs text-text-muted mt-0.5">{description}</p>
        </div>
        
        {/* Actions Cluster layout container grouped for mobile wrapping alignment */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto w-full sm:w-auto justify-end">
          <button 
            onClick={onSync}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 bg-background border border-slate-200 text-text-main font-sans font-semibold text-xs px-4 py-2.5 rounded-lg shadow-xs hover:bg-slate-50 disabled:opacity-50 transition-all cursor-pointer select-none"
          >
            <FiRefreshCw className={`text-sm ${isLoading ? "animate-spin" : ""}`} />
            <span>{syncButtonText}</span>
          </button>

          {/* Renders custom "+ Request / + Add" action buttons dynamically passed from pages */}
          {actionButton}
        </div>
      </div>

      {/* 2. Analytics Metric Cards Grid Layout */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(metrics.length, 4)} gap-4`}>
        {metrics.map((item, idx) => (
          <div key={idx} className="bg-card-bg border border-slate-200 p-4 rounded-xl flex items-center gap-4 shadow-xs">
            <div className={`p-3 rounded-lg ${item.iconBgClass || "bg-slate-100 text-text-muted"}`}>
              {item.icon}
            </div>
            <div>
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">{item.label}</span>
              <span className={`text-xl font-bold font-sans mt-0.5 block ${item.valueClass || "text-text-main"}`}>
                {isLoading ? "---" : item.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Universal Filtering & Search Controls Row */}
      <div className="bg-card-bg border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="w-full md:max-w-md relative">
          <FiSearch className="absolute top-1/2 left-3.5 -translate-y-1/2 text-text-muted text-base" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full bg-background border border-slate-200 text-text-main text-xs pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary placeholder:text-text-muted/60 transition-all font-sans font-medium"
          />
        </div>

        <div className="w-full md:w-auto flex items-center gap-2 justify-end">
          <label htmlFor={filterId} className="text-xs font-semibold text-text-muted hidden sm:inline whitespace-nowrap">{filterLabel}</label>
          <select
            id={filterId}
            value={filterValue}
            onChange={(e) => onFilterChange(e.target.value)}
            className="w-full sm:w-44 bg-background border border-slate-200 text-text-main text-xs font-semibold px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary cursor-pointer transition-all"
          >
            {filterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Canvas Sheet Table Grid */}
      <div className="bg-card-bg border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="w-full overflow-x-auto scrollbar-dashboard">
          <table className={`w-full text-left border-collapse ${tableMinW}`}>
            <thead>
              <tr className="bg-slate-50 text-text-muted text-[10px] font-bold tracking-widest uppercase border-b border-slate-200">
                {tableHeaders.map((header, idx) => (
                  <th 
                    key={idx} 
                    className={`py-3.5 px-6 
                      ${header.toLowerCase().includes("price") || header.toLowerCase().includes("yield") ? "text-right" : ""} 
                      ${header.toLowerCase().includes("status") || header.toLowerCase().includes("milestone") || header.toLowerCase().includes("settlement") || header.toLowerCase().includes("display") || header.toLowerCase().includes("remaining") ? "text-center" : ""}
                      ${header.toLowerCase().includes("actions") ? "text-right" : ""}
                    `}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <TableRowSkeleton columnCount={tableHeaders.length} rowCount={3} />
              ) : hasData ? (
                renderRows()
              ) : (
                <tr>
                  <td colSpan={tableHeaders.length} className="py-16 text-center text-text-muted bg-slate-50/30">
                    {emptyIcon}
                    <span className="block text-sm font-bold text-text-main">{emptyTitle}</span>
                    <p className="text-xs text-text-muted mt-1">{emptyDescription}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination Execution Controls */}
        {!isLoading && hasData && (
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            pageSizeOptions={pageSizeOptions}
            itemLabel={itemLabel}
          />
        )}
      </div>
    </div>
  );
};