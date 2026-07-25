"use client";

import React from "react";

interface BadgeProps {
  variant?: "primary" | "secondary" | "success" | "neutral" | "danger" | "warning";
  children: React.ReactNode;
  className?: string;
}

export default function Badge({
  variant = "neutral",
  children,
  className = ""
}: BadgeProps) {
  const styles = {
    primary: "bg-blue-50 text-blue-700 border-blue-100",
    secondary: "bg-orange-50 text-orange-700 border-orange-100",
    success: "bg-green-50 text-green-700 border-green-100",
    neutral: "bg-slate-50 text-slate-600 border-slate-100",
    danger: "bg-red-50 text-red-700 border-red-100",
    warning: "bg-yellow-50 text-yellow-700 border-yellow-100"
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border tracking-wider uppercase ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}
