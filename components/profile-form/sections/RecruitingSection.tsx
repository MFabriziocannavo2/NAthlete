import { Input, Textarea } from "@/components/ui/Input"
import AchievementsEditor from "@/components/AchievementsEditor"
import type { SectionProps } from "../types"

export default function RecruitingSection({ form, onChange, setForm }: SectionProps) {
  return (
    <>
      <Input
        name="highlight_video"
        placeholder="Highlight Video Link (YouTube)"
        value={form.highlight_video}
        onChange={onChange}
      />

      <Textarea
        name="bio"
        placeholder="Athlete Bio"
        value={form.bio}
        onChange={onChange}
        rows={4}
      />

      <div>
        <p className="text-sm font-medium text-gray-300 mb-3">Athletic Achievements</p>
        <AchievementsEditor
          items={form.achievements_json}
          onChange={(achievements_json) => setForm({ ...form, achievements_json })}
        />
      </div>

      <Textarea
        name="media_gallery"
        placeholder={"Media Gallery (one image or video URL per line)"}
        value={form.media_gallery}
        onChange={onChange}
        rows={3}
      />
    </>
  )
}
