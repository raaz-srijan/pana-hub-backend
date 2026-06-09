import { useState, useMemo, useEffect } from "react";
import { FiBookmark, FiCheckCircle, FiClock, FiMoreVertical, FiPlus, FiX, FiTrash2, FiAlertCircle } from "react-icons/fi";
import api from "../../api/axiosInstance";
import { DashboardLayoutTemplate } from "../../components/common/Skeleton";

interface Genre {
  _id: string; name: string; desc: string; isApproved: boolean;
  __v: number; createdAt: string; updatedAt: string;
}

const GenresPage = () => {
  // Core Operational Component Pipeline States
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Layout Filtering and Pagination Conditions
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // UI Component State Clustered Flags
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Submission Field References
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // Sync Data Stream with Backend Router Mapping Definitions
  const fetchGenres = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Determine target architectural end-routing layer as per router rules
      let endpoint = "/genres/all";
      if (statusFilter === "approved") endpoint = "/genres/approved";
      if (statusFilter === "pending") endpoint = "/genres/requested";

      const res = await api.get(endpoint, {
        params: {
          page: currentPage,
          limit: pageSize,
          search: searchQuery || undefined // Passes clean downstream keyword strings
        }
      });
      
      if (res.data?.genres) {
        setGenres(res.data.genres);
        setTotalItems(res.data.meta?.totalItems || res.data.genres.length);
      }
    } catch (err: any) {
      console.error("Failed fetching collection records:", err);
      setError(err.response?.data?.message || "Unable to parse semantic layout specifications.");
    } finally {
      setIsLoading(false);
    }
  };

  // Bind side-effect operational triggers
  useEffect(() => {
    fetchGenres();
  }, [currentPage, pageSize, statusFilter, searchQuery]);

  // Matrix Summary Compute Optimization Engine
  const metrics = useMemo(() => {
    const total = genres.length;
    const approved = genres.filter((g) => g.isApproved).length;
    return { total, approved, pending: total - approved };
  }, [genres]);

  // Submit Request Workflow Engine (POST /genres/request)
  const handleCreateGenre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const res = await api.post("/genres/request", {
        name: newName,
        desc: newDesc
      });

      if (res.data?.success) {
        setIsModalOpen(false);
        setNewName("");
        setNewDesc("");
        fetchGenres(); // Trigger full validation reload tracking
      }
    } catch (err: any) {
      console.error("Genre submission fault sequence:", err);
      setError(err.response?.data?.message || "Failed to submit custom layout entry reference.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Authorization Review Hook (PATCH /genres/:id/toggle-approve)
  const handleToggleApprove = async (id: string) => {
    try {
      const res = await api.patch(`/genres/${id}/toggle-approve`);
      if (res.data?.success) {
        setActiveDropdownId(null);
        fetchGenres();
      }
    } catch (err) {
      console.error("Approval cycle state failed:", err);
    }
  };

  // Erase Resource Block Definition Hook (DELETE /genres/:id)
  const handleDeleteGenre = async (id: string) => {
    if (!window.confirm("Are you completely certain you wish to purge this classification tag matrix?")) return;
    try {
      const res = await api.delete(`/genres/${id}`);
      if (res.data?.success) {
        setActiveDropdownId(null);
        fetchGenres();
      }
    } catch (err) {
      console.error("Purging routine execution failed:", err);
    }
  };

  return (
    <>
      {/* Error Boundary Status Anchor */}
      {error && (
        <div className="bg-red-50 border border-danger/20 text-danger px-4 py-3.5 rounded-xl flex items-start gap-3 text-xs mb-4">
          <FiAlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <div className="space-y-0.5">
            <span className="font-bold">Taxonomy Conflict Asserted</span>
            <p className="opacity-90">{error}</p>
          </div>
        </div>
      )}

      <DashboardLayoutTemplate
        title="Product Genres"
        description="Manage sub-category thematic genres, narrative stylings, and filtering matrices."
        syncButtonText="Refresh Ledger Schema"
        isLoading={isLoading}
        onSync={fetchGenres}
        searchQuery={searchQuery}
        onSearchChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
        searchPlaceholder="Search matching unique genre labels or definition entries..."
        filterId="genreStatusFilter"
        filterValue={statusFilter}
        onFilterChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
        filterLabel="Status Check:"
        filterOptions={[
          { value: "all", label: "All Statuses" },
          { value: "approved", label: "Approved Only" },
          { value: "pending", label: "Pending Review" }
        ]}
        tableHeaders={["Genre Label", "Theme Definition Scope", "System Tag Code", "Status", "Actions"]}
        tableMinW="min-w-[850px]"
        hasData={genres.length > 0}
        totalItems={totalItems}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
        itemLabel="genres"
        metrics={[
          { label: "Total Active Genres", value: metrics.total, icon: <FiBookmark size={18} /> },
          { label: "Live / Validated", value: metrics.approved, icon: <FiCheckCircle size={18} />, iconBgClass: "bg-emerald-50 text-success", valueClass: "text-success" },
          { label: "Awaiting Verification", value: metrics.pending, icon: <FiClock size={18} />, iconBgClass: metrics.pending > 0 ? "bg-amber-50 text-warning" : "bg-slate-100 text-slate-400", valueClass: metrics.pending > 0 ? "text-warning" : "" }
        ]}
        actionButton={
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 bg-primary text-white font-sans font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm shadow-indigo-600/10 hover:bg-primary-hover transition-all cursor-pointer select-none"
          >
            <FiPlus className="text-sm" />
            <span>Add New Genre</span>
          </button>
        }
        renderRows={() =>
          genres.map((genre) => (
            <tr key={genre._id} className="hover:bg-slate-50/70 transition-colors group text-xs text-text-main relative">
              <td className="py-4 px-6 font-bold capitalize text-text-main text-sm group-hover:text-primary transition-colors align-middle">
                {genre.name}
              </td>
              
              <td className="py-4 px-6 text-text-muted whitespace-normal leading-relaxed font-medium align-middle max-w-sm">
                {genre.desc || <span className="italic text-text-muted/40 text-[11px]">No definition profile data linked.</span>}
              </td>
              
              <td className="py-4 px-6 align-middle">
                <span className="font-mono text-[10px] text-text-muted bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-sm tracking-wide">
                  #{genre._id.substring(genre._id.length - 8).toUpperCase()}
                </span>
              </td>
              
              <td className="py-4 px-6 text-center align-middle">
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                  genre.isApproved ? "text-success bg-emerald-50 border-emerald-200" : "text-warning bg-amber-50 border-amber-200"
                }`}>
                  <span className={`w-1 h-1 rounded-full ${genre.isApproved ? "bg-success" : "bg-warning"}`} />
                  {genre.isApproved ? "Approved" : "Pending"}
                </span>
              </td>
              
              <td className="py-4 px-6 text-right align-middle relative">
                <div className="inline-block text-left">
                  <button 
                    onClick={() => setActiveDropdownId(activeDropdownId === genre._id ? null : genre._id)}
                    className="text-text-muted hover:text-text-main p-2 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                  >
                    <FiMoreVertical className="text-sm" />
                  </button>

                  {activeDropdownId === genre._id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setActiveDropdownId(null)} />
                      <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-xl z-20 overflow-hidden font-sans text-xs">
                        <button 
                          onClick={() => handleToggleApprove(genre._id)}
                          className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2 font-medium text-text-main transition-colors"
                        >
                          <FiCheckCircle className="text-emerald-500" />
                          <span>{genre.isApproved ? "Revoke Approval" : "Approve Theme"}</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteGenre(genre._id)}
                          className="w-full text-left px-4 py-2.5 hover:bg-red-50 flex items-center gap-2 font-medium text-danger border-t border-slate-100 transition-colors"
                        >
                          <FiTrash2 />
                          <span>Delete Genre</span>
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

      {/* ----------------- SUBMISSION SLIDE DRAWER POPUP OVERLAY ----------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-xl shadow-2xl overflow-hidden font-sans">
            
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FiBookmark className="text-primary text-base" />
                <h3 className="text-sm font-bold text-heading">Submit Narrative Genre Request</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-text-main p-1 rounded-md transition-colors"
              >
                <FiX size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateGenre} className="p-4 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-text-muted uppercase tracking-wider text-[10px]">Genre Target Label *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Cyberpunk, Magical Realism"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-background border border-slate-200 text-text-main p-2.5 rounded-lg focus:outline-none focus:border-primary font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-text-muted uppercase tracking-wider text-[10px]">Theme Definition Scope Summary</label>
                <textarea 
                  rows={4}
                  placeholder="Elaborate on contextual boundaries or focus criteria guidelines..."
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
                  {isSubmitting ? "Processing Schema..." : "Transmit Registration"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
};

export default GenresPage;