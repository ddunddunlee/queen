import type { InputHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`focus-ring min-h-10 w-full rounded-md border border-line bg-ink/70 px-3 py-2 text-sm text-white placeholder:text-slate-500 ${className}`}
      {...props}
    />
  );
}
