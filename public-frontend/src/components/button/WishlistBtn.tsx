import React, { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useWishlistStore } from "../../redux/wishlistStore";

interface WishlistBtnProps {
  bookId: string;
  className?: string;
}

const WishlistBtn: React.FC<WishlistBtnProps> = ({ bookId, className = "" }) => {
  const [localLoading, setLocalLoading] = useState(false);
  
  const isCurrentlyWishlisted = useWishlistStore((state) => state.wishlistedBookIds.has(bookId));
  const addToWishlist = useWishlistStore((state) => state.addToWishlist);
  const removeFromWishlist = useWishlistStore((state) => state.removeFromWishlist);

  const handleWishlistToggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation(); // Shield child components if this sits inside an anchor grid/link container
    if (!bookId || localLoading) return;

    setLocalLoading(true);
    try {
      if (isCurrentlyWishlisted) {
        await removeFromWishlist(bookId);
      } else {
        await addToWishlist(bookId);
      }
    } catch (err) {
      console.error("Error toggling wishlist item collection node:", err);
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <button
      onClick={handleWishlistToggle}
      disabled={localLoading}
      type="button"
      className={`inline-flex items-center justify-center p-3 rounded-xl border transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:pointer-events-none group ${
        isCurrentlyWishlisted
          ? "bg-red-50/60 border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200"
          : "bg-white border-gray-200/80 text-gray-400 hover:text-gray-900 hover:border-gray-300 hover:shadow-3xs"
      } ${className}`}
    >
      {localLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isCurrentlyWishlisted ? (
        <FaHeart size={16} className="transform transition-transform group-hover:scale-110" />
      ) : (
        <FaRegHeart size={16} className="transform transition-transform group-hover:scale-110" />
      )}
    </button>
  );
};

export default WishlistBtn;