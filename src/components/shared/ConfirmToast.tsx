"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

interface ConfirmToastProps {
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

export const confirmToast = ({
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "destructive",
}: ConfirmToastProps) => {
  toast.custom((t) => (
    <div className="relative flex w-full max-w-[340px] flex-col gap-4 overflow-hidden rounded-[1.8rem] border border-white/60 bg-white/90 p-5 shadow-[0_20px_50px_-12px_rgba(95,76,55,0.2)] backdrop-blur-xl animate-in fade-in zoom-in duration-300">
      {/* Decorative background element */}
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 blur-2xl ${variant === 'destructive' ? 'bg-red-500' : 'bg-primary'}`} />
      
      <div className="flex items-start gap-4">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm ${
          variant === "destructive" 
            ? "bg-red-50 text-red-600 border border-red-100" 
            : "bg-primary/10 text-primary border border-primary/20"
        }`}>
          {variant === "destructive" ? (
            <AlertCircle className="h-5 w-5" />
          ) : (
            <CheckCircle2 className="h-5 w-5" />
          )}
        </div>
        <div className="flex-1 pr-2">
          <h3 className="text-[15px] font-bold tracking-tight text-foreground">Confirm Action</h3>
          <p className="mt-1.5 text-xs leading-relaxed font-medium text-muted-foreground/80">
            {message}
          </p>
        </div>
        <button 
          onClick={() => toast.dismiss(t)}
          className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground/40 hover:bg-black/5 hover:text-muted-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-2.5 pt-1">
        <Button
          variant="ghost"
          className="h-10 flex-1 rounded-[1.1rem] text-[13px] font-semibold text-muted-foreground hover:bg-black/5 transition-all"
          onClick={() => {
            if (onCancel) onCancel();
            toast.dismiss(t);
          }}
        >
          {cancelText}
        </Button>
        <Button
          variant={variant === "destructive" ? "destructive" : "default"}
          className={`h-10 flex-1 rounded-[1.1rem] text-[13px] font-bold shadow-md transition-all active:scale-[0.98] ${
            variant === 'destructive' 
              ? 'bg-red-600 hover:bg-red-700 shadow-red-200/50' 
              : 'bg-primary hover:bg-primary/90 shadow-primary/20'
          }`}
          onClick={() => {
            onConfirm();
            toast.dismiss(t);
          }}
        >
          {confirmText}
        </Button>
      </div>
    </div>
  ), {
    duration: 10000, // Show for 10 seconds or until dismissed
    position: "top-center",
  });
};
