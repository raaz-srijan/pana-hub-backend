import { FiLoader } from "react-icons/fi";

type Size = "xs" | "sm" | "md" | "lg";
type Variant = "inline" | "table" | "fullscreen";

interface LoadingProps {
  text?: string;
  size?: Size;
  variant?: Variant;
}

const sizeClasses: Record<Size, string> = {
  xs: "w-4 h-4 stroke-[2.5]",
  sm: "w-5 h-5 stroke-[2.2]",
  md: "w-8 h-8 stroke-[1.8]",
  lg: "w-11 h-11 stroke-[1.5]",
};

const Loading = ({
  text = "Synchronizing backend data matrices...", 
  size = "md",
  variant = "inline",
}: LoadingProps) => {
  const baseWrapper = "flex flex-col items-center justify-center space-y-3.5";

  const variantContainers = {
    inline: "w-full py-12 flex items-center justify-center bg-transparent",
    
    table: "w-full min-h-[320px] flex items-center justify-center bg-slate-50/20 backdrop-blur-3xs rounded-xl border border-dashed border-slate-200/60 m-1",
    
    fullscreen: "fixed inset-0 flex items-center justify-center bg-slate-900/30 backdrop-blur-xs z-50 transition-all duration-300 animate-fade-in"
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={variantContainers[variant]}
    >
      <div 
        className={
          variant === "fullscreen"
            ? `${baseWrapper} bg-card-bg border border-slate-200 w-full max-w-xs mx-4 p-6 text-center rounded-xl shadow-xl scale-100 animate-in fade-in zoom-in-95 duration-200`
            : baseWrapper
        }
      >
        <div className="relative flex items-center justify-center">
          <FiLoader 
            className={`${sizeClasses[size]} text-slate-100 absolute transform pointer-events-none`} 
          />
          <FiLoader
            className={`${sizeClasses[size]} text-primary animate-spin relative z-10`}
          />
        </div>

        {text && (
          <p className="font-sans text-text-muted text-[10px] font-bold uppercase tracking-widest px-2 select-none animate-pulse text-center leading-relaxed">
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

export default Loading;