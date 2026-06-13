import { Input } from "@/components/ui/Input"
import type { SectionProps } from "../types"

export default function SportInfoSection({ form, onChange }: SectionProps) {
  return (
    <>
      <Input
        name="sport"
        placeholder="Sport *"
        value={form.sport}
        onChange={onChange}
        required
      />

      <Input
        name="position"
        placeholder="Position *"
        value={form.position}
        onChange={onChange}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          name="height"
          placeholder="Height (cm)"
          value={form.height}
          onChange={onChange}
        />

        <Input
          name="weight"
          placeholder="Weight (kg)"
          value={form.weight}
          onChange={onChange}
        />
      </div>
    </>
  )
}
