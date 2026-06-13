import { Input, Select } from "@/components/ui/Input"
import { RECRUITING_STATUSES, TEAM_TYPES } from "@/lib/types"
import type { SectionProps } from "../types"

export default function TeamInfoSection({ form, onChange }: SectionProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Input
          name="current_team"
          placeholder="Current Team / Club"
          value={form.current_team}
          onChange={onChange}
        />

        <Select name="team_type" value={form.team_type} onChange={onChange}>
          <option value="">Team Type</option>
          {TEAM_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          name="jersey_number"
          placeholder="Jersey Number"
          value={form.jersey_number}
          onChange={onChange}
        />

        <Input
          name="preferred_positions"
          placeholder="Preferred Position(s)"
          value={form.preferred_positions}
          onChange={onChange}
        />
      </div>

      <Select name="recruiting_status" value={form.recruiting_status} onChange={onChange}>
        <option value="">Recruiting Status</option>
        {RECRUITING_STATUSES.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </Select>
    </>
  )
}
