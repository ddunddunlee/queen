import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <section
      className={`rounded-lg border border-line bg-panel/90 p-5 shadow-glow backdrop-blur ${className}`}
      {...props}
    />
  );
}
