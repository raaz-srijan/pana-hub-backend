import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  FaArrowLeft, FaBookOpen, FaBuilding, FaCalendarAlt, 
  FaBarcode, FaTags, FaStore, FaInfoCircle, FaCheckCircle,
  FaMapMarkerAlt
} from "react-icons/fa";
import api from "../../api/axiosInstance";
import Loading from "../../components/common/Loading";
import AddToCartButton from "../../components/button/AddToCartBtn";

interface INestedProperty {
  _id: string;
  name: string;
}

interface IVendorAddress {
  state: string;
  city: string;
  tole: string;
}

interface IVendor {
  _id: string;
  userId: string;
  vendorName: string;
  licenseNo: string;
  address: IVendorAddress;
  isVerified: boolean;
  isPending: boolean;
}

interface IInventoryDetail {
  _id: string;
  vendorId: string;
  price: number;
  stock: number;
  isActive: boolean;
  vendor?: IVendor; // Matches the nested backend object schema perfectly
}

interface IBookDetail {
  _id: string;
  name: string;
  isbn: string;
  coverImage: {
    imageUrl: string;
    publicId: string;
  };
  category: INestedProperty;
  genre: INestedProperty[];
  author: INestedProperty;
  publisher?: string;
  publishedDate?: string;
  totalAvailableStock: number;
  lowestPrice: number;
  highestPrice: number;
  hasStock: boolean;
  inventoryDetails: IInventoryDetail[];
}

const BookDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<IBookDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/books/public/${id}`);
        setBook(res.data?.book || null);
      } catch (err: any) {
        console.error("Error retrieving book information:", err);
        setError(err.response?.data?.message || "Failed to load book parameters.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBookDetails();
  }, [id]);

  // Filter out any inactive suppliers while preserving API's native sorting
  const activeOffers = book?.inventoryDetails?.filter(inv => inv && inv.isActive) || [];

  if (loading) return <Loading variant="fullscreen" text="Sourcing vendor options..." />;

  if (error || !book) {
    return (
      <div className="container mx-auto py-24 px-4 text-center max-w-md">
        <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-4">
          <FaInfoCircle size={24} />
        </div>
        <h2 className="text-xl font-serif font-bold text-gray-900 mb-1">Failed to Source Parameters</h2>
        <p className="text-sm text-gray-500 mb-6">{error || "The book item selection cannot be read."}</p>
        <Link to="/all-books" className="inline-flex justify-center items-center gap-2 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl transition hover:bg-gray-800 w-full">
          <FaArrowLeft size={10} /> Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-white">
      
      {/* Structural Minimalist Breadcrumb Navigation Bar */}
      <div className="mb-8">
        <Link to="/all-books" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-gray-900 transition group">
          <FaArrowLeft className="group-hover:-translate-x-0.5 transition-transform" size={10} />
          Back to Collections
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16">
        
        {/* LEFT COLUMN CONTAINER: FLUID ASPECT FIXED FRAME */}
        <div className="lg:col-span-4 sticky top-24">
          <div className="bg-gray-50/60 border border-gray-100 rounded-3xl overflow-hidden p-8 flex justify-center items-center relative aspect-[4/5] shadow-xs">
            {book.coverImage?.imageUrl ? (
              <img 
                src={book.coverImage.imageUrl} 
                alt={book.name || "Book Cover"} 
                className="max-h-full max-w-full object-contain rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.12)] transition-transform duration-300 hover:scale-[1.02]"
              />
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 gap-2 bg-gray-100/50 rounded-2xl">
                <FaBookOpen size={44} className="text-gray-300" />
                <span className="text-xs font-medium text-gray-400">Missing Cover Art Map</span>
              </div>
            )}

            <span className={`absolute top-4 right-4 px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider border shadow-3xs ${
              book.hasStock 
                ? "bg-white/90 text-emerald-800 border-emerald-100" 
                : "bg-red-50/90 text-red-700 border-red-100"
            }`}>
              {book.hasStock ? "In Stock" : "Unavailable"}
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN CONTAINER: CORE ARCHITECTURAL DETAILS SECTION */}
        <div className="lg:col-span-8 space-y-8">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 capitalize tracking-tight mb-2 leading-tight">
              {book.name || "Untitled Masterpiece"}
            </h1>
            <p className="text-base sm:text-lg text-gray-500 font-medium capitalize">
              by <span className="text-gray-900 font-bold underline decoration-gray-200 underline-offset-4">{book.author?.name || "Unknown Author"}</span>
            </p>
          </div>

          {/* PERFORMANCE COUNTERS METRIC BAR */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border border-gray-100 rounded-2xl p-5 bg-gray-50/50 shadow-3xs">
            <div className="space-y-0.5">
              <span className="block text-[10px] uppercase font-bold tracking-wider text-gray-400">Competitive Variance</span>
              <span className="text-lg font-bold text-gray-900 font-sans">
                {book.hasStock && book.lowestPrice != null && book.highestPrice != null
                  ? `Rs. ${book.lowestPrice.toLocaleString()} - Rs. ${book.highestPrice.toLocaleString()}` 
                  : book.lowestPrice != null 
                    ? `Rs. ${book.lowestPrice.toLocaleString()}`
                    : "N/A"}
              </span>
            </div>
            <div className="space-y-0.5 border-t sm:border-t-0 sm:border-x border-gray-200/60 pt-3 sm:pt-0 sm:px-5">
              <span className="block text-[10px] uppercase font-bold tracking-wider text-gray-400">Aggregated Pipeline Stock</span>
              <span className="text-lg font-bold text-gray-900">
                {(book.totalAvailableStock || 0) === 1 ? "1 Copy Available" : `${book.totalAvailableStock || 0} Copies Available`}
              </span>
            </div>
            <div className="space-y-1.5 pt-3 sm:pt-0 sm:pl-5">
              <span className="block text-[10px] uppercase font-bold tracking-wider text-gray-400">Primary Classification</span>
              <span className="inline-flex bg-gray-900 text-white text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider shadow-3xs">
                {book.category?.name || "General"}
              </span>
            </div>
          </div>

          {/* CLASSIFIERS */}
          {book.genre && book.genre.length > 0 && (
            <div className="space-y-3 pb-2">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <FaTags size={10} className="text-gray-300" /> Genre Mapping tags
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {book.genre.map((g) => g && (
                  <span key={g._id} className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-xl capitalize font-medium transition hover:bg-gray-200/70 border border-transparent">
                    {g.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* STRUCTURAL SPEC SHEET CONTAINER */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm bg-white border border-gray-100 rounded-2xl p-5 shadow-3xs">
            <div className="flex items-center gap-3">
              <FaBarcode className="text-gray-300 shrink-0" size={14} />
              <span className="text-gray-500 font-medium">Standard ISBN: <strong className="text-gray-900 font-mono tracking-tight ml-1 uppercase">{book.isbn || "N/A"}</strong></span>
            </div>
            <div className="flex items-center gap-3">
              <FaBuilding className="text-gray-300 shrink-0" size={14} />
              <span className="text-gray-500 font-medium">Fulfillment House: <strong className="text-gray-900 capitalize ml-1">{book.publisher || "N/A"}</strong></span>
            </div>
            <div className="flex items-center gap-3 sm:col-span-2 pt-3 border-t border-gray-50">
              <FaCalendarAlt className="text-gray-300 shrink-0" size={14} />
              <span className="text-gray-500 font-medium">Release Timeline Matrix: <strong className="text-gray-900 ml-1">
                {book.publishedDate ? new Date(book.publishedDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "Unassigned Timeline"}
              </strong></span>
            </div>
          </div>

          {/* DYNAMIC COMPETE MATRIX: VENDOR OFFERS MARKETPLACE */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                Compare Marketplace Offers
              </h2>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {activeOffers.length} {activeOffers.length === 1 ? "Verified Node" : "Verified Nodes"}
              </span>
            </div>

            {activeOffers.length === 0 ? (
              <div className="text-center py-12 px-4 bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm font-medium">
                There are no active procurement distribution networks providing inventory blocks right now.
              </div>
            ) : (
              /* Scrollable viewport panel container with custom scrollbar behaviors */
              <div className="max-h-[440px] overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent hover:scrollbar-thumb-gray-300 transition-colors duration-200">
                {activeOffers.map((inventory, index) => inventory && (
                  <div 
                    key={inventory._id} 
                    className={`relative border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 mr-0.5 ${
                      index === 0 
                        ? "border-emerald-500/30 bg-emerald-50/10 shadow-3xs hover:border-emerald-500/40" 
                        : "border-gray-200/80 bg-white hover:border-gray-300 hover:shadow-3xs"
                    }`}
                  >

                    <div className="flex items-start gap-3.5">
                      <div className={`mt-0.5 p-2 rounded-xl border shrink-0 ${
                        index === 0 ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-gray-50 border-gray-100 text-gray-400"
                      }`}>
                        <FaStore size={16} />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-gray-900 text-base capitalize">
                          {inventory.vendor?.vendorName || "Independent Supplier Node"}
                        </p>
                        
                        {/* SAFE FULL ADDRESS RENDER SECTION */}
                        {inventory.vendor?.address && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                            <FaMapMarkerAlt size={11} className="text-gray-300 shrink-0" />
                            <span>
                              {inventory.vendor.address.tole ? `${inventory.vendor.address.tole}, ` : ""}
                              {inventory.vendor.address.city || "Unknown City"},{" "}
                              {inventory.vendor.address.state || "Unknown State"}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 pt-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <p className="text-xs text-gray-500 font-medium">
                            Stock Allotment:{" "}
                            <span className={`font-bold ${inventory.stock <= 5 ? "text-amber-600" : "text-gray-700"}`}>
                              {(inventory.stock || 0)} units left
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                      <div className="text-left sm:text-right">
                        <span className="block text-[10px] uppercase font-bold tracking-wider text-gray-400">Offer Settlement Price</span>
                        <span className="text-xl font-black text-gray-900 font-sans tracking-tight">
                          Rs. {inventory.price != null ? inventory.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                        </span>
                      </div>

                      <div className="w-36">
                        <AddToCartButton
                          inventoryId={inventory._id}
                          stock={inventory.stock || 0}
                          isActive={inventory.isActive}
                          variant="standard"
                          className="w-full text-xs font-bold uppercase tracking-wider py-3 rounded-xl shadow-3xs transition"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default BookDetailPage;