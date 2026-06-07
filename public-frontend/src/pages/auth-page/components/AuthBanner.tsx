import type { AuthProps } from "./AuthForm";
import { FiLogIn, FiUserPlus, FiCheckCircle } from "react-icons/fi";

const AuthBanner = ({ type }: AuthProps) => {
  const isLogin = type === "login";

  return (
    <div className="hidden lg:flex flex-col justify-between bg-[#0B0F19] text-white rounded-[2rem] p-12 min-h-[680px] relative overflow-hidden border border-white/[0.04]">
      
      {/* Editorial Gradient Lighting Blurs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Decorative Line Patterns */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.02] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <div className="relative z-10 my-auto max-w-md">
        {/* Rounded Glass Profile Icon Container */}
        <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-8 text-white/80 shadow-inner">
          {isLogin ? <FiLogIn size={18} /> : <FiUserPlus size={18} />}
        </div>

        <h1 className="font-serif text-3xl md:text-4xl font-normal leading-tight tracking-tight mb-4">
          {isLogin ? (
            <>Welcome back to <span className="italic font-light text-white/60">Pana.Hub</span></>
          ) : (
            <>Join the platform <span className="italic font-light text-white/60">Community</span></>
          )}
        </h1>

        <p className="text-white/50 font-sans text-sm leading-relaxed mb-8 font-normal">
          {isLogin
            ? "Sign in to access your account, manage your content preferences, and coordinate with local independent fulfillment centers."
            : "Create your verified client profile to start exploring and supporting local bookstores near you."}
        </p>

        {/* Dynamic Context Lists */}
        <div className="space-y-4 pt-4 border-t border-white/[0.06]">
          {[
            isLogin ? "Secure cloud verification check" : "Quick and easy registration path",
            isLogin ? "Access personal store dashboards" : "Personalized feeds from day one",
            isLogin ? "Track live book deliveries" : "Get started in just a few clicks"
          ].map((text, idx) => (
            <div key={idx} className="flex items-center gap-3 group">
              <FiCheckCircle size={14} className="text-blue-400/80 shrink-0 transform group-hover:scale-110 transition-transform" />
              <p className="text-white/70 font-sans text-xs font-medium tracking-wide">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Branding Inside Banner */}
      <div className="relative z-10 text-[10px] tracking-widest uppercase text-white/20 font-sans font-bold">
        © Pana.Hub Indexing
      </div>
    </div>
  );
};

export default AuthBanner;