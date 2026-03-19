"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, Loader2, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "onchain";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

interface ToastActions {
  toast: (options: Omit<ToastMessage, "id">) => string;
  dismiss: (id: string) => void;
  updateToast: (id: string, options: Partial<Omit<ToastMessage, "id">>) => void;
}

const ToastStateContext = createContext<ToastMessage[] | undefined>(undefined);
const ToastActionsContext = createContext<ToastActions | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ type, title, message, duration }: Omit<ToastMessage, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      
      let defaultDuration = 5000;
      if (type === "onchain") defaultDuration = 8000;
      if (type === "error") defaultDuration = 0;

      const finalDuration = duration !== undefined ? duration : defaultDuration;

      setToasts((prev) => {
        // Anti-loop check: don't add identical toast if it's already the most recent one
        const mostRecent = prev[0];
        if (mostRecent && 
            mostRecent.type === type && 
            mostRecent.title === title && 
            mostRecent.message === message) {
          return prev;
        }
        return [{ id, type, title, message, duration: finalDuration }, ...prev];
      });

      if (finalDuration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, finalDuration);
      }

      return id;
    },
    [dismiss]
  );

  const updateToast = useCallback((id: string, options: Partial<Omit<ToastMessage, "id">>) => {
    setToasts((prev) => {
      const existing = prev.find(t => t.id === id);
      if (!existing) return prev;

      // Check if anything actually changed to prevent loops
      const hasChanges = Object.entries(options).some(([key, value]) => {
        return (existing as any)[key] !== value;
      });

      if (!hasChanges) return prev;

      return prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, ...options };
          if (options.type === "success" && t.type === "onchain") {
            setTimeout(() => dismiss(id), 5000);
          }
          return updated;
        }
        return t;
      });
    });
  }, [dismiss]);

  const actions = React.useMemo(() => ({ toast, dismiss, updateToast }), [toast, dismiss, updateToast]);

  return (
    <ToastStateContext.Provider value={toasts}>
      <ToastActionsContext.Provider value={actions}>
        {children}
      </ToastActionsContext.Provider>
    </ToastStateContext.Provider>
  );
}

export function useToast() {
  const state = useContext(ToastStateContext);
  const actions = useContext(ToastActionsContext);
  if (state === undefined || actions === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return { ...actions, toasts: state };
}

export function useToastActions() {
  const actions = useContext(ToastActionsContext);
  if (actions === undefined) {
    throw new Error("useToastActions must be used within a ToastProvider");
  }
  return actions;
}

export function useToasts() {
  const state = useContext(ToastStateContext);
  if (state === undefined) {
    throw new Error("useToasts must be used within a ToastProvider");
  }
  return state;
}

export function ToastContainer() {
  const state = useContext(ToastStateContext);
  const actions = useContext(ToastActionsContext);
  
  if (state === undefined || actions === undefined) return null;
  
  const { dismiss } = actions;
  const toasts = state;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[70] flex flex-col items-center gap-3 w-full max-w-md px-4 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className="pointer-events-auto w-full bg-white/80 backdrop-blur-xl rounded-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-4 flex items-start gap-3"
          >
            <div className="flex-shrink-0 mt-0.5">
              {t.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              {t.type === "error" && <AlertCircle className="w-5 h-5 text-terracotta" />}
              {t.type === "info" && <Info className="w-5 h-5 text-blue-500" />}
              {t.type === "onchain" && <Loader2 className="w-5 h-5 text-terracotta animate-spin" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-deep-slate font-display">{t.title}</h4>
              <p className="text-sm text-deep-slate/70 mt-0.5 leading-snug">{t.message}</p>
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="flex-shrink-0 text-deep-slate/40 hover:text-deep-slate transition-colors p-1 -mr-1 -mt-1 rounded-lg hover:bg-deep-slate/5"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
