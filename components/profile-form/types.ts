import type { ChangeEvent } from "react"
import type { AthleteFormValues } from "@/lib/types"

export type FormChangeHandler = (
  e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) => void

export interface SectionProps {
  form: AthleteFormValues
  onChange: FormChangeHandler
  setForm: (form: AthleteFormValues) => void
}

export type SectionBadgeType = "required" | "recommended" | "optional"
