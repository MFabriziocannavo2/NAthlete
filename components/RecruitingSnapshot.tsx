import { ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";
import GlassCard from "@/components/ui/GlassCard";
import type { Athlete } from "@/lib/types";

export default function RecruitingSnapshot({ athlete }: { athlete: Athlete }) {
  const fields = [
    { label: "Graduation Year", value: athlete.graduation_year },
    { label: "Recruiting Status", value: athlete.recruiting_status },
    { label: "Current Team", value: athlete.current_team },
    { label: "Team Type", value: athlete.team_type },
    { label: "GPA", value: athlete.gpa },
    { label: "Location", value: athlete.location },
    { label: "Citizenship", value: athlete.nationality },
  ].filter((field) => field.value);

  if (fields.length === 0) return null;

  return (
    <GlassCard className="px-6 py-5">
      <h2 className="flex items-center gap-2 text-base font-semibold text-white mb-4">
        <ClipboardDocumentCheckIcon className="w-5 h-5 text-orange-400" />
        Recruiting Snapshot
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-4">
        {fields.map((field) => (
          <div key={field.label} className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-400">{field.label}</span>
            <span className="text-sm font-semibold text-white">{field.value}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
