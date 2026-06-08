import React, { useState } from "react";
import { FaShoppingCart, FaSpinner, FaCheck } from "react-icons/fa";
import { useCartStore } from "../../redux/cartStore";

interface AddToCartButtonProps {
    inventoryId: string;
    stock: number;
    isActive: boolean;
    variant?: "iconOnly" | "fullWidth" | "standard";
    className?: string;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
    inventoryId,
    stock,
    isActive,
    variant = "standard",
    className = ""
}) => {
    const { addToCart, cart } = useCartStore();
    const [isLocalLoading, setIsLocalLoading] = useState(false);
    const [isAddedSuccess, setIsAddedSuccess] = useState(false);

    const existingCartItem = cart?.items?.find((item) => item.inventoryId === inventoryId);
    const quantityInCart = existingCartItem ? existingCartItem.quantity : 0;
    
    const isOutOfStock = stock <= 0 || quantityInCart >= stock;
    const isDisabled = !isActive || isOutOfStock || isLocalLoading;

    const handleAdd = async (e: React.MouseEvent) => {
        e.preventDefault(); // Stop Link navigation bubbles if placed inside a clickable wrapper card
        if (isDisabled) return;

        setIsLocalLoading(true);
        const success = await addToCart(inventoryId, 1);
        setIsLocalLoading(false);

        if (success) {
            setIsAddedSuccess(true);
            setTimeout(() => setIsAddedSuccess(false), 2000);
        }
    };

    // Determine configuration styles based on requested visual layouts
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 select-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";
    
    const variantStyles = {
        iconOnly: "p-3 bg-slate-100 hover:bg-slate-200 text-ui-dark rounded-full",
        standard: "px-4 py-2 bg-ui-dark text-card-bg text-sm hover:bg-heading gap-2 shadow-xs",
        fullWidth: "w-full py-2.5 bg-ui-dark text-card-bg text-sm hover:bg-heading gap-2 shadow-xs"
    };

    // Render configuration mapping for content state changes
    const renderContent = () => {
        if (isLocalLoading) {
            return <FaSpinner className="animate-spin" size={variant === "iconOnly" ? 16 : 14} />;
        }
        if (isAddedSuccess) {
            return (
                <>
                    <FaCheck className="text-emerald-500 scale-110 transition-transform" size={14} />
                    {variant !== "iconOnly" && <span className="text-emerald-600 font-semibold">Added!</span>}
                </>
            );
        }
        return (
            <>
                <FaShoppingCart size={variant === "iconOnly" ? 16 : 14} />
                {variant !== "iconOnly" && (
                    <span>
                        {!isActive ? "Unavailable" : isOutOfStock ? "Out of Stock" : "Add to Cart"}
                    </span>
                )}
            </>
        );
    };

    return (
        <button
            onClick={handleAdd}
            disabled={isDisabled}
            className={`${baseStyles} ${variantStyles[variant]} ${
                isAddedSuccess && variant !== "iconOnly" ? "bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-50" : ""
            } ${className}`}
            title={isOutOfStock ? "Maximum available inventory allocation reached" : "Add item to cart"}
        >
            {renderContent()}
        </button>
    );
};

export default AddToCartButton;