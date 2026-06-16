import { Input, Textarea } from "@/components/ui/Input"
import type { SectionProps } from "../types"

export default function AcademicInfoSection({ form, onChange }: SectionProps) {
  return (
    <>
      <Input
        name="school"
        placeholder="School / University"
        value={form.school}
        onChange={onChange}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          name="graduation_year"
          placeholder="Graduation Year"
          value={form.graduation_year}
          onChange={onChange}
        />

        <Input
          name="gpa"
          placeholder="GPA (e.g. 4.0)"
          value={form.gpa}
          onChange={onChange}
          inputMode="decimal"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          name="sat"
          placeholder="SAT Score (optional)"
          value={form.sat}
          onChange={onChange}
        />

        <Input
          name="act"
          placeholder="ACT Score (optional)"
          value={form.act}
          onChange={onChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          name="toefl"
          placeholder="TOEFL Score (optional)"
          value={form.toefl}
          onChange={onChange}
        />

        <Input
          name="det"
          placeholder="Duolingo English Test (optional)"
          value={form.det}
          onChange={onChange}
        />
      </div>

      <Textarea
        name="academic_awards"
        placeholder={"Academic Awards (one per line)\ne.g. Honor Roll 2024\nNational Merit Scholar"}
        value={form.academic_awards}
        onChange={onChange}
        rows={3}
      />
    </>
  )
}
