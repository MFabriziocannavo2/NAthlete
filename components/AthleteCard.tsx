import Link from "next/link";
import {
  CalendarIcon,
  PlayCircleIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import GlassCard from "@/components/ui/GlassCard";
import { profilePath } from "@/lib/profile";
import type { Athlete } from "@/lib/types";

const RECRUITING_STATUS_STYLES: Record<string, string> = {
  "Open to Recruitment": "bg-green-500/10 border-green-500/30 text-green-300",
  "Exploring Opportunities": "bg-orange-500/10 border-orange-500/30 text-orange-300",
  Committed: "bg-blue-500/10 border-blue-500/30 text-blue-300",
  "Not Currently Looking": "bg-white/5 border-white/10 text-gray-400",
};

export default function AthleteCard({ athlete }: { athlete: Athlete }) {
  const achievementCount = athlete.achievements_json?.length ?? 0;
  const recruitingStatusStyle = athlete.recruiting_status
    ? RECRUITING_STATUS_STYLES[athlete.recruiting_status] ??
      "bg-white/5 border-white/10 text-gray-300"
    : null;

  return (
    <Link href={profilePath(athlete)}>
      <GlassCard className="overflow-hidden h-full hover:bg-white/10 transition group">
        <div className="p-5 flex flex-col items-center text-center gap-3">
          {/* Profile photo */}
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/10 shrink-0 bg-gray-800">
            {athlete.profile_photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={athlete.profile_photo_url}
                alt={athlete.name}
                className="w-full h-full object-cover group-hover:scale-105 transition"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-2xl font-bold text-white">
                {athlete.name?.charAt(0)?.toUpperCase()}
              </div>
            )}
          </div>

          {/* Name + sport/position + school */}
          <div className="min-w-0 w-full">
            <h3 className="font-bold text-white text-base truncate">{athlete.name}</h3>
            <p className="text-sm text-gray-400 truncate mt-0.5">
              {[athlete.sport, athlete.position].filter(Boolean).join(" • ")}
            </p>
            {athlete.school && (
              <p className="text-xs text-gray-500 truncate mt-0.5">{athlete.school}</p>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap justify-center gap-1.5 w-full">
            {athlete.highlight_video && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-white bg-black/40 border border-white/10 rounded-full px-2 py-0.5">
                <PlayCircleIcon className="w-3.5 h-3.5 text-orange-400" />
                Highlight Reel
              </span>
            )}
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
        </div>
      </GlassCard>
    </Link>
  );
}
