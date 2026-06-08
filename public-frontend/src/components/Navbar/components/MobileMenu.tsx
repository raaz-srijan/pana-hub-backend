import { Link } from "react-router-dom";
import { FiSearch } from "react-icons/fi";

interface MobileMenuProps {
    user: any;
    isOpen: boolean;
    onLogout: () => void;
}

export const MobileMenu = ({ user, isOpen, onLogout }: MobileMenuProps) => {
    if (!isOpen) return null;

    return (
        <div className="sm:hidden border-t border-ui-muted/10 bg-card-bg/95 backdrop-blur-lg px-4 py-4 space-y-4 animate-fadeIn">
            <div className="relative w-full">
                <input
                    type="search"
                    placeholder="Search books..."
                    className="w-full pl-9 pr-4 py-2 border border-ui-muted/20 bg-background text-ui-dark rounded-xl text-xs focus:outline-none"
                />
                <FiSearch className="absolute left-3 top-2.5 text-sm text-ui-muted/40" />
            </div>

            <div className="flex flex-col gap-1 text-xs font-semibold text-ui-muted px-1">
                <Link to="/all-books" className="hover:text-ui-dark hover:bg-background px-3 py-2.5 rounded-xl transition-all">Books</Link>
                <Link to="/browse" className="hover:text-ui-dark hover:bg-background px-3 py-2.5 rounded-xl transition-all">Browse</Link>
                {user && (
                    <>
                        <Link to="/wishlist" className="hover:text-ui-dark hover:bg-background px-3 py-2.5 rounded-xl transition-all">My Wishlist</Link>
                        <Link to="/profile/orders" className="hover:text-ui-dark hover:bg-background px-3 py-2.5 rounded-xl transition-all">My Orders</Link>
                        {user.role === "vendor" && <a href={import.meta.env.VITE_VENDOR_PORTAL_URL || "http://localhost:5174"} className="text-blue-600 px-3 py-2.5 rounded-xl">Vendor Portal</a>}
                        {user.role === "admin" && <a href={import.meta.env.VITE_ADMIN_DASHBOARD_URL || "http://localhost:5175"} className="text-emerald-600 px-3 py-2.5 rounded-xl">Admin Dashboard</a>}
                    </>
                )}
            </div>

            <div className="border-t border-ui-muted/10 my-2" />

            <div className="px-1">
                {user ? (
                    <div className="space-y-3">
                        <div className="text-[11px] text-ui-muted px-3">
                            Logged in as: <span className="font-semibold text-ui-dark">{user.name}</span>
                        </div>
                        <button
                            onClick={onLogout}
                            className="w-full text-center bg-rose-600 text-white text-xs py-2.5 rounded-xl font-semibold shadow-xs cursor-pointer"
                        >
                            Sign Out
                        </button>
                    </div>
                ) : (
                    <Link
                        to="/login"
                        className="block w-full text-center bg-ui-dark text-card-bg text-xs font-semibold py-2.5 rounded-xl shadow-xs"
                    >
                        Sign In
                    </Link>
                )}
            </div>
        </div>
    );
};