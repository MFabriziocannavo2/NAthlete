"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/AuthContext"
import { profilePath, sanitizeForDb } from "@/lib/profile"
import { loadProfileDraft, clearProfileDraft } from "@/lib/profileDraft"
import Navbar from "@/components/Navbar"
import GlassCard from "@/components/ui/GlassCard"
import Button from "@/components/ui/Button"
import LoadingScreen from "@/components/ui/LoadingScreen"
import AthleteForm, { emptyAthleteForm, type AthleteFormValues } from "@/components/AthleteForm"

export default function CreateProfile() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [redirecting, setRedirecting] = useState(false)
  const [draftChoice, setDraftChoice] = useState<"pending" | "resume" | "fresh">("pending")
  const draft = useMemo<AthleteFormValues | null>(
    () => (user ? loadProfileDraft(user.id) : null),
    [user]
  )

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [loading, user, router])

  const handleSubmit = async (values: AthleteFormValues) => {
    if (!user) {
      router.push("/login")
      return
    }

    const { username, ...rest } = values

    const { data, error } = await supabase
      .from("athletes")
      .insert([{ ...sanitizeForDb(rest), username: username || null, user_id: user.id }])
      .select()
      .single()

    if (error) {
      console.error(error)
      if (error.code === "23505") {
        return { error: "That username is already taken. Please choose another one." }
      }
      return { error: "Error creating profile: " + error.message }
    }

    setRedirecting(true)
    router.push(profilePath(data))
  }

  if (redirecting) {
    return <LoadingScreen message="Setting up your profile..." />
  }

  if (loading || !user) {
    return <LoadingScreen />
  }

  if (draft && draftChoice === "pending") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
        <Navbar />

        <div className="max-w-2xl mx-auto px-6 py-12">
          <GlassCard className="p-6 text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Welcome back!</h1>
            <p className="text-gray-400 mb-6">
              We saved your progress from last time. Continue where you left off, or start fresh.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => setDraftChoice("resume")} className="sm:w-auto">
                Continue Where I Left Off
              </Button>
              <Button
                variant="secondary"
                className="sm:w-auto"
                onClick={() => {
                  clearProfileDraft(user.id)
                  setDraftChoice("fresh")
                }}
              >
                Start Fresh
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Create Your NAthlete Profile
          </h1>
          <p className="text-gray-400">
            Build your professional athletic identity step by step. Add what
            you can now, and save your progress to finish the rest later.
          </p>
        </div>

        <AthleteForm
          mode="wizard"
          userId={user.id}
          initialValues={draftChoice === "resume" && draft ? draft : emptyAthleteForm}
          onSubmit={handleSubmit}
          submitLabel="Create Profile"
          submittingLabel="Creating..."
        />
      </div>
    </div>
  )
}
