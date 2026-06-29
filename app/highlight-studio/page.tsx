"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import Navbar from "@/components/Navbar";
import LoadingScreen from "@/components/ui/LoadingScreen";
import HighlightStudio from "@/components/highlight-studio/HighlightStudio";

export default function HighlightStudioPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Create Your Own{" "}
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              Highlight Video
            </span>
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Build, edit, and export your professional highlight reel directly inside NAthlete.
          </p>
        </div>

        <HighlightStudio />
      </div>
    </div>
  );
}
