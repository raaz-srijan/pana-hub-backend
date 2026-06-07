import { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";

interface NavSearchProps {
    className?: string;
}

export const NavSearch = ({ className = "flex-1 max-w-md hidden sm:flex items-center relative group" }: NavSearchProps) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();
    
    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

    useEffect(() => {
        setSearchTerm(searchParams.get("search") || "");
    }, [searchParams]);

    // Clear search bar input text UI box automatically when route transitions to a clean, non-search page
    useEffect(() => {
        if (!searchParams.has("search")) {
            setSearchTerm("");
        }
    }, [location.pathname, searchParams]);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            const currentSearch = searchParams.get("search") || "";
            
            if (searchTerm.trim() !== currentSearch) {
                const newParams = new URLSearchParams(searchParams);
                
                if (searchTerm.trim()) {
                    newParams.set("search", searchTerm.trim());
                } else {
                    newParams.delete("search");
                }

                if (newParams.has("page")) {
                    newParams.set("page", "1");
                }

                const currentPath = location.pathname.toLowerCase().replace(/\/$/, "");
                const searchablePaths = [
                    "/all-books",
                    "/store",
                    "/dashboard",
                    "/authors",
                    "/genres",
                    "/categories"
                ];

                const isLookablePage = searchablePaths.some(path => {
                    const cleanPath = path.toLowerCase();
                    return currentPath === cleanPath || currentPath.startsWith(`${cleanPath}/`);
                });

                if (isLookablePage) {
                    setSearchParams(newParams);
                } else if (searchTerm.trim()) {
                    navigate(`/all-books?${newParams.toString()}`);
                }
            }
        }, 300); 

        return () => clearTimeout(delayDebounce);
    }, [searchTerm, searchParams, location.pathname, setSearchParams, navigate]);

    return (
        <div className={className}>
            <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search books, authors, genres, categories..."
                className="w-full pl-10 pr-4 py-2 border border-ui-muted/20 bg-background/50 text-ui-dark rounded-xl text-xs transition-all duration-300 focus:outline-none focus:bg-card-bg focus:border-ui-dark focus:ring-4 focus:ring-ui-dark/5 placeholder:text-ui-muted/40 font-medium"
            />
            <FiSearch className="absolute left-3.5 text-sm text-ui-muted/50 group-focus-within:text-ui-dark transition-colors pointer-events-none" />
        </div>
    );
};