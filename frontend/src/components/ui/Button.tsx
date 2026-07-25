"use client";

import React from "react";
import { motion } from "framer-motion";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyle = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10 focus:ring-blue-500",
    secondary: "bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/10 focus:ring-orange-500",
    success: "bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-500/10 focus:ring-green-500",
    outline: "border border-slate-200 bg-transparent hover:bg-slate-50 text-slate-700 focus:ring-blue-500",
    ghost: "bg-transparent hover:bg-slate-50 text-slate-600 focus:ring-slate-500",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-md focus:ring-red-500"
  };

  const sizes = {
    sm: "px-3.5 py-1.5 text-xs rounded-lg",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...(props as any)}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </motion.button>
  );
}
