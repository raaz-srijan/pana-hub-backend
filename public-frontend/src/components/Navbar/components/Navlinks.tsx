import { Link, useLocation } from "react-router-dom";

interface NavLinksProps {
    className?: string;
}

export const NavLinks = ({ className = "hidden md:flex items-center gap-8 text-sm font-medium" }: NavLinksProps) => {
    const location = useLocation();
    const isActive = (path: string) => location.pathname.toLowerCase().startsWith(path.toLowerCase());

    return (
        <div className={className}>
            <Link to="/all-books" className={`relative py-1 transition-colors ${isActive('/all-books') ? 'text-ui-dark' : 'text-ui-muted hover:text-ui-dark'}`}>
                Books
                {isActive('/all-books') && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-ui-dark rounded-full" />}
            </Link>
            <Link to="/authors" className={`relative py-1 transition-colors ${isActive('/authors') ? 'text-ui-dark' : 'text-ui-muted hover:text-ui-dark'}`}>
                Authors
                {isActive('/authors') && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-ui-dark rounded-full" />}
            </Link>
            <Link to="/genres" className={`relative py-1 transition-colors ${isActive('/genres') ? 'text-ui-dark' : 'text-ui-muted hover:text-ui-dark'}`}>
                Genres
                {isActive('/genres') && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-ui-dark rounded-full" />}
            </Link>
            <Link to="/categories" className={`relative py-1 transition-colors ${isActive('/categories') ? 'text-ui-dark' : 'text-ui-muted hover:text-ui-dark'}`}>
                Categories
                {isActive('/categories') && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-ui-dark rounded-full" />}
            </Link>
        </div>
    );
};