"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/AuthContext"
import { profilePath, sanitizeForDb } from "@/lib/profile"
import Navbar from "@/components/Navbar"
import LoadingScreen from "@/components/ui/LoadingScreen"
import Logo from "@/components/ui/Logo"
import AthleteForm, { type AthleteFormValues } from "@/components/AthleteForm"
import type { Athlete } from "@/lib/types"

function toFormValues(athlete: Athlete): AthleteFormValues {
  return {
    username: athlete.username ?? "",
    profile_photo_url: athlete.profile_photo_url ?? "",
    name: athlete.name ?? "",
    date_of_birth: athlete.date_of_birth ?? "",
    nationality: athlete.nationality ?? "",
    location: athlete.location ?? "",
    languages: athlete.languages ?? "",
    sport: athlete.sport ?? "",
    position: athlete.position ?? "",
    height: athlete.height ?? "",
    weight: athlete.weight ?? "",
    school: athlete.school ?? "",
    graduation_year: athlete.graduation_year ?? "",
    gpa: athlete.gpa != null ? String(athlete.gpa) : "",
    sat: athlete.sat ?? "",
    act: athlete.act ?? "",
    toefl: athlete.toefl ?? "",
    det: athlete.det ?? "",
    academic_awards: athlete.academic_awards ?? "",
    highlight_video: athlete.highlight_video ?? "",
    bio: athlete.bio ?? "",
    achievements: athlete.achievements ?? "",
    achievements_json: athlete.achievements_json ?? [],
    media_gallery: athlete.media_gallery ?? "",
    vertical_jump: athlete.vertical_jump ?? "",
    sprint_time: athlete.sprint_time ?? "",
    vo2_max: athlete.vo2_max ?? "",
    dominant_foot: athlete.dominant_foot ?? "",
    body_fat: athlete.body_fat ?? "",
    resting_hr: athlete.resting_hr ?? "",
    preferred_positions: athlete.preferred_positions ?? "",
    jersey_number: athlete.jersey_number ?? "",
    current_team: athlete.current_team ?? "",
    team_type: athlete.team_type ?? "",
    recruiting_status: athlete.recruiting_status ?? "",
    agent_contact: athlete.agent_contact ?? "",
    instagram_url: athlete.instagram_url ?? "",
    twitter_url: athlete.twitter_url ?? "",
    linkedin_url: athlete.linkedin_url ?? "",
    is_private: athlete.is_private ?? false,
  }
}

export default function EditProfile() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [athlete, setAthlete] = useState<Athlete | null>(null)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [loading, user, router])

  useEffect(() => {
    if (!user) return

    const fetchAthlete = async () => {
      const { data, error } = await supabase
        .from("athletes")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()

      if (error) console.error("Failed to fetch profile:", error.message)

      if (!data) {
        router.push("/create-profile")
        return
      }

      setAthlete(data)
      setFetching(false)
    }

    fetchAthlete()
  }, [user, router])

  const handleSubmit = async (values: AthleteFormValues) => {
    if (!athlete) return

    const { username, ...rest } = values

    const { data, error } = await supabase
      .from("athletes")
      .update({ ...sanitizeForDb(rest), username: username || null })
      .eq("id", athlete.id)
      .select()
      .single()

    if (error) {
      console.error(error)
      if (error.code === "23505") {
        return { error: "That username is already taken. Please choose another one." }
      }
      return { error: "Error updating profile: " + error.message }
    }

    router.push(profilePath(data))
  }

  if (loading || !user || fetching || !athlete) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8 text-center">
          <Logo size="lg" className="justify-center mb-4" />
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Edit Your Profile
          </h1>
          <p className="text-gray-400">
            Jump to any section below to complete or update your athletic
            identity. Your changes are saved when you submit the form.
          </p>
        </div>

        <AthleteForm
          mode="full"
          initialValues={toFormValues(athlete)}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
          submittingLabel="Saving..."
        />
      </div>
    </div>
  )
}
