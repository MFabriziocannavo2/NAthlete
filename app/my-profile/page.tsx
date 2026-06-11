"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import { profilePath } from "@/lib/profile";
import Navbar from "@/components/Navbar";

export default function MyProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    const redirect = async () => {
      let { data, error } = await supabase
        .from("athletes")
        .select("id, username")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error?.message?.includes("JWT expired")) {
        await supabase.auth.refreshSession();
        ({ data, error } = await supabase
          .from("athletes")
          .select("id, username")
          .eq("user_id", user.id)
          .maybeSingle());
      }

      if (error) {
        console.error("Failed to fetch profile:", error.message);
        return;
      }

      router.replace(data ? profilePath(data) : "/create-profile");
    };

    redirect();
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      <Navbar />
      <p className="p-6 text-gray-300">Loading...</p>
    </div>
  );
}
