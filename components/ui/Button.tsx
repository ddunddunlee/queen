"use client";

import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  primary: "bg-sky text-white hover:bg-[#155ee8]",
  secondary: "bg-panelSoft text-slate-800 ring-1 ring-line hover:bg-[#dfeeff]",
  ghost: "bg-transparent text-slate-700 hover:bg-sky/10",
  danger: "bg-red-50 text-red-700 ring-1 ring-red-200 hover:bg-red-100"
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
