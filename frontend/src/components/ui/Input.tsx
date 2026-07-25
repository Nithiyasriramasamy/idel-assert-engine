"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export default function Input({
  label,
  error,
  icon,
  className = "",
  id,
  ...props
}: InputProps) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
          {label}
        </label>
      )}
      <div className="relative rounded-xl shadow-sm">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            {icon}
          </div>
        )}
        <input
          id={id}
          className={`w-full bg-white border border-slate-200 text-slate-800 placeholder-slate-400 text-sm rounded-xl py-2.5 transition-all duration-200 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 ${
            icon ? "pl-10 pr-4" : "px-4"
          } ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}
