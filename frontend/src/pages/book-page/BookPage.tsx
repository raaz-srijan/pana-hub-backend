import { useState, useMemo, useEffect } from "react";
import { FiBook, FiUsers, FiLayers, FiMoreVertical, FiAlertCircle, FiPlus, FiX, FiCheckCircle, FiTrash2, FiUpload, FiFolderPlus } from "react-icons/fi";
import api from "../../api/axiosInstance";
import { DashboardLayoutTemplate } from "../../components/common/Skeleton";

interface CoverImage { imageUrl: string; publicId: string; }
interface NestedItem { _id: string; name: string; }
interface Book {
  _id: string; name: string; isbn: string; coverImage: CoverImage;
  category: NestedItem; genre: NestedItem[]; author: NestedItem;
  publisher: string; publishedDate: string; isVerified: boolean;
  deletedAt: string | null; createdAt: string; updatedAt: string; __v: number;
}

interface MetaPagination {
  totalItems: number;
  currentPage: number;
  totalPages: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const BooksPage = () => {
  // Shared Async Core Data States
  const [books, setBooks] = useState<Book[]>([]);
  const [meta, setMeta] = useState<MetaPagination | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Layout Filters Control States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Popup Overlay Toggle States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Framework Options Pools for Creation Select Menus
  const [categoriesPool, setCategoriesPool] = useState<NestedItem[]>([]);
  const [genresPool, setGenresPool] = useState<NestedItem[]>([]);
  const [authorsPool, setAuthorsPool] = useState<NestedItem[]>([]);

  // Creation Form Input Elements Hooks
  const [newName, setNewName] = useState("");
  const [newIsbn, setNewIsbn] = useState("");
  const [newPublisher, setNewPublisher] = useState("");
  const [newPublishedDate, setNewPublishedDate] = useState("");
  const [targetCategory, setTargetCategory] = useState("");
  const [targetAuthor, setTargetAuthor] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Connect components directly with backend paginated query routers
  const fetchBooks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get("/books/admin/all", {
        params: { 
          page: currentPage, 
          limit: pageSize,
          // Propagate filters down towards server implementation queries
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          search: searchQuery || undefined
        }
      });
      
      if (res.data?.success) {
        setBooks(res.data.books || []);
        setMeta(res.data.meta || null);
      } else {
        throw new Error(res.data?.message || "Failed to parse system catalog items.");
      }
    } catch (err: any) {
      console.error("Catalog Engine Fetch Error:", err);
      setError(err.response?.data?.message || err.message || "An error occurred while communicating with backend service modules.");
    } finally {
      setIsLoading(false);
    }
  };

  // Asynchronously query data pools needed to construct relational lookup dependencies inside creation drawer
  const fetchRelationalPools = async () => {
    try {
      const [catRes, genreRes, authorRes] = await Promise.all([
        api.get("/categories/all"),
        api.get("/genres"), 
        api.get("/authors")
      ]);
      setCategoriesPool(catRes.data?.categories || catRes.data?.data || []);
      setGenresPool(genreRes.data?.genres || genreRes.data?.data || []);
      setAuthorsPool(authorRes.data?.authors || authorRes.data?.data || []);
    } catch (err) {
      console.error("Failure caching system options configuration vectors:", err);
    }
  };

  // Synchronize component reactive intervals
  useEffect(() => {
    fetchBooks();
  }, [currentPage, pageSize, selectedCategory, searchQuery]);

  useEffect(() => {
    if (isModalOpen) {
      fetchRelationalPools();
    }
  }, [isModalOpen]);

  // Operational System Metric Matrix Mapping
  const metrics = useMemo(() => {
    if (!books.length) return { total: meta?.totalItems || 0, authors: 0, fiction: 0, other: 0 };
    const uniqueAuthors = new Set(books.map((b) => b.author?._id)).size;
    const fictionCount = books.filter((b) => b.category?.name?.toLowerCase() === "fiction").length;
    return {
      total: meta?.totalItems || books.length,
      authors: uniqueAuthors,
      fiction: fictionCount,
      other: Math.max(0, (meta?.totalItems || books.length) - fictionCount)
    };
  }, [books, meta]);

  // Extract category selection parameters dynamically directly from active records row instances
  const dynamicCategoryOptions = useMemo(() => {
    const defaultOptions = [{ value: "all", label: "All Categories" }];
    if (!books.length) return defaultOptions;
    
    const extracted = books.map((b) => b.category?.name?.toLowerCase()).filter(Boolean);
    const uniqueSet = Array.from(new Set(extracted));
    
    return [
      ...defaultOptions,
      ...uniqueSet.map((cat) => ({ value: cat, label: cat.toUpperCase() }))
    ];
  }, [books]);

  // Dispatch Multipart FormData Resource Stream Payload (POST /books)
  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newIsbn.trim() || !targetCategory || !targetAuthor || selectedGenres.length === 0) {
      setError("Please ensure all mandated schema fields are structurally mapped.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const formData = new FormData();
      formData.append("name", newName.trim());
      formData.append("isbn", newIsbn.trim());
      formData.append("category", targetCategory);
      formData.append("author", targetAuthor);
      formData.append("publisher", newPublisher.trim());
      if (newPublishedDate) formData.append("publishedDate", newPublishedDate);
      
      // Map cross-reference arrays securely across modern multipart streams
      selectedGenres.forEach(genreId => formData.append("genre[]", genreId));
      if (selectedFile) formData.append("coverImage", selectedFile);

      const res = await api.post("/books", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data?.success) {
        setIsModalOpen(false);
        // Wipe local values
        setNewName(""); setNewIsbn(""); setNewPublisher(""); setNewPublishedDate("");
        setTargetCategory(""); setTargetAuthor(""); setSelectedGenres([]); setSelectedFile(null);
        fetchBooks();
      }
    } catch (err: any) {
      console.error("Book registration failure transaction:", err);
      setError(err.response?.data?.message || "Failed to commit inventory record item to database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Verification Lifecycle Processing (PATCH /books/:id/verify)
  const handleToggleVerification = async (id: string) => {
    try {
      const res = await api.patch(`/books/${id}/verify`);
      if (res.data?.success) {
        setActiveDropdownId(null);
        fetchBooks();
      }
    } catch (err) {
      console.error("Verification adjustment exception context:", err);
    }
  };

  // Soft Delete Collection Tracking Mechanism (DELETE /books/:id)
  const handleSoftDelete = async (id: string) => {
    if (!window.confirm("Are you confident you want to move this catalog asset into systemic archiving trash bins?")) return;
    try {
      const res = await api.delete(`/books/${id}`);
      if (res.data?.success) {
        setActiveDropdownId(null);
        fetchBooks();
      }
    } catch (err) {
      console.error("Error executing soft delete routine:", err);
    }
  };

  const handleGenreCheckboxChange = (genreId: string) => {
    setSelectedGenres(prev =>
      prev.includes(genreId) ? prev.filter(id => id !== genreId) : [...prev, genreId]
    );
  };

  return (
    <>
      {/* Dynamic Error Status Module Anchor */}
      {error && (
        <div className="bg-red-50 border border-danger/20 text-danger px-4 py-3.5 rounded-xl flex items-start gap-3 text-xs mb-4">
          <FiAlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <div className="space-y-0.5">
            <span className="font-bold">Catalog Processing Failure</span>
            <p className="opacity-90">{error}</p>
          </div>
        </div>
      )}

      <DashboardLayoutTemplate
        title="Books Catalog"
        description="Manage global library inventory, status parameters, and listing metadata attributes."
        syncButtonText="Reload Catalog"
        isLoading={isLoading}
        onSync={fetchBooks}
        actionButton={
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 bg-primary text-white font-sans font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm shadow-indigo-600/10 hover:bg-primary-hover transition-all cursor-pointer select-none"
          >
            <FiPlus className="text-sm" />
            <span>Add New Book</span>
          </button>
        }
        searchQuery={searchQuery}
        onSearchChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
        searchPlaceholder="Filter by book title, target author name, or ISBN number..."
        filterId="catFilter"
        filterValue={selectedCategory}
        onFilterChange={(val) => { setSelectedCategory(val); setCurrentPage(1); }}
        filterLabel="Category Layout:"
        filterOptions={dynamicCategoryOptions}
        tableHeaders={["Title & Details", "Author", "Category / Genres", "Publisher", "Release Date", "Status", "Actions"]}
        tableMinW="min-w-[900px]"
        hasData={books.length > 0}
        totalItems={meta?.totalItems || 0}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
        itemLabel="books"
        metrics={[
          { label: "Total Titles", value: metrics.total, icon: <FiBook size={20} />, iconBgClass: "bg-indigo-50 text-primary" },
          { label: "Active Authors", value: metrics.authors, icon: <FiUsers size={20} />, iconBgClass: "bg-emerald-50 text-success" },
          { label: "Fiction Space", value: metrics.fiction, icon: <FiLayers size={20} />, iconBgClass: "bg-amber-50 text-warning" },
          { label: "Other Segments", value: metrics.other, icon: <FiLayers size={20} /> }
        ]}
        renderRows={() =>
          books.map((book) => (
            <tr key={book._id} className="hover:bg-slate-50/70 transition-colors group text-xs text-text-main relative">
              <td className="py-4 px-6 max-w-xs">
                <div className="flex items-center gap-4">
                  <img 
                    src={book.coverImage?.imageUrl || "https://placehold.co/70x100?text=No+Cover"} 
                    alt="" 
                    className="w-8 h-11 object-cover bg-background border border-slate-200 rounded-md shadow-2xs flex-shrink-0" 
                  />
                  <div className="truncate space-y-1">
                    <span className="font-bold text-text-main block truncate group-hover:text-primary transition-colors text-sm">{book.name || "Untitled Reference"}</span>
                    <span className="font-mono text-[10px] text-text-muted bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-sm inline-block tracking-wide capitalize">ISBN: {book.isbn || "N/A"}</span>
                  </div>
                </div>
              </td>
              
              <td className="py-4 px-6 text-text-main font-semibold align-middle capitalize">
                {book.author?.name || "Unknown Author"}
              </td>
              
              <td className="py-4 px-6 align-middle">
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="bg-indigo-50 border border-primary/10 text-primary text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">{book.category?.name || "General"}</span>
                  {book.genre?.map((g) => (
                    <span key={g._id} className="text-text-muted text-xs bg-slate-50 border border-slate-200/60 px-1.5 py-0.5 rounded-md capitalize font-medium">{g.name}</span>
                  ))}
                </div>
              </td>
              
              <td className="py-4 px-6 text-text-muted font-medium align-middle">{book.publisher || "N/A"}</td>
              
              <td className="py-4 px-6 text-text-muted font-medium align-middle">
                {book.publishedDate ? new Date(book.publishedDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "N/A"}
              </td>
              
              <td className="py-4 px-6 text-center align-middle">
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                  book.isVerified ? "text-success bg-emerald-50 border-emerald-200" : "text-warning bg-amber-50 border-amber-200"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${book.isVerified ? "bg-success" : "bg-warning"}`} />
                  {book.isVerified ? "Verified" : "Pending"}
                </span>
              </td>
              
              <td className="py-4 px-6 text-right align-middle relative">
                <div className="inline-block text-left">
                  <button 
                    onClick={() => setActiveDropdownId(activeDropdownId === book._id ? null : book._id)}
                    className="text-text-muted hover:text-text-main p-2 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                  >
                    <FiMoreVertical className="text-sm" />
                  </button>

                  {activeDropdownId === book._id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setActiveDropdownId(null)} />
                      <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-xl z-20 overflow-hidden font-sans text-xs">
                        <button 
                          onClick={() => handleToggleVerification(book._id)}
                          className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2 font-medium text-text-main transition-colors"
                        >
                          <FiCheckCircle className="text-emerald-500" />
                          <span>{book.isVerified ? "Revoke Verification" : "Verify Title"}</span>
                        </button>
                        <button 
                          onClick={() => handleSoftDelete(book._id)}
                          className="w-full text-left px-4 py-2.5 hover:bg-red-50 flex items-center gap-2 font-medium text-danger border-t border-slate-100 transition-colors"
                        >
                          <FiTrash2 />
                          <span>Move to Trash</span>
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

      {/* ----------- INLINE POPUP CREATION FORM DRAWER MATRIX ----------- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fadeIn">
          <div className="bg-white border border-slate-200 w-full max-w-xl rounded-xl shadow-2xl overflow-hidden font-sans my-8">
            
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FiFolderPlus className="text-primary text-base" />
                <h3 className="text-sm font-bold text-heading">Register Structural Book Entity</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-text-main p-1 rounded-md transition-colors"
              >
                <FiX size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateBook} className="p-5 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-text-muted uppercase tracking-wider text-[10px]">Book Title Name *</label>
                  <input 
                    type="text" required placeholder="e.g. The Great Gatsby"
                    value={newName} onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-background border border-slate-200 text-text-main p-2.5 rounded-lg focus:outline-none focus:border-primary font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-text-muted uppercase tracking-wider text-[10px]">ISBN Key Token Code *</label>
                  <input 
                    type="text" required placeholder="e.g. 9780743273565"
                    value={newIsbn} onChange={(e) => setNewIsbn(e.target.value)}
                    className="w-full bg-background border border-slate-200 text-text-main p-2.5 rounded-lg focus:outline-none focus:border-primary font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-text-muted uppercase tracking-wider text-[10px]">Classification Category *</label>
                  <select 
                    required value={targetCategory} onChange={(e) => setTargetCategory(e.target.value)}
                    className="w-full bg-background border border-slate-200 text-text-main p-2.5 rounded-lg focus:outline-none focus:border-primary font-medium capitalize"
                  >
                    <option value="">Select Target Category</option>
                    {categoriesPool.map((c) => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-text-muted uppercase tracking-wider text-[10px]">Primary Author Node *</label>
                  <select 
                    required value={targetAuthor} onChange={(e) => setTargetAuthor(e.target.value)}
                    className="w-full bg-background border border-slate-200 text-text-main p-2.5 rounded-lg focus:outline-none focus:border-primary font-medium capitalize"
                  >
                    <option value="">Select Author Node</option>
                    {authorsPool.map((a) => (
                      <option key={a._id} value={a.name}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-text-muted uppercase tracking-wider text-[10px]">Publisher Identity</label>
                  <input 
                    type="text" placeholder="e.g. Charles Scribner's Sons"
                    value={newPublisher} onChange={(e) => setNewPublisher(e.target.value)}
                    className="w-full bg-background border border-slate-200 text-text-main p-2.5 rounded-lg focus:outline-none focus:border-primary font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-text-muted uppercase tracking-wider text-[10px]">Release Publication Date</label>
                  <input 
                    type="date"
                    value={newPublishedDate} onChange={(e) => setNewPublishedDate(e.target.value)}
                    className="w-full bg-background border border-slate-200 text-text-main p-2.5 rounded-lg focus:outline-none focus:border-primary font-medium"
                  />
                </div>
              </div>

              {/* Multi-relational Genre Box Selections */}
              <div className="space-y-1.5">
                <label className="block font-bold text-text-muted uppercase tracking-wider text-[10px]">Bounded Genre Map Elements * ({selectedGenres.length} selected)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg max-h-28 overflow-y-auto">
                  {genresPool.map((g) => {
                    const isChecked = selectedGenres.includes(g._id);
                    return (
                      <label key={g._id} className="flex items-center gap-2 cursor-pointer select-none py-0.5 capitalize">
                        <input 
                          type="checkbox" checked={isChecked} onChange={() => handleGenreCheckboxChange(g._id)}
                          className="rounded border-slate-300 text-primary focus:ring-primary accent-indigo-600"
                        />
                        <span className="font-medium text-text-main truncate">{g.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Asset Upload Boundary Block */}
              <div className="space-y-1">
                <label className="block font-bold text-text-muted uppercase tracking-wider text-[10px]">Cover Image File Stream</label>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 bg-slate-50/50 flex flex-col items-center justify-center gap-1.5 relative hover:bg-slate-50 transition-colors">
                  <input 
                    type="file" accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <FiUpload className="text-slate-400 text-lg" />
                  <span className="font-semibold text-text-main">
                    {selectedFile ? selectedFile.name : "Click or drop cover photo target stream here"}
                  </span>
                  <span className="text-[10px] text-text-muted opacity-70">Supports JPG, PNG formats up to 5MB</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button 
                  type="button" onClick={() => setIsModalOpen(false)}
                  className="bg-slate-100 border border-slate-200 text-text-main font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" disabled={isSubmitting}
                  className="bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-hover disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  {isSubmitting ? "Compiling Asset Node..." : "Register Title"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default BooksPage;