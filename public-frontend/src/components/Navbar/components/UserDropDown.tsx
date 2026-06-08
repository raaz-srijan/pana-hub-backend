import { Link } from "react-router-dom";
import { FiChevronDown, FiUser, FiHeart, FiPackage, FiSliders, FiLogOut } from "react-icons/fi";
import type { RefObject } from "react";

interface UserDropdownProps {
    user: any;
    isDropdownOpen: boolean;
    setIsDropdownOpen: (open: boolean) => void;
    dropdownRef: RefObject<HTMLDivElement | null>;
    onLogout: () => void;
}

export const UserDropdown = ({
    user,
    isDropdownOpen,
    setIsDropdownOpen,
    dropdownRef,
    onLogout
}: UserDropdownProps) => {
    return (
        <div className="relative" ref={dropdownRef}>
            {user ? (
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 text-sm font-medium text-ui-dark hover:bg-background px-2.5 py-1.5 rounded-xl border border-transparent hover:border-ui-muted/10 focus:outline-none transition-all cursor-pointer"
                >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-ui-dark text-[10px] text-card-bg font-black tracking-wider shadow-inner">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden max-w-[90px] truncate lg:block text-xs font-semibold tracking-tight">
                        {user.name.split(' ')[0]}
                    </span>
                    <FiChevronDown
                        size={12}
                        className={`text-ui-muted transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                    />
                </button>
            ) : (
                <Link
                    to="/login"
                    className="flex items-center gap-2 bg-ui-dark text-card-bg text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-ui-dark/90 transition-colors shadow-xs"
                >
                    <FiUser size={12} />
                    Sign In
                </Link>
            )}

            {user && isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-card-bg/95 backdrop-blur-lg border border-ui-muted/15 rounded-2xl shadow-xl p-1.5 z-50 transform origin-top-right transition-all duration-200">
                    <div className="px-3 py-2.5 mb-1 bg-background/50 rounded-xl">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-ui-muted block">Account Profile</span>
                        <strong className="text-ui-dark text-xs block truncate mt-0.5 font-semibold">{user.email}</strong>
                    </div>

                    <Link
                        to="/wishlist"
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-ui-muted hover:text-ui-dark hover:bg-background rounded-lg transition-colors font-medium"
                    >
                        <FiHeart size={14} />
                        My Wishlist
                    </Link>
                    
                    <Link
                        to="/my-orders"
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-ui-muted hover:text-ui-dark hover:bg-background rounded-lg transition-colors font-medium"
                    >
                        <FiPackage size={14} />
                        My Orders
                    </Link>

                    {(user.role === "vendor" || user.role === "admin") && (
                        <a
                            href={import.meta.env.VITE_VENDOR_PORTAL_URL || "http://localhost:5174"}
                            className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-blue-600 hover:bg-blue-50/50 rounded-lg transition-colors font-semibold"
                        >
                            <FiSliders size={14} />
                            Vendor Portal
                        </a>
                    )}

                    {user.role === "admin" && (
                        <a
                            href={import.meta.env.VITE_ADMIN_DASHBOARD_URL || "http://localhost:5175"}
                            className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-emerald-600 hover:bg-emerald-50/50 rounded-lg transition-colors font-semibold"
                        >
                            <FiSliders size={14} />
                            Admin Dashboard
                        </a>
                    )}

                    <div className="my-1 border-t border-ui-muted/10" />

                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-semibold cursor-pointer"
                    >
                        <FiLogOut size={14} />
                        Sign Out
                    </button>
                </div>
            )}
        </div>
    );
};