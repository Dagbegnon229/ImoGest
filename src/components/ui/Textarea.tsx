"use client";
import { forwardRef } from "react";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-[#171717] mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-[#171717] placeholder:text-[#6b7280] transition-colors focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-y min-h-[100px] ${
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-[#e5e7eb] hover:border-[#6b7280]"
          } ${className}`}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={
            error
              ? `${textareaId}-error`
              : hint
                ? `${textareaId}-hint`
                : undefined
          }
          {...props}
        />
        {hint && !error && (
          <p
            id={`${textareaId}-hint`}
            className="mt-1 text-xs text-[#6b7280]"
          >
            {hint}
          </p>
        )}
        {error && (
          <p
            id={`${textareaId}-error`}
            className="mt-1 text-xs text-red-600"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
