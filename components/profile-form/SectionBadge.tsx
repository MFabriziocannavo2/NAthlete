import type { SectionBadgeType } from "./types"

const STYLES: Record<SectionBadgeType, string> = {
  required: "bg-orange-500/10 border-orange-500/30 text-orange-300",
  recommended: "bg-blue-500/10 border-blue-500/30 text-blue-300",
  optional: "bg-white/5 border-white/10 text-gray-400",
}

const LABELS: Record<SectionBadgeType, string> = {
  required: "Required",
  recommended: "Recommended",
  optional: "Optional",
}

export default function SectionBadge({ type }: { type: SectionBadgeType }) {
  return (
    <span
      className={`shrink-0 text-xs font-medium rounded-full border px-2.5 py-1 ${STYLES[type]}`}
    >
      {LABELS[type]}
    </span>
  )
}
