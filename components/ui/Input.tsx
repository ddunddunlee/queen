import type { InputHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`focus-ring min-h-10 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 ${className}`}
      {...props}
    />
  );
}
