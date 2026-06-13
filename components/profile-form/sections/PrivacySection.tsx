import type { SectionProps } from "../types"

export default function PrivacySection({ form, setForm }: SectionProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={form.is_private}
        onChange={(e) => setForm({ ...form, is_private: e.target.checked })}
        className="mt-1 w-4 h-4 accent-orange-500"
      />
      <span>
        <span className="block text-white font-medium">Private profile</span>
        <span className="block text-sm text-gray-400">
          Only people you approve can view your full profile. Others will see your name and
          photo with an option to request to follow.
        </span>
      </span>
    </label>
  )
}
