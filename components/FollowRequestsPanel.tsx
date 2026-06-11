"use client";

import { useEffect, useState } from "react";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import { supabase } from "@/lib/supabase";
import { acceptFollow, listPendingRequests, removeFollow } from "@/lib/follow";
import SectionCard from "@/components/ui/SectionCard";
import Button from "@/components/ui/Button";
import { profilePath } from "@/lib/profile";
import Link from "next/link";
import type { Follow } from "@/lib/types";

interface RequestRow extends Follow {
  requester?: {
    id: string;
    username: string | null;
    name: string;
    profile_photo_url: string | null;
  };
}

export default function FollowRequestsPanel({ athleteId }: { athleteId: string }) {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const pending = await listPendingRequests(athleteId);

      if (pending.length === 0) {
        setRequests([]);
        setLoading(false);
        return;
      }

      const followerIds = pending.map((p) => p.follower_id);
      const { data: requesters } = await supabase
        .from("athletes")
        .select("id, user_id, username, name, profile_photo_url")
        .in("user_id", followerIds);

      const byUserId = new Map(
        (requesters ?? []).map((a) => [a.user_id as string, a])
      );

      setRequests(
        pending.map((p) => ({ ...p, requester: byUserId.get(p.follower_id) }))
      );
      setLoading(false);
    };

    load();
  }, [athleteId]);

  const handleAccept = async (id: string) => {
    if (await acceptFollow(id)) {
      setRequests((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleDecline = async (id: string) => {
    if (await removeFollow(id)) {
      setRequests((prev) => prev.filter((r) => r.id !== id));
    }
  };

  if (loading || requests.length === 0) return null;

  return (
    <SectionCard
      title="Follow Requests"
      icon={<UserPlusIcon className="w-5 h-5 text-orange-400" />}
    >
      <div className="flex flex-col gap-3">
        {requests.map((req) => (
          <div
            key={req.id}
            className="flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 min-w-0">
              {req.requester?.profile_photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={req.requester.profile_photo_url}
                  alt={req.requester.name}
                  className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-bold shrink-0">
                  {req.requester?.name?.charAt(0) ?? "?"}
                </div>
              )}
              {req.requester ? (
                <Link
                  href={profilePath(req.requester)}
                  className="font-medium text-white hover:text-orange-300 truncate"
                >
                  {req.requester.name}
                </Link>
              ) : (
                <span className="font-medium text-gray-400">
                  Unknown athlete
                </span>
              )}
            </div>

            <div className="flex gap-2 shrink-0">
              <Button
                className="px-3 py-1.5 text-sm"
                onClick={() => handleAccept(req.id)}
              >
                Accept
              </Button>
              <Button
                variant="secondary"
                className="px-3 py-1.5 text-sm"
                onClick={() => handleDecline(req.id)}
              >
                Decline
              </Button>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
