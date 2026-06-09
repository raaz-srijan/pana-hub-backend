import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMenu, FiBell, FiLogOut } from "react-icons/fi";
import { useAuthStore } from "../../../../redux/authStore";
import { ConfirmDialog } from "../../ConfirmDialog";
import Loading from "../../Loading";

interface HeaderProps {
  type: "admin" | "vendor";
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Header({ type, sidebarOpen, setSidebarOpen }: HeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [isTerminatingSession, setIsTerminatingSession] = useState(false);

  const handleSignOutConfirm = async () => {
    try {
      setIsSignOutModalOpen(false);
      setIsTerminatingSession(true);
      
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed executing structural workspace logoff:", error);
    } finally {
      setIsTerminatingSession(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 w-full bg-card-bg border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between transition-colors">
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-slate-100 lg:hidden transition-colors cursor-pointer"
            aria-label="Toggle Menu Layout"
          >
            <FiMenu size={20} />
          </button>

          <div className="flex items-center gap-2 select-none">
            <span className="font-serif text-xl font-black tracking-tight text-heading">
              Pana<span className="text-primary">.Hub</span>
            </span>
            <span className="hidden sm:inline-block text-[9px] font-sans font-bold uppercase tracking-widest bg-slate-100 text-text-muted border border-slate-200/80 px-2 py-0.5 rounded-md">
              {user?.role || type} Console
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          
          <button className="p-2 text-text-muted hover:text-text-main hover:bg-slate-100 rounded-lg transition-colors relative cursor-pointer">
            <FiBell size={17} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-danger rounded-full ring-2 ring-card-bg animate-pulse" />
          </button>

          <div className="h-5 w-px bg-slate-200 mx-1" />

          <button 
            onClick={() => setIsSignOutModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold font-sans text-text-muted hover:text-danger px-2.5 py-1.5 rounded-lg hover:bg-red-50/60 border border-transparent hover:border-red-100 transition-all cursor-pointer select-none group"
          >
            <FiLogOut size={14} className="group-hover:-translate-x-0.5 transition-transform duration-150" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>

      </header>

      <ConfirmDialog
        isOpen={isSignOutModalOpen}
        title="Terminate Management Session?"
        message="Are you sure you want to log out? This action safely de-authenticates your workspace security tokens and completely closes your active operations console profile."
        confirmText="Exit Console"
        cancelText="Stay Logged In"
        variant="warning"
        onClose={() => setIsSignOutModalOpen(false)}
        onConfirm={handleSignOutConfirm}
      />

      {isTerminatingSession && (
        <Loading 
          variant="fullscreen" 
          text="De-authenticating terminal session and purging secure cache matrices..." 
        />
      )}
    </>
  );
}