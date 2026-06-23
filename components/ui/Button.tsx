"use client";

import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  primary: "bg-sky text-ink hover:bg-[#7dcbff]",
  secondary: "bg-panelSoft text-white ring-1 ring-line hover:bg-[#1b2538]",
  ghost: "bg-transparent text-slate-200 hover:bg-white/10",
  danger: "bg-red-500/15 text-red-100 ring-1 ring-red-400/30 hover:bg-red-500/25"
};

export function Button({ className = "", variant = "primary", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
