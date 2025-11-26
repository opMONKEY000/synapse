"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        <label className="font-chalk text-lg text-gray-700 block">
          {label}
        </label>
        <input
          ref={ref}
          className={cn(
            "w-full px-4 py-3 border-2 border-gray-200 rounded-lg",
            "font-sans text-gray-900 placeholder:text-gray-400",
            "focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none",
            "transition-colors",
            error && "border-red-400 focus:border-red-500 focus:ring-red-200",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600 font-sans">{error}</p>
        )}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";
