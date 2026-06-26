import type { SelectHTMLAttributes } from "react";

export function Select({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`focus-ring min-h-10 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-slate-900 ${className}`}
      {...props}
    />
  );
}
