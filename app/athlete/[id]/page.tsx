"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import Navbar from "@/components/Navbar";
import AthleteProfile from "@/components/AthleteProfile";
import PrivateProfileGate from "@/components/PrivateProfileGate";
import type { Athlete, AthletePreview } from "@/lib/types";

export default function AthletePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params?.id as string;

  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [preview, setPreview] = useState<AthletePreview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchAthlete = async () => {
      const { data, error } = await supabase
        .from("athletes")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) console.error("Failed to fetch athlete:", error.message);

      // Friendly URLs are the canonical link once a username is set.
      if (data?.username) {
        router.replace(`/${data.username}`);
        return;
      }

      if (data) {
        setAthlete(data);
        setLoading(false);
        return;
      }

      const { data: previewData, error: previewError } = await supabase
        .rpc("get_athlete_preview_by_id", { p_id: id })
        .maybeSingle();

      if (previewError) {
        console.error("Failed to fetch athlete preview:", previewError.message);
      }

      const preview = (previewData as AthletePreview | null) ?? null;

      if (preview?.username) {
        router.replace(`/${preview.username}`);
        return;
      }

      setPreview(preview);
      setLoading(false);
    };

    fetchAthlete();
  }, [id, router]);

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
