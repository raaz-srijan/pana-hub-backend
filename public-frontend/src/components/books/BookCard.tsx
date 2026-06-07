import { Link } from "react-router-dom";
import AddToCartButton from "../button/AddToCartBtn";
import { useWishlistStore } from "../../redux/wishlistStore";
import { FaHeart } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";
import { useState } from "react";

interface INestedProperty {
  _id: string;
  name: string;
}

interface IInventoryDetail {
  _id: string;
  vendorId: string;
  price: number;
  stock: number;
  isActive: boolean;
}

export interface IBook {
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
  publisher: string;
  publishedDate: string;
  totalAvailableStock: number;
  lowestPrice: number;
  hasStock: boolean;
  inventoryDetails: IInventoryDetail[];
}

interface BookCardProps {
  book: IBook;
  showStock?: boolean;
  showPrice?: boolean;     
  showActionBtn?: boolean; 
}

const BookCard = ({ 
  book, 
  showStock = false, 
  showPrice = true,    
  showActionBtn = true  
}: BookCardProps) => {
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const isWishlisted = useWishlistStore((state) => state.wishlistedBookIds.has(book._id));
  const addToWishlist = useWishlistStore((state) => state.addToWishlist);
  const removeFromWishlist = useWishlistStore((state) => state.removeFromWishlist);

  const targetInventory = book.inventoryDetails?.find(
    (inv) => inv.price === book.lowestPrice && inv.isActive
  ) || book.inventoryDetails?.[0];

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (wishlistLoading) return;

    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await removeFromWishlist(book._id);
      } else {
        await addToWishlist(book._id);
      }
    } catch (err) {
      console.error("Failed to toggle item wishlist status:", err);
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <div className="group relative bg-white border border-gray-100 p-4 rounded-2xl transition-all duration-200 hover:border-gray-200 hover:shadow-sm flex flex-col justify-between h-full">
      <Link to={`/books/${book._id}`} className="block flex-1">
        
        <div className="aspect-[3/4] w-full bg-gray-50 rounded-xl overflow-hidden relative flex items-center justify-center p-4 mb-4">
          <img 
            src={book.coverImage?.imageUrl} 
            alt={book.name} 
            className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />

          <button
            onClick={handleWishlistToggle}
            disabled={wishlistLoading}
            className={`absolute top-3 right-3 p-2.5 rounded-xl border transition-all duration-200 shadow-3xs hover:scale-105 active:scale-95 z-10 ${
              isWishlisted
                ? "bg-red-50 border-red-100 text-red-500"
                : "bg-white/80 backdrop-blur-xs border-gray-100 text-gray-400 hover:text-gray-900 hover:bg-white"
            } ${wishlistLoading ? "opacity-60 pointer-events-none" : ""}`}
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            {isWishlisted ? <FaHeart size={14} /> : <FiHeart size={14} />}
          </button>
          
          {showStock && (
            <span className={`absolute bottom-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-semibold tracking-wide border ${
              book.hasStock 
                ? "bg-white/90 text-emerald-800 border-emerald-100" 
                : "bg-red-50/90 text-red-700 border-red-100"
            }`}>
              {book.hasStock ? `In Stock (${book.totalAvailableStock})` : "Out of Stock"}
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-wide uppercase text-gray-400">
            <span>{book.category?.name}</span>
            {book.genre?.[0] && (
              <>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span>{book.genre[0].name}</span>
              </>
            )}
          </div>
          
          <h2 className="font-serif font-bold text-gray-900 text-lg leading-snug line-clamp-2 tracking-tight group-hover:text-gray-600 transition-colors capitalize">
            {book.name}
          </h2>
          
          <p className="text-gray-600 text-sm font-medium capitalize">
            {book.author?.name}
          </p>
        </div>

        {showPrice && (
          <div className="mt-4 pt-3 border-t border-gray-50 flex items-baseline gap-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">From</span>
            <span className="text-xl font-bold text-gray-900">
              Rs. {book.lowestPrice > 0 ? book.lowestPrice.toLocaleString() : "N/A"}
            </span>
          </div>
        )}
      </Link>

      {showActionBtn && (
        <div className="mt-4">
          {targetInventory ? (
            <AddToCartButton
              inventoryId={targetInventory._id}
              stock={targetInventory.stock}
              isActive={targetInventory.isActive}
              variant="fullWidth"
              className="w-full font-medium text-xs tracking-wide py-3 rounded-xl transition"
            />
          ) : (
            <button
              disabled
              className="w-full py-3 bg-gray-100 text-gray-400 text-xs font-semibold rounded-xl cursor-not-allowed border border-gray-200/50"
            >
              Unavailable
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default BookCard;