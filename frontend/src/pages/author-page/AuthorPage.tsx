import { useState, useMemo, useEffect } from "react";
import { FiUsers, FiCheckCircle, FiClock, FiMoreVertical, FiPlus, FiX, FiUpload, FiTrash2 } from "react-icons/fi";
import api from "../../api/axiosInstance";
import { DashboardLayoutTemplate } from "../../components/common/Skeleton";

interface Author {
  _id: string; name: string; bio: string;
  image?: { imageUrl: string; publicUrl: string; };
  isVerified: boolean; __v: number; createdAt: string; updatedAt: string;
}

const AuthorPage = () => {
  // Core Operational States
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Filtering and Layout State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Modal Control Sub-States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  
  // Interactive Form Capture States
  const [newName, setNewName] = useState("");
  const [newBio, setNewBio] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Sync with Backend Routing Schema Dynamically
  const fetchAuthors = async () => {
    try {
      setIsLoading(true);
      
      // Select the correct backend base endpoint based on your status rules
      let endpoint = "/authors";
      if (statusFilter === "verified") endpoint = "/authors/verified";
      if (statusFilter === "pending") endpoint = "/authors/unverified";

      const res = await api.get(endpoint, {
        params: {
          page: currentPage,
          limit: pageSize,
          search: searchQuery || undefined
        }
      });
      
      if (res.data?.success) {
        setAuthors(res.data.authors || []);
        setTotalItems(res.data.meta?.totalItems || res.data.authors.length);
      }
    } catch (error: any) {
      console.error("Failed fetching library creator items:", error?.message || error);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger content sync on parameter mutations
  useEffect(() => {
    fetchAuthors();
  }, [currentPage, pageSize, statusFilter, searchQuery]);

  // Track page metrics across metrics cards layout
  const metrics = useMemo(() => {
    const total = authors.length;
    const verified = authors.filter((a) => a.isVerified).length;
    return { total, verified, unverified: total - verified };
  }, [authors]);

  // Form Submissions Handling Multi-part Request
  const handleCreateAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      setIsSubmitting(true);
      
      // Construct Multi-part context envelope for server-side upload middleware parsing
      const formData = new FormData();
      formData.append("name", newName);
      formData.append("bio", newBio);
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      const res = await api.post("/authors", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.status === 201) {
        setIsModalOpen(false);
        setNewName("");
        setNewBio("");
        setSelectedFile(null);
        fetchAuthors(); // Trigger reload context loop
      }
    } catch (err) {
      console.error("Submission pipeline failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Verification Action (PATCH /authors/:id/toggle-verify)
  const handleToggleVerify = async (id: string) => {
    try {
      const res = await api.patch(`/authors/${id}/toggle-verify`);
      if (res.data?.success) {
        setActiveDropdownId(null);
        fetchAuthors();
      }
    } catch (err) {
      console.error("Verification processing failed:", err);
    }
  };

  // Destructive Action Processing (DELETE /authors/:id)
  const handleDeleteAuthor = async (id: string) => {
    if (!window.confirm("Are you sure you want to completely erase this author resource node?")) return;
    try {
      const res = await api.delete(`/authors/${id}`);
      if (res.data?.success) {
        setActiveDropdownId(null);
        fetchAuthors();
      }
    } catch (err) {
      console.error("Deletion processor failed:", err);
    }
  };

  const getInitials = (name: string) => {
    return name ? name.trim().charAt(0).toUpperCase() : "?";
  };

  return (
    <>
      <DashboardLayoutTemplate
        title="Catalog Authors"
        description="Manage professional writer profiles, historical biographies, and authority credentials."
        syncButtonText="Force Sync Index"
        isLoading={isLoading}
        onSync={fetchAuthors}
        searchQuery={searchQuery}
        onSearchChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
        searchPlaceholder="Search matching writer name or profile bibliography strings..."
        filterId="statusFilter"
        filterValue={statusFilter}
        onFilterChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
        filterLabel="Profile State:"
        filterOptions={[
          { value: "all", label: "All Author Statuses" },
          { value: "verified", label: "Verified Profiles Only" },
          { value: "pending", label: "Unverified Actions" }
        ]}
        tableHeaders={["Author / Identity", "Biography Narrative", "System ID Index", "Verification", "Actions"]}
        tableMinW="min-w-[850px]"
        hasData={authors.length > 0}
        totalItems={totalItems}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
        itemLabel="authors"
        metrics={[
          { label: "Rendered Profiles", value: metrics.total, icon: <FiUsers size={18} /> },
          { label: "Verified Creators", value: metrics.verified, icon: <FiCheckCircle size={18} />, iconBgClass: "bg-emerald-50 text-success", valueClass: "text-success" },
          { label: "Awaiting Verification", value: metrics.unverified, icon: <FiClock size={18} />, iconBgClass: metrics.unverified > 0 ? "bg-amber-50 text-warning" : "bg-slate-100 text-slate-400", valueClass: metrics.unverified > 0 ? "text-warning" : "" }
        ]}
        actionButton={
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 bg-primary text-white font-sans font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm shadow-indigo-600/10 hover:bg-primary-hover transition-all cursor-pointer select-none"
          >
            <FiPlus className="text-sm" />
            <span>Add New Author</span>
          </button>
        }
        renderRows={() =>
          authors.map((author) => (
            <tr key={author._id} className="hover:bg-slate-50/70 transition-colors group text-xs text-text-main relative">
              <td className="py-4 px-6 font-bold text-text-main group-hover:text-primary transition-colors text-sm align-middle">
                <div className="flex items-center gap-3">
                  {author.image?.imageUrl ? (
                    <img 
                      src={author.image.imageUrl} 
                      alt="" 
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0 shadow-2xs"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-50 border border-primary/10 text-primary flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                      {getInitials(author.name)}
                    </div>
                  )}
                  <span className="capitalize block font-bold text-text-main group-hover:text-primary transition-colors">{author.name || "Anonymous Scholar"}</span>
                </div>
              </td>

              <td className="py-4 px-6 text-text-muted whitespace-normal leading-relaxed font-medium align-middle max-w-sm">
                {author.bio ? (
                  <p className="line-clamp-2">{author.bio}</p>
                ) : (
                  <span className="italic text-text-muted/40 text-[11px]">No contextual history summary log found.</span>
                )}
              </td>

              <td className="py-4 px-6 align-middle">
                <span className="font-mono text-[10px] text-text-muted bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-sm tracking-wide">
                  #{author._id.substring(author._id.length - 8).toUpperCase()}
                </span>
              </td>

              <td className="py-4 px-6 text-center align-middle">
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                  author.isVerified ? "text-success bg-emerald-50 border-emerald-200" : "text-warning bg-amber-50 border-amber-200"
                }`}>
                  <span className={`w-1 h-1 rounded-full ${author.isVerified ? "bg-success" : "bg-warning"}`} />
                  {author.isVerified ? "Verified" : "Pending"}
                </span>
              </td>

              {/* Functional Row Operational Action Inline Menu Dropdowns */}
              <td className="py-4 px-6 text-right align-middle relative">
                <div className="inline-block text-left">
                  <button 
                    onClick={() => setActiveDropdownId(activeDropdownId === author._id ? null : author._id)}
                    className="text-text-muted hover:text-text-main p-2 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                  >
                    <FiMoreVertical className="text-sm" />
                  </button>

                  {activeDropdownId === author._id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setActiveDropdownId(null)} />
                      <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-xl z-20 overflow-hidden font-sans text-xs">
                        <button 
                          onClick={() => handleToggleVerify(author._id)}
                          className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2 font-medium text-text-main transition-colors"
                        >
                          <FiCheckCircle className="text-emerald-500" />
                          <span>{author.isVerified ? "Revoke Verification" : "Verify Profile"}</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteAuthor(author._id)}
                          className="w-full text-left px-4 py-2.5 hover:bg-red-50 flex items-center gap-2 font-medium text-danger border-t border-slate-100 transition-colors"
                        >
                          <FiTrash2 />
                          <span>Delete Profile</span>
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

      {/* ----------------- POPUP DRAWER MODAL ADD AUTHOR INTERFACE ----------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-xl shadow-2xl overflow-hidden font-sans">
            
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FiUsers className="text-primary text-base" />
                <h3 className="text-sm font-bold text-heading">Request Author Enrollment</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-text-main p-1 rounded-md transition-colors"
              >
                <FiX size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateAuthor} className="p-4 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-text-muted uppercase tracking-wider text-[10px]">Author Identity Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Gabriel García Márquez"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-background border border-slate-200 text-text-main p-2.5 rounded-lg focus:outline-none focus:border-primary font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-text-muted uppercase tracking-wider text-[10px]">Biography Summary Narrative</label>
                <textarea 
                  rows={3}
                  placeholder="Enter historical background parameters..."
                  value={newBio}
                  onChange={(e) => setNewBio(e.target.value)}
                  className="w-full bg-background border border-slate-200 text-text-main p-2.5 rounded-lg focus:outline-none focus:border-primary font-medium resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-text-muted uppercase tracking-wider text-[10px]">Avatar Headshot Image File</label>
                <div className="relative border border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50/50 transition-colors cursor-pointer group">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <FiUpload className="mx-auto mb-1 text-slate-400 group-hover:text-primary transition-colors" size={16} />
                  <span className="block text-text-muted font-medium truncate max-w-xs">
                    {selectedFile ? selectedFile.name : "Select or Drop Profile Avatar"}
                  </span>
                </div>
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
                  {isSubmitting ? "Uploading Profile..." : "Submit Profile Registration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AuthorPage;