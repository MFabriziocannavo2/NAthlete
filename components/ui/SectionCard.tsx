import type { ReactNode } from "react";

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
    <div className={`py-5 border-b border-white/10 last:border-0 ${className}`}>
      <h2 className="flex items-center gap-2 text-base font-semibold text-white mb-4">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  );
}
