"use client"

import { useState } from "react"
import {
  AcademicCapIcon,
  BoltIcon,
  IdentificationIcon,
  LockClosedIcon,
  ScaleIcon,
  TrophyIcon,
  UserGroupIcon,
  UserIcon,
} from "@heroicons/react/24/outline"
import GlassCard from "@/components/ui/GlassCard"
import Button from "@/components/ui/Button"
import { Input, Select, Textarea } from "@/components/ui/Input"
import AchievementsEditor from "@/components/AchievementsEditor"
import AvatarUpload from "@/components/AvatarUpload"
import { validateUsername } from "@/lib/profile"
import { RECRUITING_STATUSES, TEAM_TYPES, type AchievementItem } from "@/lib/types"

export interface AthleteFormValues {
  username: string
  profile_photo_url: string
  name: string
  date_of_birth: string
  nationality: string
  location: string
  languages: string
  sport: string
  position: string
  height: string
  weight: string
  school: string
  graduation_year: string
  gpa: string
  sat: string
  act: string
  toefl: string
  det: string
  academic_awards: string
  highlight_video: string
  bio: string
  achievements: string
  achievements_json: AchievementItem[]
  media_gallery: string
  vertical_jump: string
  sprint_time: string
  vo2_max: string
  dominant_foot: string
  body_fat: string
  resting_hr: string
  preferred_positions: string
  jersey_number: string
  current_team: string
  team_type: string
  recruiting_status: string
  agent_contact: string
  instagram_url: string
  twitter_url: string
  linkedin_url: string
  is_private: boolean
}

export const emptyAthleteForm: AthleteFormValues = {
  username: "",
  profile_photo_url: "",
  name: "",
  date_of_birth: "",
  nationality: "",
  location: "",
  languages: "",
  sport: "",
  position: "",
  height: "",
  weight: "",
  school: "",
  graduation_year: "",
  gpa: "",
  sat: "",
  act: "",
  toefl: "",
  det: "",
  academic_awards: "",
  highlight_video: "",
  bio: "",
  achievements: "",
  achievements_json: [],
  media_gallery: "",
  vertical_jump: "",
  sprint_time: "",
  vo2_max: "",
  dominant_foot: "",
  body_fat: "",
  resting_hr: "",
  preferred_positions: "",
  jersey_number: "",
  current_team: "",
  team_type: "",
  recruiting_status: "",
  agent_contact: "",
  instagram_url: "",
  twitter_url: "",
  linkedin_url: "",
  is_private: false,
}

export default function AthleteForm({
  initialValues = emptyAthleteForm,
  onSubmit,
  submitLabel = "Create Profile",
  submittingLabel = "Creating...",
}: {
  initialValues?: AthleteFormValues
  onSubmit: (values: AthleteFormValues) => Promise<{ error?: string } | void>
  submitLabel?: string
  submittingLabel?: string
}) {
  const [form, setForm] = useState<AthleteFormValues>(initialValues)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!form.name.trim() || !form.sport.trim() || !form.position.trim()) {
      setError("Name, sport and position are required.")
      return
    }

    const username = form.username.trim().toLowerCase()
    const usernameError = validateUsername(username)

    if (usernameError) {
      setError(usernameError)
      return
    }

    setIsSubmitting(true)
    const result = await onSubmit({ ...form, username })
    setIsSubmitting(false)

    if (result?.error) {
      setError(result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* PERSONAL INFORMATION */}
      <GlassCard className="p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold mb-4 text-white">
          <UserIcon className="w-5 h-5 text-orange-400" />
          Personal Information
        </h2>
        <div className="flex flex-col gap-4">
          <AvatarUpload
            name={form.name}
            photoUrl={form.profile_photo_url}
            onChange={(url) => setForm({ ...form, profile_photo_url: url })}
          />

          <Input
            name="name"
            placeholder="Full Name *"
            value={form.name}
            onChange={handleChange}
            required
          />

          <div>
            <Input
              name="username"
              placeholder="Username (e.g. johndoe23)"
              value={form.username}
              onChange={handleChange}
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
            onChange={handleChange}
            className="[color-scheme:dark]"
          />

          <Input
            name="nationality"
            placeholder="Nationality"
            value={form.nationality}
            onChange={handleChange}
          />

          <Input
            name="location"
            placeholder="City / Country"
            value={form.location}
            onChange={handleChange}
          />

          <Input
            name="languages"
            placeholder="Languages Spoken (English, Spanish, etc)"
            value={form.languages}
            onChange={handleChange}
          />
        </div>
      </GlassCard>

      {/* SPORT INFORMATION */}
      <GlassCard className="p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold mb-4 text-white">
          <BoltIcon className="w-5 h-5 text-orange-400" />
          Sport Information
        </h2>
        <div className="flex flex-col gap-4">
          <Input
            name="sport"
            placeholder="Sport *"
            value={form.sport}
            onChange={handleChange}
            required
          />

          <Input
            name="position"
            placeholder="Position *"
            value={form.position}
            onChange={handleChange}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              name="height"
              placeholder="Height (cm)"
              value={form.height}
              onChange={handleChange}
            />

            <Input
              name="weight"
              placeholder="Weight (kg)"
              value={form.weight}
              onChange={handleChange}
            />
          </div>
        </div>
      </GlassCard>

      {/* SCHOOL / ACADEMICS */}
      <GlassCard className="p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold mb-4 text-white">
          <AcademicCapIcon className="w-5 h-5 text-orange-400" />
          Academic Information
        </h2>
        <div className="flex flex-col gap-4">
          <Input
            name="school"
            placeholder="School / University"
            value={form.school}
            onChange={handleChange}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              name="graduation_year"
              placeholder="Graduation Year"
              value={form.graduation_year}
              onChange={handleChange}
            />

            <Input
              name="gpa"
              placeholder="GPA"
              value={form.gpa}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              name="sat"
              placeholder="SAT Score (optional)"
              value={form.sat}
              onChange={handleChange}
            />

            <Input
              name="act"
              placeholder="ACT Score (optional)"
              value={form.act}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              name="toefl"
              placeholder="TOEFL Score (optional)"
              value={form.toefl}
              onChange={handleChange}
            />

            <Input
              name="det"
              placeholder="Duolingo English Test (optional)"
              value={form.det}
              onChange={handleChange}
            />
          </div>

          <Textarea
            name="academic_awards"
            placeholder={"Academic Awards (one per line)\ne.g. Honor Roll 2024\nNational Merit Scholar"}
            value={form.academic_awards}
            onChange={handleChange}
            rows={3}
          />
        </div>
      </GlassCard>

      {/* TEAM & ROSTER */}
      <GlassCard className="p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold mb-4 text-white">
          <UserGroupIcon className="w-5 h-5 text-orange-400" />
          Team &amp; Roster Info
        </h2>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="current_team"
              placeholder="Current Team / Club"
              value={form.current_team}
              onChange={handleChange}
            />

            <Select
              name="team_type"
              value={form.team_type}
              onChange={handleChange}
            >
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
              onChange={handleChange}
            />

            <Input
              name="preferred_positions"
              placeholder="Preferred Position(s)"
              value={form.preferred_positions}
              onChange={handleChange}
            />
          </div>

          <Select name="recruiting_status" value={form.recruiting_status} onChange={handleChange}>
            <option value="">Recruiting Status</option>
            {RECRUITING_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </div>
      </GlassCard>

      {/* PHYSIOLOGICAL DATA */}
      <GlassCard className="p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold mb-4 text-white">
          <ScaleIcon className="w-5 h-5 text-orange-400" />
          Physiological Data
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Input
            name="dominant_foot"
            placeholder="Dominant Foot / Hand"
            value={form.dominant_foot}
            onChange={handleChange}
          />

          <Input
            name="vertical_jump"
            placeholder="Vertical Jump (cm)"
            value={form.vertical_jump}
            onChange={handleChange}
          />

          <Input
            name="sprint_time"
            placeholder="Sprint Time (e.g. 40-yard dash)"
            value={form.sprint_time}
            onChange={handleChange}
          />

          <Input
            name="vo2_max"
            placeholder="VO2 Max (ml/kg/min)"
            value={form.vo2_max}
            onChange={handleChange}
          />

          <Input
            name="body_fat"
            placeholder="Body Fat (%)"
            value={form.body_fat}
            onChange={handleChange}
          />

          <Input
            name="resting_hr"
            placeholder="Resting Heart Rate (bpm)"
            value={form.resting_hr}
            onChange={handleChange}
          />
        </div>
      </GlassCard>

      {/* RECRUITING */}
      <GlassCard className="p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold mb-4 text-white">
          <TrophyIcon className="w-5 h-5 text-orange-400" />
          Recruiting
        </h2>
        <div className="flex flex-col gap-4">
          <Input
            name="highlight_video"
            placeholder="Highlight Video Link (YouTube)"
            value={form.highlight_video}
            onChange={handleChange}
          />

          <Textarea
            name="bio"
            placeholder="Athlete Bio"
            value={form.bio}
            onChange={handleChange}
            rows={4}
          />

          <div>
            <p className="text-sm font-medium text-gray-300 mb-3">
              Athletic Achievements
            </p>
            <AchievementsEditor
              items={form.achievements_json}
              onChange={(achievements_json) =>
                setForm({ ...form, achievements_json })
              }
            />
          </div>

          <Textarea
            name="media_gallery"
            placeholder={"Media Gallery (one image or video URL per line)"}
            value={form.media_gallery}
            onChange={handleChange}
            rows={3}
          />
        </div>
      </GlassCard>

      {/* CONTACT & SOCIAL */}
      <GlassCard className="p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold mb-4 text-white">
          <IdentificationIcon className="w-5 h-5 text-orange-400" />
          Contact &amp; Social Links
        </h2>
        <div className="flex flex-col gap-4">
          <Input
            name="agent_contact"
            placeholder="Agent / Contact Email"
            value={form.agent_contact}
            onChange={handleChange}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              name="instagram_url"
              placeholder="Instagram URL"
              value={form.instagram_url}
              onChange={handleChange}
            />

            <Input
              name="twitter_url"
              placeholder="X / Twitter URL"
              value={form.twitter_url}
              onChange={handleChange}
            />

            <Input
              name="linkedin_url"
              placeholder="LinkedIn URL"
              value={form.linkedin_url}
              onChange={handleChange}
            />
          </div>
        </div>
      </GlassCard>

      {/* PRIVACY */}
      <GlassCard className="p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold mb-4 text-white">
          <LockClosedIcon className="w-5 h-5 text-orange-400" />
          Privacy
        </h2>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_private}
            onChange={(e) => setForm({ ...form, is_private: e.target.checked })}
            className="mt-1 w-4 h-4 accent-orange-500"
          />
          <span>
            <span className="block text-white font-medium">
              Private profile
            </span>
            <span className="block text-sm text-gray-400">
              Only people you approve can view your full profile. Others will
              see your name and photo with an option to request to follow.
            </span>
          </span>
        </label>
      </GlassCard>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? submittingLabel : submitLabel}
      </Button>
    </form>
  )
}
