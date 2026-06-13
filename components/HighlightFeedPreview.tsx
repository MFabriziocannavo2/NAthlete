import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AthleteCard from "@/components/AthleteCard";
import type { Athlete } from "@/lib/types";

export default async function HighlightFeedPreview() {
  const { data: athletes } = await supabase
    .from("athletes")
    .select("*")
    .not("highlight_video", "is", null)
    .order("created_at", { ascending: false })
    .limit(3);

  const highlights = (athletes ?? []) as Athlete[];

  return (
    <section id="highlights" className="py-20 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4 text-white">
          Featured Athletic Journeys
        </h2>

        <p className="text-gray-400 mb-10">
          Get a glimpse of the highlight reels and athletic journeys athletes
          are showcasing on their NAthlete profiles.
        </p>

        {highlights.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-12 text-gray-400">
            No highlights have been posted yet.{" "}
            <Link
              href="/create-profile"
              className="text-orange-400 hover:text-orange-300 font-medium underline"
            >
              Be the first to share yours
            </Link>
            .
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {highlights.map((athlete) => (
              <AthleteCard key={athlete.id} athlete={athlete} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
