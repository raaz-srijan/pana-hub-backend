import { FaTrash, FaMinus, FaPlus } from "react-icons/fa";

export interface ICartItem {
  inventoryId: string;
  quantity: number;
  inStock: number;
  isAvailable: boolean;
  subTotal: number;
  bookDetails?: {
    name: string;
    coverImage?: { imageUrl: string };
    author?: { name: string };
  };
  vendorDetails?: {
    vendorName: string;
  };
}

interface CartItemRowProps {
  item: ICartItem;
  onQuantityChange: (inventoryId: string, currentQty: number, change: number, stockLimit: number) => void;
  onRemoveItem: (inventoryId: string) => void;
}

const CartItemRow = ({ item, onQuantityChange, onRemoveItem }: CartItemRowProps) => {
  const isOutOfStock = !item.isAvailable;

  return (
    <div
      className={`group/item bg-white border rounded-2xl p-4 sm:p-5 flex gap-4 sm:gap-5 transition-all duration-200 relative overflow-hidden ${
        isOutOfStock 
          ? "border-red-100 bg-red-50/10 opacity-75 shadow-xs" 
          : "border-gray-200/70 hover:border-gray-300 hover:shadow-xs"
      }`}
    >
      {/* Decorative vertical state strip indicator */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${isOutOfStock ? "bg-red-500" : "bg-transparent"}`} />

      {/* Book Aspect Ratio Thumbnail Wrapper */}
      <div className="h-28 w-20 bg-gray-50 rounded-xl overflow-hidden border border-gray-100/80 flex-shrink-0 flex items-center justify-center p-1.5 shadow-3xs">
        {item.bookDetails?.coverImage?.imageUrl ? (
          <img
            src={item.bookDetails.coverImage.imageUrl}
            alt={item.bookDetails.name}
            className="max-h-full max-w-full object-contain transition-transform group-hover/item:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <span className="text-[10px] text-gray-400 font-medium text-center">No Cover</span>
        )}
      </div>

      {/* Primary Detail Column */}
      <div className="flex flex-col flex-1 min-w-0 justify-between">
        <div>
          <div className="flex justify-between items-start gap-4">
            <h3 className="font-serif text-base sm:text-lg font-bold text-gray-900 line-clamp-1 capitalize">
              {item.bookDetails?.name || "Untitled Book"}
            </h3>
            <span className="font-sans font-bold text-gray-900 text-sm sm:text-base whitespace-nowrap pt-0.5">
              Rs. {(item.subTotal || 0).toLocaleString()}
            </span>
          </div>

          <p className="text-xs text-gray-500 font-medium mt-0.5 capitalize">
            by {item.bookDetails?.author?.name || "Unknown Author"}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-2">
          <span className="font-sans">Distributed by:</span>
          <span className="text-gray-700 font-semibold max-w-[140px] truncate">{item.vendorDetails?.vendorName || "Independent Supplier"}</span>
        </div>

        {/* Dynamic Action Toolbar Row */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
          {isOutOfStock ? (
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-lg">
              Allocation Exhausted
            </span>
          ) : (
            <div className="flex items-center border border-gray-200 bg-gray-50/50 rounded-xl overflow-hidden h-9 shadow-3xs">
              <button
                onClick={() => onQuantityChange(item.inventoryId, item.quantity, -1, item.inStock)}
                disabled={item.quantity <= 1}
                className="px-3 h-full text-gray-400 hover:text-gray-900 hover:bg-gray-100/70 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer flex items-center justify-center"
                aria-label="Decrease quantity"
              >
                <FaMinus size={8} />
              </button>
              <span className="text-xs font-bold text-gray-900 w-8 text-center select-none">
                {item.quantity}
              </span>
              <button
                onClick={() => onQuantityChange(item.inventoryId, item.quantity, 1, item.inStock)}
                disabled={item.quantity >= item.inStock}
                className="px-3 h-full text-gray-400 hover:text-gray-900 hover:bg-gray-100/70 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer flex items-center justify-center"
                aria-label="Increase quantity"
              >
                <FaPlus size={8} />
              </button>
            </div>
          )}

          <button
            onClick={() => onRemoveItem(item.inventoryId)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50/50 rounded-xl transition border border-transparent hover:border-red-100/30 cursor-pointer flex items-center justify-center"
            aria-label="Delete line item"
          >
            <FaTrash size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItemRow;