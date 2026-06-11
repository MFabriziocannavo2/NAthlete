import type { HTMLAttributes } from "react";

export default function GlassCard({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-xl ${className}`}
      {...props}
    />
  );
}
