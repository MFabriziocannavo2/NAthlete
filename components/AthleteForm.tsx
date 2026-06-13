"use client"

import { useState, type FormEvent, type ReactNode } from "react"
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
import Button from "@/components/ui/Button"
import FormSection from "@/components/profile-form/FormSection"
import ProgressBar from "@/components/profile-form/ProgressBar"
import PersonalInfoSection from "@/components/profile-form/sections/PersonalInfoSection"
import SportInfoSection from "@/components/profile-form/sections/SportInfoSection"
import AcademicInfoSection from "@/components/profile-form/sections/AcademicInfoSection"
import TeamInfoSection from "@/components/profile-form/sections/TeamInfoSection"
import PhysiologicalSection from "@/components/profile-form/sections/PhysiologicalSection"
import RecruitingSection from "@/components/profile-form/sections/RecruitingSection"
import ContactSection from "@/components/profile-form/sections/ContactSection"
import PrivacySection from "@/components/profile-form/sections/PrivacySection"
import type { SectionBadgeType, SectionProps } from "@/components/profile-form/types"
import { parseLines, validateUsername } from "@/lib/profile"
import { isHttpUrl } from "@/lib/url"
import { saveProfileDraft, clearProfileDraft } from "@/lib/profileDraft"
import { emptyAthleteForm, type AthleteFormValues } from "@/lib/types"

export { emptyAthleteForm }
export type { AthleteFormValues }

interface SectionDef {
  id: string
  title: string
  icon: ReactNode
  badge: SectionBadgeType
  description?: string
  Component: (props: SectionProps) => ReactNode
}

const SECTIONS: SectionDef[] = [
  {
    id: "personal",
    title: "Personal Information",
    icon: <UserIcon className="w-5 h-5 text-orange-400" />,
    badge: "required",
    description: "Your name is required to publish your profile. Everything else here helps coaches get to know you.",
    Component: PersonalInfoSection,
  },
  {
    id: "sport",
    title: "Sport Information",
    icon: <BoltIcon className="w-5 h-5 text-orange-400" />,
    badge: "required",
    description: "Sport and position are required so coaches can find you in the right category.",
    Component: SportInfoSection,
  },
  {
    id: "academic",
    title: "Academic Information",
    icon: <AcademicCapIcon className="w-5 h-5 text-orange-400" />,
    badge: "recommended",
    description: "Academic details help recruiters evaluate eligibility and fit. Add now or come back later.",
    Component: AcademicInfoSection,
  },
  {
    id: "team",
    title: "Team & Roster Info",
    icon: <UserGroupIcon className="w-5 h-5 text-orange-400" />,
    badge: "recommended",
    description: "Share your current team and recruiting status so coaches know where you stand.",
    Component: TeamInfoSection,
  },
  {
    id: "physiological",
    title: "Physiological Data",
    icon: <ScaleIcon className="w-5 h-5 text-orange-400" />,
    badge: "optional",
    description: "Performance metrics are a nice-to-have that can strengthen your profile over time.",
    Component: PhysiologicalSection,
  },
  {
    id: "recruiting",
    title: "Recruiting",
    icon: <TrophyIcon className="w-5 h-5 text-orange-400" />,
    badge: "recommended",
    description: "Highlight videos, achievements and your bio are what coaches remember most.",
    Component: RecruitingSection,
  },
  {
    id: "contact",
    title: "Contact & Social Links",
    icon: <IdentificationIcon className="w-5 h-5 text-orange-400" />,
    badge: "optional",
    description: "Make it easy for coaches, recruiters, and universities to reach you and follow your journey.",
    Component: ContactSection,
  },
  {
    id: "privacy",
    title: "Privacy",
    icon: <LockClosedIcon className="w-5 h-5 text-orange-400" />,
    badge: "optional",
    Component: PrivacySection,
  },
]

export default function AthleteForm({
  initialValues = emptyAthleteForm,
  onSubmit,
  submitLabel = "Create Profile",
  submittingLabel = "Creating...",
  mode = "full",
  userId,
}: {
  initialValues?: AthleteFormValues
  onSubmit: (values: AthleteFormValues) => Promise<{ error?: string } | void>
  submitLabel?: string
  submittingLabel?: string
  mode?: "wizard" | "full"
  userId?: string
}) {
  const [form, setForm] = useState<AthleteFormValues>(initialValues)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(0)
  const [draftSaved, setDraftSaved] = useState(false)

  const isWizard = mode === "wizard"
  const isLastStep = step === SECTIONS.length - 1

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const validateStep = (stepIndex: number): string | null => {
    const section = SECTIONS[stepIndex]
    if (section.id === "personal" && !form.name.trim()) {
      return "Full name is required."
    }
    if (section.id === "sport" && (!form.sport.trim() || !form.position.trim())) {
      return "Sport and position are required."
    }
    return null
  }

  const validateAll = (): string | null => {
    if (!form.name.trim() || !form.sport.trim() || !form.position.trim()) {
      return "Name, sport and position are required."
    }

    const usernameError = validateUsername(form.username.trim().toLowerCase())
    if (usernameError) {
      return usernameError
    }

    const linkFields: { label: string; value: string }[] = [
      { label: "Highlight video", value: form.highlight_video },
      { label: "Instagram URL", value: form.instagram_url },
      { label: "X / Twitter URL", value: form.twitter_url },
      { label: "LinkedIn URL", value: form.linkedin_url },
      ...parseLines(form.media_gallery).map((value) => ({ label: "Media gallery", value })),
    ]

    const invalidLink = linkFields.find(
      (field) => field.value.trim() && !isHttpUrl(field.value.trim())
    )

    if (invalidLink) {
      return `${invalidLink.label} must be a valid http:// or https:// URL.`
    }

    return null
  }

  const handleBack = () => {
    setError(null)
    setStep((s) => Math.max(0, s - 1))
  }

  const handleSaveDraft = () => {
    if (!userId) return
    saveProfileDraft(userId, form)
    setDraftSaved(true)
    setTimeout(() => setDraftSaved(false), 4000)
  }

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (isWizard && !isLastStep) {
      const stepError = validateStep(step)
      if (stepError) {
        setError(stepError)
        return
      }
      setStep((s) => Math.min(s + 1, SECTIONS.length - 1))
      return
    }

    const validationError = validateAll()
    if (validationError) {
      setError(validationError)
      return
    }

    const username = form.username.trim().toLowerCase()

    setIsSubmitting(true)
    const result = await onSubmit({ ...form, username })
    setIsSubmitting(false)

    if (result?.error) {
      setError(result.error)
      return
    }

    if (userId) {
      clearProfileDraft(userId)
    }
  }

  return (
    <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
      {isWizard ? (
        <>
          <ProgressBar
            steps={SECTIONS.map((section) => ({ id: section.id, title: section.title }))}
            currentStep={step}
          />
          {(() => {
            const section = SECTIONS[step]
            const Component = section.Component
            return (
              <FormSection
                title={section.title}
                icon={section.icon}
                badge={section.badge}
                description={section.description}
              >
                <Component form={form} onChange={handleChange} setForm={setForm} />
              </FormSection>
            )
          })()}
        </>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 -mb-2">
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#section-${section.id}`}
                className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition"
              >
                {section.title}
              </a>
            ))}
          </div>
          {SECTIONS.map((section) => {
            const Component = section.Component
            return (
              <FormSection
                key={section.id}
                id={`section-${section.id}`}
                title={section.title}
                icon={section.icon}
                badge={section.badge}
                description={section.description}
              >
                <Component form={form} onChange={handleChange} setForm={setForm} />
              </FormSection>
            )
          })}
        </>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}
      {draftSaved && (
        <p className="text-sm text-green-400">
          Progress saved! You can come back anytime to finish your profile.
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        {isWizard && step > 0 && (
          <Button type="button" variant="secondary" onClick={handleBack} className="sm:w-auto">
            Back
          </Button>
        )}
        {isWizard && userId && (
          <Button
            type="button"
            variant="secondary"
            onClick={handleSaveDraft}
            className="sm:w-auto"
          >
            Save &amp; Continue Later
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? submittingLabel : isWizard && !isLastStep ? "Next" : submitLabel}
        </Button>
      </div>
    </form>
  )
}
