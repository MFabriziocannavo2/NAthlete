import Link from "next/link";
import {
  CalendarIcon,
  PlayCircleIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import GlassCard from "@/components/ui/GlassCard";
import { getYouTubeThumbnail } from "@/lib/youtube";
import { profilePath } from "@/lib/profile";
import type { Athlete } from "@/lib/types";

const RECRUITING_STATUS_STYLES: Record<string, string> = {
  "Open to Recruitment": "bg-green-500/10 border-green-500/30 text-green-300",
  "Exploring Opportunities": "bg-orange-500/10 border-orange-500/30 text-orange-300",
  Committed: "bg-blue-500/10 border-blue-500/30 text-blue-300",
  "Not Currently Looking": "bg-white/5 border-white/10 text-gray-400",
};

export default function AthleteCard({ athlete }: { athlete: Athlete }) {
  const thumbnail = athlete.highlight_video
    ? getYouTubeThumbnail(athlete.highlight_video)
    : null;

  const achievementCount = athlete.achievements_json?.length ?? 0;
  const recruitingStatusStyle = athlete.recruiting_status
    ? RECRUITING_STATUS_STYLES[athlete.recruiting_status] ??
      "bg-white/5 border-white/10 text-gray-300"
    : null;

  return (
    <Link href={profilePath(athlete)}>
      <GlassCard className="overflow-hidden h-full hover:bg-white/10 transition group">
        <div className="relative h-40 bg-gray-800 flex items-center justify-center overflow-hidden">
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

          {athlete.highlight_video && (
            <span className="absolute top-2 left-2 inline-flex items-center gap-1 text-xs font-medium text-white bg-black/60 backdrop-blur rounded-full px-2 py-1">
              <PlayCircleIcon className="w-4 h-4 text-orange-400" />
              Highlight Reel
            </span>
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

          {(athlete.graduation_year || recruitingStatusStyle || achievementCount > 0) && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {athlete.graduation_year && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-300 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
                  <CalendarIcon className="w-3 h-3" />
                  Class of {athlete.graduation_year}
                </span>
              )}
              {athlete.recruiting_status && (
                <span
                  className={`inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5 border ${recruitingStatusStyle}`}
                >
                  {athlete.recruiting_status}
                </span>
              )}
              {achievementCount > 0 && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-300 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
                  <TrophyIcon className="w-3 h-3" />
                  {achievementCount} {achievementCount === 1 ? "Achievement" : "Achievements"}
                </span>
              )}
            </div>
          )}
        </div>
      </GlassCard>
    </Link>
  );
}
