import { FaSpinner } from "react-icons/fa";

type Size = "sm" | "md" | "lg";
type Variant = "inline" | "fullscreen";

interface LoadingProps {
  text?: string;
  size?: Size;
  variant?: Variant;
}

const sizeClasses: Record<Size, string> = {
  sm: "w-5 h-5",
  md: "w-8 h-8",
  lg: "w-12 h-12",
};

const Loading = ({
  text = "Loading books...", 
  size = "md",
  variant = "inline",
}: LoadingProps) => {
  const baseWrapper = "flex flex-col items-center justify-center space-y-3";

  return (
    <div
      role="status"
      aria-live="polite"
      className={
        variant === "fullscreen"
          ? "fixed inset-0 flex items-center justify-center bg-ui-dark/5 bg-white/10 z-50 transition-all duration-300"
          : "w-full min-h-[200px] flex items-center justify-center"
      }
    >
      <div 
        className={
          variant === "fullscreen"
            ? `${baseWrapper}  backdrop-blur-md shadow-xl rounded-2xl p-8 max-w-xs w-full mx-4 text-center scale-100 animate-in fade-in zoom-in-95 duration-200`
            : baseWrapper
        }
      >
        <div className="relative flex items-center justify-center">
          <FaSpinner
            className={`${sizeClasses[size]} text-ui-dark animate-spin`}
          />
        </div>

        {text && (
          <p className="font-sans text-ui-muted text-xs font-medium uppercase tracking-wider animate-pulse">
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

export default Loading;