import type { TextareaHTMLAttributes } from "react";

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`focus-ring w-full rounded-md border border-line bg-ink/70 px-3 py-2 text-sm leading-6 text-white placeholder:text-slate-500 ${className}`}
      {...props}
    />
  );
}
