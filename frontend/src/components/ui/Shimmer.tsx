"use client";

import React from "react";

interface ShimmerProps {
  className?: string;
  variant?: "card" | "line" | "circle";
}

export default function Shimmer({ className = "", variant = "line" }: ShimmerProps) {
  if (variant === "card") {
    return (
      <div className={`border border-slate-100 rounded-2xl bg-white overflow-hidden shadow-sm animate-pulse ${className}`}>
        <div className="aspect-video bg-slate-100" />
        <div className="p-4 space-y-3">
          <div className="h-4 bg-slate-100 rounded-lg w-2/3" />
          <div className="h-3 bg-slate-100 rounded-lg w-1/2" />
          <div className="pt-3 border-t border-slate-50 flex justify-between items-center">
            <div className="h-5 bg-slate-100 rounded-lg w-1/4" />
            <div className="h-8 bg-slate-100 rounded-xl w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "circle") {
    return <div className={`bg-slate-100 rounded-full animate-pulse ${className}`} />;
  }

  return <div className={`h-4 bg-slate-100 rounded-lg animate-pulse ${className}`} />;
}
