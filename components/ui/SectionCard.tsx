import type { ReactNode } from "react";
import GlassCard from "./GlassCard";

export default function SectionCard({
  title,
  icon,
  children,
  className = "",
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <GlassCard className={`p-6 ${className}`}>
      <h2 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
        {icon}
        {title}
      </h2>
      {children}
    </GlassCard>
  );
}
