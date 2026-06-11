import { ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";
import SectionCard from "@/components/ui/SectionCard";
import StatCard from "@/components/ui/StatCard";
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
    <SectionCard
      title="Recruiting Snapshot"
      icon={<ClipboardDocumentCheckIcon className="w-5 h-5 text-orange-400" />}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {fields.map((field) => (
          <StatCard key={field.label} label={field.label} value={field.value!} />
        ))}
      </div>
    </SectionCard>
  );
}
