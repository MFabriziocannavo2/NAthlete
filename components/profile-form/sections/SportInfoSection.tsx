import { useState } from "react"
import { Input } from "@/components/ui/Input"
import SearchableSelect from "@/components/ui/SearchableSelect"
import { SPORTS, OTHER_SPORT } from "@/lib/sports"
import type { SectionProps } from "../types"

const SPORT_OPTIONS = [...SPORTS, OTHER_SPORT]

export default function SportInfoSection({ form, onChange, setForm }: SectionProps) {
  const isKnownSport = (sport: string) => SPORTS.includes(sport as (typeof SPORTS)[number])

  // Tracks whether "Other" is selected even while the custom sport text is empty.
  const [otherSelected, setOtherSelected] = useState(
    () => !!form.sport && !isKnownSport(form.sport)
  )

  const dropdownValue = otherSelected ? OTHER_SPORT : form.sport
  const showCustomInput = otherSelected

  const handleSportSelect = (selected: string) => {
    if (selected === OTHER_SPORT) {
      setOtherSelected(true)
      if (isKnownSport(form.sport)) {
        setForm({ ...form, sport: "" })
      }
    } else {
      setOtherSelected(false)
      setForm({ ...form, sport: selected })
    }
  }

  return (
    <>
      <div>
        <SearchableSelect
          name="sport"
          options={SPORT_OPTIONS}
          value={dropdownValue}
          onChange={handleSportSelect}
          placeholder="Select a sport *"
          required
        />
        {showCustomInput && (
          <Input
            name="sport"
            placeholder="Enter your sport *"
            value={form.sport}
            onChange={onChange}
            required
            className="mt-2"
          />
        )}
      </div>

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
          placeholder="Height (e.g. 6'2&quot;)"
          value={form.height}
          onChange={onChange}
        />

        <Input
          name="weight"
          placeholder="Weight (lbs)"
          value={form.weight}
          onChange={onChange}
          inputMode="decimal"
        />
      </div>
    </>
  )
}
