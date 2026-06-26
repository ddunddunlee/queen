import type { TextareaHTMLAttributes } from "react";

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`focus-ring w-full rounded-md border border-line bg-white px-3 py-2 text-sm leading-6 text-slate-900 placeholder:text-slate-400 ${className}`}
      {...props}
    />
  );
}
