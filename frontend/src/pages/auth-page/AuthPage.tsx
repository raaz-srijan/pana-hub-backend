import React, { useState, type ChangeEvent } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiAlertCircle, FiArrowRight, FiShield } from "react-icons/fi";
import { useAuthStore } from "../../redux/authStore";
import Loading from "../../components/common/Loading";

const AuthPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isCustomerRejected, setIsCustomerRejected] = useState(false);
  
  const navigate = useNavigate();
  const { login, logoutStateOnly, isLoading } = useAuthStore();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCustomerRejected(false);

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all layout credentials fields.");
      return;
    }

    // Process secure state pipeline actions directly
    const success = await login(formData);

    if (success) {
      const user = useAuthStore.getState().user;

      if (user?.role === "customer") {
        logoutStateOnly();
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsCustomerRejected(true);
        toast.error("Access denied. Customer records cannot access administrative panels.");
      } else if (user?.role === "admin" || user?.role === "vendor") {
        toast.success(`Welcome back, ${user.name || "Operator"}!`);
        navigate("/");
      }
    } else {
      const serverError = useAuthStore.getState().error;
      toast.error(serverError || "Authentication failed. Please verify credentials.");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
        <div className="sm:mx-auto w-full max-w-md">
          
          {/* Modern Dynamic Brand Logo Matrix */}
          <div className="flex justify-center">
            <div className="relative flex items-center justify-center bg-primary/10 text-primary p-3.5 rounded-xl border border-primary/20 shadow-xs shadow-indigo-500/5 group">
              <FiShield size={26} className="group-hover:rotate-12 transition-transform duration-300" />
              <span className="absolute text-[10px] font-sans font-bold tracking-tighter mt-0.5">HQ</span>
            </div>
          </div>
          
          <h2 className="mt-6 text-center font-serif text-2xl font-bold text-heading">
            Management Portal Login
          </h2>
          <p className="mt-1.5 text-center text-xs text-text-muted max-w-xs mx-auto leading-relaxed">
            Exclusive entry checkpoint for authorized system admin and catalog vendor workstations.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto w-full max-w-md">
          <div className="bg-card-bg border border-slate-200 shadow-xl rounded-2xl p-6 sm:p-10 transition-all">
            
            {/* Customer Access Shield Intercept Banner */}
            {isCustomerRejected && (
              <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-warning leading-relaxed flex gap-3 items-start animate-fadeIn">
                <FiAlertCircle className="text-base flex-shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <span className="font-bold block mb-0.5 text-slate-800">Looking for the public storefront?</span>
                  Standard consumer buyer profiles do not carry management clearing authorization privileges.
                  <a 
                    href="https://yourstore.com"
                    className="mt-2 inline-flex items-center gap-1 text-primary hover:text-primary-hover font-bold group transition-colors cursor-pointer"
                  >
                    <span>Go to Main Marketplace</span>
                    <FiArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              
              {/* Email Form Field Block */}
              <div>
                <label htmlFor="email" className="block text-[10px] font-bold text-text-muted uppercase tracking-widest">
                  Email Address
                </label>
                <div className="mt-1.5 relative rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted/70">
                    <FiMail size={15} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-4 py-2.5 bg-background border border-slate-200 text-text-main text-xs font-medium rounded-lg placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-sans"
                    placeholder="name@organization.com"
                  />
                </div>
              </div>

              {/* Password Form Field Block */}
              <div>
                <label htmlFor="password" className="block text-[10px] font-bold text-text-muted uppercase tracking-widest">
                  Account Password
                </label>
                <div className="mt-1.5 relative rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted/70">
                    <FiLock size={15} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-4 py-2.5 bg-background border border-slate-200 text-text-main text-xs font-medium rounded-lg placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-sans"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Operational Sign In Submissions Action */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-primary text-white font-sans font-semibold text-xs rounded-lg shadow-sm shadow-indigo-600/10 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer select-none min-h-[38px]"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loading size="xs" text="" variant="inline" />
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    <span>Sign In to Workspace</span>
                  )}
                </button>
              </div>
            </form>

            {/* Registration Footer Meta Context */}
            <div className="mt-6 border-t border-slate-100 pt-4 text-center">
              <p className="text-[11px] text-text-muted leading-normal max-w-[280px] mx-auto">
                New merchant vendor? Registration profiles are provisioned by administrative networks. Contact support channels for catalog setup.
              </p>
            </div>

          </div>
        </div>
      </div>

      {isLoading && (
        <Loading 
          variant="fullscreen" 
          text="Validating credentials..." 
        />
      )}
    </>
  );
};

export default AuthPage;