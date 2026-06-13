import { Input } from "@/components/ui/Input"
import type { SectionProps } from "../types"

export default function PhysiologicalSection({ form, onChange }: SectionProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Input
        name="dominant_foot"
        placeholder="Dominant Foot / Hand"
        value={form.dominant_foot}
        onChange={onChange}
      />

      <Input
        name="vertical_jump"
        placeholder="Vertical Jump (cm)"
        value={form.vertical_jump}
        onChange={onChange}
      />

      <Input
        name="sprint_time"
        placeholder="Sprint Time (e.g. 40-yard dash)"
        value={form.sprint_time}
        onChange={onChange}
      />

      <Input
        name="vo2_max"
        placeholder="VO2 Max (ml/kg/min)"
        value={form.vo2_max}
        onChange={onChange}
      />

      <Input
        name="body_fat"
        placeholder="Body Fat (%)"
        value={form.body_fat}
        onChange={onChange}
      />

      <Input
        name="resting_hr"
        placeholder="Resting Heart Rate (bpm)"
        value={form.resting_hr}
        onChange={onChange}
      />
    </div>
  )
}
