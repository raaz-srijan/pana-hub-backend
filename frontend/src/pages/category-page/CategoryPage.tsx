import { useState, useMemo, useEffect } from "react";
import { FiLayers, FiCheckCircle, FiClock, FiMoreVertical, FiAlertCircle, FiPlus, FiX, FiTrash2 } from "react-icons/fi";
import api from "../../api/axiosInstance";
import { DashboardLayoutTemplate } from "../../components/common/Skeleton";

interface Category {
  _id: string; name: string; desc: string; isApproved: boolean;
  __v: number; createdAt: string; updatedAt: string;
}

const CategoriesPage = () => {
  // Operational Pipeline States
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filtering & Pagination Control Tracking States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Layout Layer Toggles
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Custom Form Submission Payload References
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // Connect components directly with backend paginated query routers
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Select matching backend base route depending on filter selection matrix
      let endpoint = "/categories/all";
      if (statusFilter === "approved") endpoint = "/categories/approved";
      if (statusFilter === "pending") endpoint = "/categories/requested";

      const res = await api.get(endpoint, {
        params: {
          page: currentPage,
          limit: pageSize,
          search: searchQuery || undefined
        }
      });

      if (res.data?.categories) {
        setCategories(res.data.categories);
        setTotalItems(res.data.meta?.totalItems || res.data.categories.length);
      }
    } catch (err: any) {
      console.error("Failed fetching categories:", err);
      setError(err.response?.data?.message || "Unable to load category taxonomies. Please check networking pipes.");
    } finally {
      setIsLoading(false);
    }
  };

  // Bind side-effects parameters hook
  useEffect(() => {
    fetchCategories();
  }, [currentPage, pageSize, statusFilter, searchQuery]);

  // System Matrix Summary Compute Engine
  const metrics = useMemo(() => {
    const total = categories.length;
    const approved = categories.filter((c) => c.isApproved).length;
    return { total, approved, pending: total - approved };
  }, [categories]);

  // Handle Schema Addition Workflow Submission (POST /categories/request)
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const res = await api.post("/categories/request", {
        name: newName,
        desc: newDesc
      });

      if (res.data?.success) {
        setIsModalOpen(false);
        setNewName("");
        setNewDesc("");
        fetchCategories(); // Reload clean tracking ledger index
      }
    } catch (err: any) {
      console.error("Category request failed to submit:", err);
      setError(err.response?.data?.message || "Failed to submit category schema entry payload.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Authorization Validation Lifecycle Hook (PATCH /categories/:id/toggle-approve)
  const handleToggleApprove = async (id: string) => {
    try {
      const res = await api.patch(`/categories/${id}/toggle-approve`);
      if (res.data?.success) {
        setActiveDropdownId(null);
        fetchCategories();
      }
    } catch (err) {
      console.error("Approval state modification failure:", err);
    }
  };

  // Structural Resource Purging Logic Handler (DELETE /categories/:id)
  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Are you confident you want to wipe out this department taxonomic entity node?")) return;
    try {
      const res = await api.delete(`/categories/${id}`);
      if (res.data?.success) {
        setActiveDropdownId(null);
        fetchCategories();
      }
    } catch (err) {
      console.error("Purging runtime error execution:", err);
    }
  };

  return (
    <>
      {/* Native Internal Component Error Layout Handle block */}
      {error && (
        <div className="bg-red-50 border border-danger/20 text-danger px-4 py-3.5 rounded-xl flex items-start gap-3 text-xs mb-4">
          <FiAlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <div className="space-y-0.5">
            <span className="font-bold">Taxonomy Modification Halt</span>
            <p className="opacity-90">{error}</p>
          </div>
        </div>
      )}

      <DashboardLayoutTemplate
        title="Product Categories"
        description="Manage global department divisions, structural taxonomies, and catalog classifications."
        syncButtonText="Refresh Schema"
        isLoading={isLoading}
        onSync={fetchCategories}
        actionButton={
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 bg-primary text-white font-sans font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm shadow-indigo-600/10 hover:bg-primary-hover transition-all cursor-pointer select-none"
          >
            <FiPlus className="text-sm" />
            <span>Add Category</span>
          </button>
        }
        searchQuery={searchQuery}
        onSearchChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
        searchPlaceholder="Search category name or description metadata phrases..."
        filterId="categoryFilter"
        filterValue={statusFilter}
        onFilterChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
        filterLabel="Status Check:"
        filterOptions={[
          { value: "all", label: "All Statuses" },
          { value: "approved", label: "Approved Only" },
          { value: "pending", label: "Pending Review" }
        ]}
        tableHeaders={["Classification Label", "Scope Description", "System Identity Code", "Authorization", "Actions"]}
        tableMinW="min-w-[850px]"
        hasData={categories.length > 0}
        totalItems={totalItems}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
        itemLabel="categories"
        metrics={[
          { label: "Total Taxonomies", value: metrics.total, icon: <FiLayers size={18} /> },
          { label: "Active & Approved", value: metrics.approved, icon: <FiCheckCircle size={18} />, iconBgClass: "bg-emerald-50 text-success", valueClass: "text-success" },
          { label: "Pending Review", value: metrics.pending, icon: <FiClock size={18} />, iconBgClass: metrics.pending > 0 ? "bg-amber-50 text-warning" : "bg-slate-100 text-slate-400", valueClass: metrics.pending > 0 ? "text-warning" : "" }
        ]}
        renderRows={() =>
          categories.map((category) => (
            <tr key={category._id} className="hover:bg-slate-50/70 transition-colors group text-xs text-text-main relative">
              <td className="py-4 px-6 font-bold capitalize text-text-main text-sm group-hover:text-primary transition-colors align-middle">
                {category.name}
              </td>
              
              <td className="py-4 px-6 text-text-muted whitespace-normal leading-relaxed font-medium align-middle max-w-sm">
                {category.desc || <span className="italic text-text-muted/40 text-[11px]">No contextual summary description attached.</span>}
              </td>
              
              <td className="py-4 px-6 align-middle">
                <span className="font-mono text-[10px] text-text-muted bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-sm tracking-wide">
                  #{category._id.substring(category._id.length - 8).toUpperCase()}
                </span>
              </td>
              
              <td className="py-4 px-6 text-center align-middle">
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                  category.isApproved ? "text-success bg-emerald-50 border-emerald-200" : "text-warning bg-amber-50 border-amber-200"
                }`}>
                  <span className={`w-1 h-1 rounded-full ${category.isApproved ? "bg-success" : "bg-warning"}`} />
                  {category.isApproved ? "Approved" : "Pending"}
                </span>
              </td>
              
              <td className="py-4 px-6 text-right align-middle relative">
                <div className="inline-block text-left">
                  <button 
                    onClick={() => setActiveDropdownId(activeDropdownId === category._id ? null : category._id)}
                    className="text-text-muted hover:text-text-main p-2 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                  >
                    <FiMoreVertical className="text-sm" />
                  </button>

                  {activeDropdownId === category._id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setActiveDropdownId(null)} />
                      <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-xl z-20 overflow-hidden font-sans text-xs">
                        <button 
                          onClick={() => handleToggleApprove(category._id)}
                          className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2 font-medium text-text-main transition-colors"
                        >
                          <FiCheckCircle className="text-emerald-500" />
                          <span>{category.isApproved ? "Revoke Approval" : "Approve Division"}</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(category._id)}
                          className="w-full text-left px-4 py-2.5 hover:bg-red-50 flex items-center gap-2 font-medium text-danger border-t border-slate-100 transition-colors"
                        >
                          <FiTrash2 />
                          <span>Delete Category</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))
        }
      />

      {/* ----------- INLINE POPUP DRAWER ADD CATEGORY SELECTION ARCHITECTURE ----------- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-xl shadow-2xl overflow-hidden font-sans">
            
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FiLayers className="text-primary text-base" />
                <h3 className="text-sm font-bold text-heading">Submit Structural Taxonomy Division</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-text-main p-1 rounded-md transition-colors"
              >
                <FiX size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="p-4 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-text-muted uppercase tracking-wider text-[10px]">Classification Label Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Fiction, Non-Fiction, Biographies"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-background border border-slate-200 text-text-main p-2.5 rounded-lg focus:outline-none focus:border-primary font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-text-muted uppercase tracking-wider text-[10px]">Scope Description Metadata</label>
                <textarea 
                  rows={4}
                  placeholder="Define scope limits or architectural categorization boundaries summary rules..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-background border border-slate-200 text-text-main p-2.5 rounded-lg focus:outline-none focus:border-primary font-medium resize-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-100 border border-slate-200 text-text-main font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-hover disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  {isSubmitting ? "Running Index Updates..." : "Request Schema Addition"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CategoriesPage;