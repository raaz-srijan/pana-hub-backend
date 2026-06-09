import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import type { IconType } from "react-icons";
import { FaUser, FaBookmark, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { 
  FiSliders, 
  FiBriefcase, 
  FiUsers, 
  FiKey, 
  FiShield, 
  FiFolder, 
  FiFeather, 
} from "react-icons/fi";
import { Fa42Group } from "react-icons/fa6";
import { useAuthStore } from "../../../redux/authStore";

interface SubLinkItem {
  name: string;
  link: string;
  icon: IconType;
}

interface SidebarLinkItem {
  name: string;
  icon: IconType;
  link?: string;
  roles: ("admin" | "vendor")[];
  children?: SubLinkItem[];
}

interface SidebarProps {
  type: "admin" | "vendor";
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const SidebarLinks: SidebarLinkItem[] = [
  { name: "dashboard", icon: FaUser, link: "/", roles: ["admin", "vendor"] },
  { name: "books", icon: FaBookmark, link: "/books", roles: ["admin", "vendor"] },
  { name: "inventory", icon: FiSliders, link: "/inventory", roles: ["vendor"] },
  { name: "orders", icon: FiBriefcase, link: "/orders", roles: ["vendor"] },
  { name: "vendors", icon: FiUsers, link: "/vendors", roles: ["admin"] }, 
  { 
    name: "request service", 
    icon: Fa42Group, 
    roles: ["vendor", "admin"], 
    children: [
      { name: "request cat", link: "/request/category", icon: FiFolder },
      { name: "genre", link: "/request/genre", icon: FaBookmark },
      { name: "authors", link: "/request/authors", icon: FiFeather },
    ]
  }, 
  { name: "permissions", icon: FiKey, link: "/permissions", roles: ["admin"] },
  { name: "roles", icon: FiShield, link: "/roles", roles: ["admin"] }, 
];

export default function Sidebar({ type, isOpen, setIsOpen }: SidebarProps) {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Hook live parameters directly into global authorization state
  const { user } = useAuthStore();

  const authorizedLinks = SidebarLinks.filter((link) => link.roles.includes(type));
  const toggleDropdown = (name: string) => setOpenDropdown(openDropdown === name ? null : name);
  const isLinkActive = (linkPath?: string) => location.pathname === linkPath;
  const isChildActive = (children?: SubLinkItem[]) => children?.some(child => location.pathname === child.link);


  // Extract fallback label initials safely from state strings
  const getUserInitials = () => {
    if (user?.name) {
      const parts = user.name.trim().split(" ");
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return user.name.substring(0, 2).toUpperCase();
    }
    return type === "admin" ? "AD" : "VN";
  };

  return (
    <>
      {/* Mobile Shell Sidebar Layer Mask */}
      {isOpen && (
        <div onClick={() => setIsOpen(false)} className="fixed inset-0 z-40 bg-black/40 lg:hidden backdrop-blur-xs animate-fadeIn" />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 
        w-64 bg-sidebar text-white flex flex-col justify-between
        border-r border-slate-800/80 transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex flex-col flex-1 overflow-y-auto scrollbar-dashboard">
          
          {/* Header Role Verification Metadata Badge */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800/60">
            <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-primary">
              {user?.role || type} control panel
            </span>
          </div>

          {/* Navigation Action Links Deck */}
          <nav className="flex-1 px-4 py-4 space-y-1.5">
            {authorizedLinks.map((item) => {
              const Icon = item.icon;
              const hasChildren = !!item.children;
              const dropdownOpen = openDropdown === item.name || isChildActive(item.children);

              if (hasChildren) {
                return (
                  <div key={item.name} className="space-y-1">
                    <button
                      onClick={() => toggleDropdown(item.name)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium font-sans capitalize text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer ${isChildActive(item.children) ? "text-white bg-slate-800/40" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} className={isChildActive(item.children) ? "text-primary" : "text-slate-400"} />
                        <span>{item.name}</span>
                      </div>
                      {dropdownOpen ? <FaChevronUp size={11} className="text-slate-500" /> : <FaChevronDown size={11} className="text-slate-500" />}
                    </button>

                    {/* Sub-Nested Taxonomy Request Navigation Blocks */}
                    {dropdownOpen && (
                      <div className="pl-5 pr-2 py-1 space-y-1 border-l border-slate-800/80 ml-6 mt-1">
                        {item.children?.map((child) => {
                          const ChildIcon = child.icon;
                          const active = isLinkActive(child.link);
                          return (
                            <Link
                              key={child.name}
                              to={child.link}
                              onClick={() => setIsOpen(false)}
                              className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-sans capitalize transition-all ${active ? "bg-primary text-white font-semibold shadow-xs" : "text-slate-400 hover:text-white hover:bg-slate-800/50"}`}
                            >
                              <ChildIcon size={13} className={active ? "text-white" : "text-slate-500"} />
                              <span>{child.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const active = isLinkActive(item.link);
              return (
                <Link
                  key={item.name}
                  to={item.link || "#"}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium font-sans capitalize transition-all duration-150 ${active ? "bg-primary text-white shadow-md shadow-indigo-600/10 font-semibold" : "text-slate-400 hover:text-white hover:bg-slate-800/60"}`}
                >
                  <Icon size={18} className={active ? "text-white" : "text-slate-400"} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 3. Account Signature Anchor & Session Termination Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/30 space-y-3">
          <div className="flex items-center justify-between gap-2 px-2 py-0.5">
            <div className="flex items-center gap-3 truncate">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700/80 flex items-center justify-center font-bold text-xs text-primary flex-shrink-0 select-none">
                {getUserInitials()}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-slate-200 truncate capitalize">
                  {user?.name || `${type} user`}
                </span>
                <span className="text-[10px] text-slate-500 truncate font-medium">
                  {user?.email || "Connected via secure cookie"}
                </span>
              </div>
            </div>
          </div>

        </div>

      </aside>
    </>
  );
}