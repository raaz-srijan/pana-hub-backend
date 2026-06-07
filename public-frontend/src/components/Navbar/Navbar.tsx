import { useState, useRef, useEffect } from "react";
import { FiShoppingCart, FiMenu, FiX } from "react-icons/fi";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../redux/authStore";
import { useCartStore } from "../../redux/cartStore";
import Loading from "../common/Loading";
import { NavLinks } from "./components/Navlinks";
import { NavSearch } from "./components/NavSearch";
import { UserDropdown } from "./components/UserDropDown";
import { MobileMenu } from "./components/MobileMenu";


const Navbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();

    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const totalItems = useCartStore((state) => state.cart?.totalItems || 0);
    const fetchCart = useCartStore((state) => state.fetchCart);

    useEffect(() => {
        if (user && user.role === "customer") {
            fetchCart();
        }
    }, [user, fetchCart]);

    // Close menus when route changes
    useEffect(() => {
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
    }, [location]);

    // Detect click outside user dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
        setLoading(true);
        
        if (user) {
            await logout();
            useCartStore.setState({ cart: { items: [], grandTotal: 0, totalItems: 0 } });
        }
        
        navigate("/login");
        setLoading(false);
    };

    if (loading) return <Loading variant="fullscreen" text="Logging out..." />;

    return (
        <nav className="w-full bg-card-bg/90 backdrop-blur-md border-b border-ui-muted/10 sticky top-0 z-50 transition-all duration-300 font-sans">
            <div className="max-w-[1400px] mx-auto h-16 flex items-center justify-between gap-8 px-4 md:px-8">
                
                {/* BRAND LOGO */}
                <Link
                    to="/"
                    className="font-serif text-2xl font-bold tracking-tight text-heading flex items-center gap-1 group select-none"
                >
                    Pana<span className="text-ui-muted font-light">.Hub</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-ui-dark opacity-80 group-hover:scale-125 transition-transform" />
                </Link>

                {/* DESKTOP LINKS */}
                <NavLinks />

                {/* PREMIUM SEARCH ARCHITECTURE */}
                <NavSearch />

                {/* UTILITY CORE */}
                <div className="hidden sm:flex items-center gap-4 text-ui-dark">
                    {/* CART ACTIONS */}
                    <Link
                        to="/cart"
                        className="relative p-2.5 text-ui-muted hover:text-ui-dark transition-all rounded-xl hover:bg-background flex items-center justify-center group"
                        aria-label="View Shopping Cart"
                    >
                        <FiShoppingCart size={18} className="group-hover:scale-105 transition-transform" />
                        {totalItems > 0 && (
                            <span className="absolute top-1.5 right-1.5 bg-ui-dark text-card-bg font-sans text-[9px] font-bold h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full border border-card-bg shadow-sm">
                                {totalItems}
                            </span>
                        )}
                    </Link>

                    {/* USER CONTROLS DROPDOWN */}
                    <UserDropdown 
                        user={user}
                        isDropdownOpen={isDropdownOpen}
                        setIsDropdownOpen={setIsDropdownOpen}
                        dropdownRef={dropdownRef}
                        onLogout={handleLogout}
                    />
                </div>

                {/* RESPONSIVE MOBILE ACCORDION BUTTONS */}
                <div className="flex sm:hidden items-center gap-2">
                    <Link to="/cart" className="relative text-ui-muted p-2 rounded-xl hover:bg-background" aria-label="View Shopping Cart">
                        <FiShoppingCart size={18} />
                        {totalItems > 0 && (
                            <span className="absolute top-1 right-1 bg-ui-dark text-card-bg font-sans text-[8px] font-bold h-3.5 min-w-[14px] px-1 flex items-center justify-center rounded-full">
                                {totalItems}
                            </span>
                        )}
                    </Link>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-ui-dark p-2 rounded-xl hover:bg-background focus:outline-none flex items-center justify-center"
                    >
                        {isMobileMenuOpen ? <FiX size={18} /> : <FiMenu size={18} />}
                    </button>
                </div>
            </div>

            {/* RESPONSIVE MOBILE DRAWER */}
            <MobileMenu 
                user={user} 
                isOpen={isMobileMenuOpen} 
                onLogout={handleLogout} 
            />
        </nav>
    );
};

export default Navbar;