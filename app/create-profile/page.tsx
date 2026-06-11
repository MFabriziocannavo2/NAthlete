"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/AuthContext"
import { profilePath, sanitizeForDb } from "@/lib/profile"
import Navbar from "@/components/Navbar"
import AthleteForm, { type AthleteFormValues } from "@/components/AthleteForm"

export default function CreateProfile() {
  const router = useRouter()
  const { user, loading } = useAuth()

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

    router.push(profilePath(data))
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
        <Navbar />
        <p className="p-6 text-gray-300">Loading...</p>
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
            Share your information so coaches and universities can discover
            you.
          </p>
        </div>

        <AthleteForm
          onSubmit={handleSubmit}
          submitLabel="Create Profile"
          submittingLabel="Creating..."
        />
      </div>
    </div>
  )
}
