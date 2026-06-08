import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  FaArrowLeft, FaTrashAlt, FaBookOpen, FaTags, FaInfoCircle, FaEye
} from "react-icons/fa";
import api from "../../api/axiosInstance";
import Loading from "../../components/common/Loading";
import { BiHeartSquare } from "react-icons/bi";
import { GiSparkles } from "react-icons/gi";

interface INestedProperty {
  _id: string;
  name: string;
}

interface IPopulatedBook {
  _id: string;
  name: string;
  isbn: string;
  coverImage?: {
    imageUrl: string;
    publicId: string;
  };
  category?: INestedProperty;
  author?: INestedProperty;
}

interface IWishlistItem {
  _id: string;
  bookId: IPopulatedBook | null; // Nullable in case a book was hard-deleted from DB
}

interface IWishlistData {
  _id?: string;
  userId: string;
  books: IWishlistItem[];
}

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState<IWishlistData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // Tracks specific item mutations

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await api.get("/wishlist"); 
      
      const actualData = res.data?.data !== undefined ? res.data.data : res.data;
      setWishlist(actualData || null);
    } catch (err: any) {
      console.error("Error retrieving user wishlist:", err);
      setError(err.response?.data?.message || "Failed to load your wishlist portfolio.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  // Handler to drop a single book item from the set array
  const handleRemoveItem = async (bookId: string) => {
    if (!bookId) return;
    setActionLoading(bookId);
    try {
      const res = await api.delete(`/wishlist/remove/${bookId}`);
      const updatedData = res.data?.data !== undefined ? res.data.data : res.data;
      setWishlist(updatedData);
    } catch (err: any) {
      console.error("Error pulling book item from collection:", err);
      alert(err.response?.data?.message || "Could not delete this selection.");
    } finally {
      setActionLoading(null);
    }
  };

  // Handler to wipe out the whole wishlist pipeline array blocks
  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to completely clear your wishlist?")) return;
    setLoading(true);
    try {
      const res = await api.delete("/wishlist/clear");
      const updatedData = res.data?.data !== undefined ? res.data.data : res.data;
      setWishlist(updatedData);
    } catch (err: any) {
      console.error("Error wiping active user wishlist data blocks:", err);
      setError("Failed to reset your item collections.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading variant="fullscreen" text="Syncing vault collections..." />;

  if (error) {
    return (
      <div className="container mx-auto py-24 px-4 text-center max-w-md">
        <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-4">
          <FaInfoCircle size={24} />
        </div>
        <h2 className="text-xl font-serif font-bold text-gray-900 mb-1">Vault Sync Error</h2>
        <p className="text-sm text-gray-500 mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="bg-gray-900 text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl transition hover:bg-gray-800 w-full">
          Retry Sync
        </button>
      </div>
    );
  }

  // Ensure clean arrays to run loops across safely
  const validWishlistItems = wishlist?.books?.filter(item => item && item.bookId) || [];

  return (
    <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-white min-h-[75vh]">
      
      {/* HEADER SECTION ARCHITECTURE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-gray-100">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            Your Wishlist Vault <span className="text-gray-300 text-xl font-sans font-medium">({validWishlistItems.length})</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Curate, track distribution, and finalize your specialized literary assets.</p>
        </div>
        
        {validWishlistItems.length > 0 && (
          <button 
            onClick={handleClearAll}
            className="self-start sm:self-center inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider border border-red-200 text-red-700 bg-red-50/40 hover:bg-red-50 hover:border-red-300 px-4 py-2.5 rounded-xl transition"
          >
            <FaTrashAlt size={11} /> Wipe Entire Vault
          </button>
        )}
      </div>

      {/* RENDER GRID MATRIX */}
      {validWishlistItems.length === 0 ? (
        /* Empty State Fallback Screen */
        <div className="text-center py-20 max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-3xl flex items-center justify-center text-gray-300 mx-auto mb-5 shadow-3xs">
            <BiHeartSquare size={24} />
          </div>
          <h2 className="text-xl font-serif font-bold text-gray-900 mb-1.5">Your Vault is Empty</h2>
          <p className="text-sm text-gray-400 mb-8 leading-relaxed">
            You haven't flagged any asset nodes for tracking yet. Explore architectural profiles to curate choices.
          </p>
          <Link to="/all-books" className="inline-flex justify-center items-center gap-2 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-xl transition hover:bg-gray-800 shadow-sm">
            <GiSparkles size={11} /> Browse Masterpieces
          </Link>
        </div>
      ) : (
        /* Populated Grid Interface Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {validWishlistItems.map((item) => {
            const book = item.bookId!; 
            return (
              <div 
                key={item._id} 
                className={`relative group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-3xs hover:shadow-xs hover:border-gray-200 transition-all duration-300 flex flex-col ${
                  actionLoading === book._id ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                
                {/* Upper Details Matrix Pane */}
                <div className="p-5 flex gap-4 flex-1">
                  
                  {/* Thumb Cover Mapping Frame */}
                  <div className="w-24 h-32 bg-gray-50 border border-gray-100 rounded-xl overflow-hidden flex justify-center items-center shrink-0 relative shadow-2xs">
                    {book.coverImage?.imageUrl ? (
                      <img 
                        src={book.coverImage.imageUrl} 
                        alt={book.name} 
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <FaBookOpen size={20} className="text-gray-300" />
                    )}
                  </div>

                  {/* Core Meta Description Grid */}
                  <div className="flex flex-col min-w-0 justify-between py-0.5 flex-1">
                    <div className="space-y-1">
                      <Link 
                        to={`/books/${book._id}`} 
                        className="block font-serif text-base font-bold text-gray-900 truncate hover:text-emerald-700 transition capitalize"
                      >
                        {book.name || "Untitled Node"}
                      </Link>
                      <p className="text-xs text-gray-500 truncate capitalize">
                        by <span className="font-medium text-gray-700">{book.author?.name || "Unknown"}</span>
                      </p>
                    </div>

                    <div className="mt-2">
                      {book.category?.name && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-gray-50 text-gray-500 font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-gray-100">
                          <FaTags size={8} /> {book.category.name}
                        </span>
                      )}
                    </div>

                  </div>
                </div>

                {/* Bottom Interactive Command Strips */}
                <div className="border-t border-gray-50 bg-gray-50/40 px-5 py-3.5 flex items-center justify-between gap-3 mt-auto">
                  
                  <button
                    onClick={() => handleRemoveItem(book._id)}
                    disabled={actionLoading === book._id}
                    className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50/30 transition-all shrink-0"
                    title="Remove from wishlist"
                  >
                    <FaTrashAlt size={12} />
                  </button>

                  <Link
                    to={`/books/${book._id}`}
                    className="flex-1 inline-flex justify-center items-center gap-2 text-[11px] font-bold uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-3xs transition-all bg-gray-900 text-white hover:bg-gray-800"
                  >
                    <FaEye size={11} /> View Details
                  </Link>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Structural Minimalist Breadcrumb Footer */}
      <div className="mt-12 pt-6 border-t border-gray-100">
        <Link to="/all-books" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-gray-900 transition group">
          <FaArrowLeft className="group-hover:-translate-x-0.5 transition-transform" size={10} />
          Return to Primary Marketplace Catalog
        </Link>
      </div>

    </main>
  );
};

export default WishlistPage;