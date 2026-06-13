import { Input } from "@/components/ui/Input"
import AvatarUpload from "@/components/AvatarUpload"
import type { SectionProps } from "../types"

export default function PersonalInfoSection({ form, onChange, setForm }: SectionProps) {
  return (
    <>
      <AvatarUpload
        name={form.name}
        photoUrl={form.profile_photo_url}
        onChange={(url) => setForm({ ...form, profile_photo_url: url })}
      />

      <Input
        name="name"
        placeholder="Full Name *"
        value={form.name}
        onChange={onChange}
        required
      />

      <div>
        <Input
          name="username"
          placeholder="Username (e.g. johndoe23)"
          value={form.username}
          onChange={onChange}
          pattern="[a-z0-9_-]{3,30}"
          title="3-30 characters: lowercase letters, numbers, hyphens and underscores"
        />
        <p className="text-xs text-gray-500 mt-1">
          Your public profile URL: nathlete.com/
          {form.username.trim().toLowerCase() || "yourusername"}
        </p>
      </div>

      <Input
        type="date"
        name="date_of_birth"
        value={form.date_of_birth}
        onChange={onChange}
        className="[color-scheme:dark]"
      />

      <Input
        name="nationality"
        placeholder="Nationality"
        value={form.nationality}
        onChange={onChange}
      />

      <Input
        name="location"
        placeholder="City / Country"
        value={form.location}
        onChange={onChange}
      />

      <Input
        name="languages"
        placeholder="Languages Spoken (English, Spanish, etc)"
        value={form.languages}
        onChange={onChange}
      />
    </>
  )
}
