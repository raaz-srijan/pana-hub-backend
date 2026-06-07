import React, { useState, type ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../../api/axiosInstance";
import { useAuthStore } from "../../../redux/authStore";
import { FiLock, FiUser, FiMail, FiLoader } from "react-icons/fi";

export interface AuthProps {
  type: "login" | "register";
}

const AuthForm = ({ type }: AuthProps) => {
  const navigate = useNavigate();

  const loginStore = useAuthStore((state) => state.login);
  const storeLoading = useAuthStore((state) => state.isLoading);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [localLoading, setLocalLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (type === "register") {
      if (formData.password !== formData.confirmPassword) {
        return toast.error("Passwords do not match!");
      }

      setLocalLoading(true);
      try {
        const res = await api.post("/users/register", {
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        toast.success(res.data.message || "Registration successful! Please login.");
        navigate("/login");
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Registration failed");
      } finally {
        setLocalLoading(false);
      }
    } else {
      const success = await loginStore({
        email: formData.email,
        password: formData.password,
      });

      if (success) {
        toast.success("Welcome back!");
        navigate("/");
      } else {
        const storeError = useAuthStore.getState().error;
        toast.error(storeError || "Invalid credentials");
      }
    }
  };

  const isLoading = localLoading || storeLoading;

  return (
    <div className="w-full max-w-md bg-transparent p-2 sm:p-6 select-none">
      
      {/* Form Typographic Header */}
      <div className="mb-10">
        <h2 className="font-serif text-heading text-3xl font-normal tracking-tight">
          {type === "login" ? (
            <>Sign <span className="italic font-light text-ui-muted">In</span></>
          ) : (
            <>Create <span className="italic font-light text-ui-muted">Account</span></>
          )}
        </h2>
        <p className="text-ui-muted font-sans text-xs md:text-sm mt-2 font-normal leading-relaxed">
          {type === "login"
            ? "Enter your account access credentials below."
            : "Fill in your details to open an active network profile."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Full Name Input Box (Registration Only) */}
        {type === "register" && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-heading/80 font-sans">
              Full Name
            </label>
            <div className="relative group">
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full pl-11 pr-4 py-3 bg-background border border-ui-muted/20 text-heading placeholder:text-ui-muted/40 font-sans text-xs rounded-xl outline-none transition-all duration-300 focus:border-ui-dark focus:ring-4 focus:ring-ui-dark/5 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-3xs"
              />
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-ui-muted/40 group-focus-within:text-ui-dark transition-colors duration-200 text-sm" />
            </div>
          </div>
        )}

        {/* Email Input Field */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-heading/80 font-sans">
            Email Address
          </label>
          <div className="relative group">
            <input
              type="email"
              name="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full pl-11 pr-4 py-3 bg-background border border-ui-muted/20 text-heading placeholder:text-ui-muted/40 font-sans text-xs rounded-xl outline-none transition-all duration-300 focus:border-ui-dark focus:ring-4 focus:ring-ui-dark/5 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-3xs"
            />
            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-ui-muted/40 group-focus-within:text-ui-dark transition-colors duration-200 text-sm" />
          </div>
        </div>

        {/* Password Input Field */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-heading/80 font-sans">
            Password
          </label>
          <div className="relative group">
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full pl-11 pr-4 py-3 bg-background border border-ui-muted/20 text-heading placeholder:text-ui-muted/40 font-sans text-xs rounded-xl outline-none transition-all duration-300 focus:border-ui-dark focus:ring-4 focus:ring-ui-dark/5 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-3xs"
            />
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-ui-muted/40 group-focus-within:text-ui-dark transition-colors duration-200 text-sm" />
          </div>
        </div>

        {/* Password Confirmation Field (Registration Only) */}
        {type === "register" && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-heading/80 font-sans">
              Confirm Password
            </label>
            <div className="relative group">
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full pl-11 pr-4 py-3 bg-background border border-ui-muted/20 text-heading placeholder:text-ui-muted/40 font-sans text-xs rounded-xl outline-none transition-all duration-300 focus:border-ui-dark focus:ring-4 focus:ring-ui-dark/5 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-3xs"
              />
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-ui-muted/40 group-focus-within:text-ui-dark transition-colors duration-200 text-sm" />
            </div>
          </div>
        )}

        {/* Submit Execution Action Trigger */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-ui-dark text-card-bg py-3.5 rounded-xl font-sans font-semibold text-xs uppercase tracking-wider hover:bg-ui-dark/90 active:scale-[0.98] transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          {isLoading ? (
            <FiLoader className="animate-spin text-sm" />
          ) : type === "login" ? (
            "Sign In"
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      {/* Interactive Form Switch Section Footer */}
      <div className="mt-10 pt-6 border-t border-ui-muted/10 text-center">
        {type === "login" ? (
          <p className="text-ui-muted font-sans text-xs font-normal">
            Don't have an active portal profile?{" "}
            <Link
              to="/register"
              className="text-ui-dark font-bold hover:text-ui-muted ml-0.5 transition-colors underline underline-offset-4"
            >
              Sign Up
            </Link>
          </p>
        ) : (
          <p className="text-ui-muted font-sans text-xs font-normal">
            Already have an active profile?{" "}
            <Link
              to="/login"
              className="text-ui-dark font-bold hover:text-ui-muted ml-0.5 transition-colors underline underline-offset-4"
            >
              Sign In
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthForm;