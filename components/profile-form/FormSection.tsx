import type { ReactNode } from "react"
import GlassCard from "@/components/ui/GlassCard"
import SectionBadge from "./SectionBadge"
import type { SectionBadgeType } from "./types"

export default function FormSection({
  id,
  title,
  icon,
  badge,
  description,
  children,
  className = "",
}: {
  id?: string
  title: string
  icon: ReactNode
  badge: SectionBadgeType
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <GlassCard id={id} className={`p-6 ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-1">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          {icon}
          {title}
        </h2>
        <SectionBadge type={badge} />
      </div>
      {description && <p className="text-sm text-gray-400 mb-4">{description}</p>}
      <div className={`flex flex-col gap-4 ${description ? "" : "mt-4"}`}>{children}</div>
    </GlassCard>
  )
}
