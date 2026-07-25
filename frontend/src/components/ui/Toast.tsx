"use client";

import React, { createContext, useContext, useState } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface ToastType {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextType {
  toast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const toast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col space-y-2.5 max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((t) => {
            const icons = {
              success: <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />,
              error: <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />,
              info: <Info className="h-5 w-5 text-blue-600 shrink-0" />
            };

            const bgClasses = {
              success: "bg-white border-green-100 shadow-green-500/5",
              error: "bg-white border-red-100 shadow-red-500/5",
              info: "bg-white border-blue-100 shadow-blue-500/5"
            };

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`flex items-center space-x-3.5 p-4 rounded-xl border shadow-lg ${bgClasses[t.type]}`}
              >
                {icons[t.type]}
                <p className="text-xs font-semibold text-slate-700 flex-1">{t.message}</p>
                <button
                  onClick={() => removeToast(t.id)}
                  className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
export const Toast = { Provider: ToastProvider };
