"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AthleteCard from "@/components/AthleteCard";
import GlassCard from "@/components/ui/GlassCard";
import ButtonLink from "@/components/ui/ButtonLink";
import { Input } from "@/components/ui/Input";
import type { Athlete } from "@/lib/types";

export default function AthletesPage() {
  const { user, loading: authLoading } = useAuth();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState("");
  const [sport, setSport] = useState("");

  useEffect(() => {
    const fetchAthletes = async () => {
      const { data, error } = await supabase
        .from("athletes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch athletes:", error.message);
        setLoadError(true);
      }

      setAthletes(data ?? []);
      setLoading(false);
    };

    fetchAthletes();
  }, []);

  const sports = useMemo(() => {
    const unique = new Set(
      athletes.map((a) => a.sport).filter((s): s is string => !!s)
    );
    return Array.from(unique).sort();
  }, [athletes]);

  const filtered = useMemo(() => {
    return athletes.filter((a) => {
      const matchesSearch =
        !search ||
        a.name?.toLowerCase().includes(search.toLowerCase()) ||
        a.school?.toLowerCase().includes(search.toLowerCase()) ||
        a.position?.toLowerCase().includes(search.toLowerCase());

      const matchesSport = !sport || a.sport === sport;

      return matchesSearch && matchesSport;
    });
  }, [athletes, search, sport]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10 flex-1 w-full">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Discover Athletes
          </h1>
          <p className="text-gray-400 max-w-2xl">
            Explore athlete profiles, achievements, highlights, academics,
            recruiting information, and athletic journeys from athletes
            around the world.
          </p>
        </div>

        {!authLoading && !user && (
          <GlassCard className="p-5 sm:p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="font-semibold text-white">Are you an athlete?</p>
              <p className="text-sm text-gray-400">
                Build your own digital athletic identity and get discovered
                by coaches, recruiters, and universities.
              </p>
            </div>
            <ButtonLink href="/signup" className="w-full sm:w-auto shrink-0">
              Create Your Athlete Profile
            </ButtonLink>
          </GlassCard>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Input
            placeholder="Search by name, position, or school..."
            aria-label="Search by name, position, or school"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:flex-1"
          />

          <select
            value={sport}
            onChange={(e) => setSport(e.target.value)}
            aria-label="Filter by sport"
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition sm:w-56 [color-scheme:dark]"
          >
            <option value="">All sports</option>
            {sports.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading athletes...</p>
        ) : loadError ? (
          <p className="text-red-400">
            Couldn&apos;t load athletes. Please refresh the page to try again.
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-400">
            {athletes.length === 0
              ? "No athletes have joined yet. Be the first to create a profile!"
              : "No athletes found matching those criteria."}
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filtered.map((athlete) => (
              <AthleteCard key={athlete.id} athlete={athlete} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
