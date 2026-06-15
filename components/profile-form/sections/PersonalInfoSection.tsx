import { useState } from "react"
import { Input } from "@/components/ui/Input"
import AvatarUpload from "@/components/AvatarUpload"
import SearchableSelect from "@/components/ui/SearchableSelect"
import { COUNTRIES, OTHER_COUNTRY } from "@/lib/countries"
import type { SectionProps } from "../types"

const NATIONALITY_OPTIONS = [...COUNTRIES, OTHER_COUNTRY]

export default function PersonalInfoSection({ form, onChange, setForm }: SectionProps) {
  const isKnownCountry = (value: string) =>
    COUNTRIES.includes(value as (typeof COUNTRIES)[number])

  // Tracks whether "Other" is selected even while the custom nationality text is empty.
  const [otherSelected, setOtherSelected] = useState(
    () => !!form.nationality && !isKnownCountry(form.nationality)
  )

  const dropdownValue = otherSelected ? OTHER_COUNTRY : form.nationality
  const showCustomInput = otherSelected

  const handleNationalitySelect = (selected: string) => {
    if (selected === OTHER_COUNTRY) {
      setOtherSelected(true)
      if (isKnownCountry(form.nationality)) {
        setForm({ ...form, nationality: "" })
      }
    } else {
      setOtherSelected(false)
      setForm({ ...form, nationality: selected })
    }
  }

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

      <div>
        <SearchableSelect
          name="nationality"
          options={NATIONALITY_OPTIONS}
          value={dropdownValue}
          onChange={handleNationalitySelect}
          placeholder="Nationality"
        />
        {showCustomInput && (
          <Input
            name="nationality"
            placeholder="Enter your nationality"
            value={form.nationality}
            onChange={onChange}
            className="mt-2"
          />
        )}
      </div>

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
