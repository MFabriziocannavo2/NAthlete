"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import Navbar from "@/components/Navbar";
import AthleteProfile from "@/components/AthleteProfile";
import PrivateProfileGate from "@/components/PrivateProfileGate";
import type { Athlete, AthletePreview } from "@/lib/types";

export default function UsernameProfileClient({ username }: { username: string }) {
  const { user } = useAuth();

  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [preview, setPreview] = useState<AthletePreview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;

    const fetchAthlete = async () => {
      const { data, error } = await supabase
        .from("athletes")
        .select("*")
        .eq("username", username)
        .maybeSingle();

      if (error) console.error("Failed to fetch athlete:", error.message);

      if (data) {
        setAthlete(data);
        setLoading(false);
        return;
      }

      const { data: previewData, error: previewError } = await supabase
        .rpc("get_athlete_preview", { p_username: username })
        .maybeSingle();

      if (previewError) {
        console.error("Failed to fetch athlete preview:", previewError.message);
      }

      setPreview((previewData as AthletePreview | null) ?? null);
      setLoading(false);
    };

    fetchAthlete();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
        <Navbar />
        <p className="p-6 text-gray-300">Loading...</p>
      </div>
    );
  }

  if (athlete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
        <Navbar />
        <AthleteProfile athlete={athlete} isOwner={user?.id === athlete.user_id} />
      </div>
    );
  }

  if (preview?.is_private) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
        <Navbar />
        <PrivateProfileGate athlete={preview} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      <Navbar />
      <p className="p-6 text-gray-300">Athlete not found.</p>
    </div>
  );
}
