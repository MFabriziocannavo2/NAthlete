import { LockClosedIcon } from "@heroicons/react/24/outline";
import GlassCard from "@/components/ui/GlassCard";
import FollowButton from "@/components/FollowButton";
import type { AthletePreview } from "@/lib/types";

export default function PrivateProfileGate({
  athlete,
}: {
  athlete: AthletePreview;
}) {
  return (
    <div className="max-w-md mx-auto px-6 py-16 text-center">
      <GlassCard className="p-8 flex flex-col items-center gap-4">
        {athlete.profile_photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={athlete.profile_photo_url}
            alt={athlete.name}
            className="w-24 h-24 rounded-full object-cover border-2 border-white/10"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-3xl font-bold">
            {athlete.name?.charAt(0)}
          </div>
        )}

        <div>
          <h1 className="text-2xl font-bold">{athlete.name}</h1>
          {(athlete.sport || athlete.position) && (
            <p className="text-orange-300 font-medium mt-1">
              {[athlete.sport, athlete.position].filter(Boolean).join(" • ")}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 text-gray-400 mt-2">
          <LockClosedIcon className="w-5 h-5" />
          <span className="font-medium">This account is private</span>
        </div>
        <p className="text-sm text-gray-500 -mt-2">
          Follow this athlete to see their full profile, achievements and
          highlights.
        </p>

        <FollowButton athleteId={athlete.id} isPrivate={athlete.is_private} />
      </GlassCard>
    </div>
  );
}
