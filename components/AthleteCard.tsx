import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import { getYouTubeThumbnail } from "@/lib/youtube";
import { profilePath } from "@/lib/profile";
import type { Athlete } from "@/lib/types";

export default function AthleteCard({ athlete }: { athlete: Athlete }) {
  const thumbnail = athlete.highlight_video
    ? getYouTubeThumbnail(athlete.highlight_video)
    : null;

  return (
    <Link href={profilePath(athlete)}>
      <GlassCard className="overflow-hidden h-full hover:bg-white/10 transition group">
        <div className="h-40 bg-gray-800 flex items-center justify-center overflow-hidden">
          {thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnail}
              alt={`${athlete.name} highlight`}
              className="w-full h-full object-cover group-hover:scale-105 transition"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-xl font-bold">
              {athlete.name?.charAt(0)}
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-white">{athlete.name}</h3>
          <p className="text-sm text-gray-400">
            {athlete.sport} • {athlete.position}
          </p>
          {(athlete.school || athlete.location) && (
            <p className="text-xs text-gray-500 mt-1">
              {[athlete.school, athlete.location].filter(Boolean).join(" • ")}
            </p>
          )}
        </div>
      </GlassCard>
    </Link>
  );
}
