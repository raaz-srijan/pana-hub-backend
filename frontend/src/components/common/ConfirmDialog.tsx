import React, { useEffect } from "react";
import { FiAlertTriangle, FiX, FiCheck, FiLoader } from "react-icons/fi";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary" | "success";
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      iconBg: "bg-red-50 text-danger",
      btnConfirm: "bg-danger hover:bg-red-700 focus:ring-red-600/10 shadow-red-600/10",
    },
    warning: {
      iconBg: "bg-amber-50 text-warning",
      btnConfirm: "bg-warning hover:bg-amber-600 focus:ring-warning/10 shadow-amber-600/10",
    },
    primary: {
      iconBg: "bg-indigo-50 text-primary",
      btnConfirm: "bg-primary hover:bg-primary-hover focus:ring-primary/10 shadow-indigo-600/10",
    },
    success: {
      iconBg: "bg-emerald-50 text-success",
      btnConfirm: "bg-success hover:bg-emerald-600 focus:ring-success/10 shadow-success/10",
    },
  };

  const currentStyle = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto">
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
        onClick={!isLoading ? onClose : undefined}
      />

      <div className="bg-card-bg border border-slate-200 w-full max-w-md rounded-xl p-5 shadow-xl relative z-10 transition-all transform scale-100 font-sans">
        
        <button
          type="button"
          disabled={isLoading}
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-main p-1.5 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all cursor-pointer disabled:opacity-40"
        >
          <FiX className="text-base" />
        </button>

        <div className="flex items-start gap-4 mt-1">
          <div className={`p-3 rounded-lg flex-shrink-0 ${currentStyle.iconBg}`}>
            <FiAlertTriangle size={20} />
          </div>
          
          <div className="space-y-1.5 w-full pr-6">
            <h3 className="font-serif text-base font-bold text-heading leading-tight">
              {title}
            </h3>
            <p className="text-xs text-text-muted font-medium leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 mt-6 pt-3 border-t border-slate-100">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="bg-background text-text-main border border-slate-200 font-sans font-semibold text-xs px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-all cursor-pointer select-none disabled:opacity-50"
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`inline-flex items-center justify-center gap-1.5 text-white font-sans font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer select-none focus:outline-none focus:ring-2 disabled:opacity-50 ${currentStyle.btnConfirm}`}
          >
            {isLoading ? (
              <FiLoader className="text-sm animate-spin" />
            ) : (
              <FiCheck className="text-sm" />
            )}
            <span>{isLoading ? "Processing..." : confirmText}</span>
          </button>
        </div>

      </div>
    </div>
  );
};