"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { createFollow, getFollow, removeFollow } from "@/lib/follow";
import Button from "@/components/ui/Button";
import type { Follow } from "@/lib/types";

export default function FollowButton({
  athleteId,
  isPrivate,
}: {
  athleteId: string;
  isPrivate: boolean;
}) {
  const { user, loading } = useAuth();
  const [follow, setFollow] = useState<Follow | null>(null);
  const [followLoaded, setFollowLoaded] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    getFollow(athleteId, user.id)
      .then((result) => {
        if (cancelled) return;
        setFollow(result);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setFollowLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [athleteId, user]);

  if (loading) return null;

  if (!user) {
    return (
      <Link href="/login">
        <Button variant="secondary" className="px-4 py-2">
          Log in to Follow
        </Button>
      </Link>
    );
  }

  if (!followLoaded) return null;

  const handleFollow = async () => {
    setBusy(true);
    const created = await createFollow(
      athleteId,
      user.id,
      isPrivate ? "pending" : "accepted"
    );
    if (created) setFollow(created);
    setBusy(false);
  };

  const handleRemove = async () => {
    if (!follow) return;
    setBusy(true);
    const ok = await removeFollow(follow.id);
    if (ok) setFollow(null);
    setBusy(false);
  };

  if (follow?.status === "accepted") {
    return (
      <Button
        variant="secondary"
        className="px-4 py-2"
        onClick={handleRemove}
        disabled={busy}
      >
        Following
      </Button>
    );
  }

  if (follow?.status === "pending") {
    return (
      <Button
        variant="secondary"
        className="px-4 py-2"
        onClick={handleRemove}
        disabled={busy}
      >
        Requested
      </Button>
    );
  }

  return (
    <Button className="px-4 py-2" onClick={handleFollow} disabled={busy}>
      {isPrivate ? "Request to Follow" : "Follow"}
    </Button>
  );
}
