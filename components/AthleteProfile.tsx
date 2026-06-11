"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AcademicCapIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  IdentificationIcon,
  InformationCircleIcon,
  LanguageIcon,
  LockClosedIcon,
  MapPinIcon,
  PencilSquareIcon,
  PhotoIcon,
  PlayCircleIcon,
  ScaleIcon,
  ShareIcon,
  Squares2X2Icon,
  TrophyIcon,
  UserGroupIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import GlassCard from "@/components/ui/GlassCard";
import SectionCard from "@/components/ui/SectionCard";
import StatCard from "@/components/ui/StatCard";
import Button from "@/components/ui/Button";
import Tabs from "@/components/ui/Tabs";
import FollowButton from "@/components/FollowButton";
import FollowRequestsPanel from "@/components/FollowRequestsPanel";
import RecruitingSnapshot from "@/components/RecruitingSnapshot";
import CareerTimeline from "@/components/CareerTimeline";
import VerifiedDocuments from "@/components/VerifiedDocuments";
import ShareProfileModal from "@/components/ShareProfileModal";
import { InstagramIcon, LinkedInIcon, XIcon } from "@/components/ui/SocialIcons";
import { getYouTubeEmbedUrl, getYouTubeThumbnail } from "@/lib/youtube";
import { getAge, parseLines } from "@/lib/profile";
import { getProfileUrl } from "@/lib/site";
import { toSafeHref } from "@/lib/url";
import { countFollowers } from "@/lib/follow";
import type { Athlete } from "@/lib/types";

function StatItem({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <p className="flex justify-between gap-4 py-1.5 border-b border-white/5 last:border-0">
      <span className="text-gray-400">{label}</span>
      <span className="text-white font-medium text-right">{value}</span>
    </p>
  );
}

function Chip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-gray-300 bg-white/5 border border-white/10 rounded-full px-3 py-1">
      {icon}
      {children}
    </span>
  );
}

export default function AthleteProfile({
  athlete,
  isOwner = false,
}: {
  athlete: Athlete;
  isOwner?: boolean;
}) {
  const [shareOpen, setShareOpen] = useState(false);
  const [followerCount, setFollowerCount] = useState<number | null>(null);

  const embedUrl = athlete.highlight_video
    ? getYouTubeEmbedUrl(athlete.highlight_video)
    : null;

  const age = getAge(athlete.date_of_birth);
  const legacyAchievements = parseLines(athlete.achievements);
  const achievements = athlete.achievements_json ?? [];
  const academicAwards = parseLines(athlete.academic_awards);
  const galleryItems = parseLines(athlete.media_gallery);

  useEffect(() => {
    countFollowers(athlete.id).then(setFollowerCount);
  }, [athlete.id]);

  const profileUrl = getProfileUrl(athlete);

  const scrollToHighlights = () => {
    document.getElementById("highlights")?.scrollIntoView({ behavior: "smooth" });
  };

  const overviewTab = (
    <div className="flex flex-col gap-6">
      {athlete.bio && (
        <SectionCard title="About Me" icon={<UsersIcon className="w-5 h-5 text-orange-400" />}>
          <p className="text-gray-300 leading-relaxed">{athlete.bio}</p>
        </SectionCard>
      )}

      {(embedUrl || athlete.highlight_video) && (
        <div id="highlights">
          <SectionCard
            title="Highlights Video"
            icon={<PlayCircleIcon className="w-5 h-5 text-orange-400" />}
          >
            {embedUrl ? (
              <iframe
                className="w-full h-[260px] sm:h-[420px] rounded-xl"
                src={embedUrl}
                title="Athlete highlight video"
                allowFullScreen
              />
            ) : (
              <p className="text-yellow-400 text-sm">
                Could not embed video.{" "}
                <a
                  href={toSafeHref(athlete.highlight_video)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Open link directly
                </a>
              </p>
            )}
          </SectionCard>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {age != null && <StatCard label="Age" value={`${age}`} />}
        {athlete.height && <StatCard label="Height" value={`${athlete.height} cm`} />}
        {athlete.weight && <StatCard label="Weight" value={`${athlete.weight} kg`} />}
        {athlete.dominant_foot && (
          <StatCard label="Dominant Foot" value={athlete.dominant_foot} />
        )}
      </div>

      {galleryItems.length > 0 && (
        <SectionCard
          title="Media Gallery"
          icon={<PhotoIcon className="w-5 h-5 text-orange-400" />}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {galleryItems.map((url, i) => {
              const thumbnail = getYouTubeThumbnail(url);
              return (
                <a
                  key={i}
                  href={toSafeHref(url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block aspect-video rounded-lg overflow-hidden bg-white/5 border border-white/10 hover:opacity-80 transition"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbnail ?? url}
                    alt={`Media ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </a>
              );
            })}
          </div>
        </SectionCard>
      )}
    </div>
  );

  const educationTab = (
    <SectionCard
      title="Education"
      icon={<AcademicCapIcon className="w-5 h-5 text-orange-400" />}
    >
      <div className="flex flex-col">
        <StatItem label="School / University" value={athlete.school} />
        <StatItem label="Graduation Year" value={athlete.graduation_year} />
        <StatItem label="GPA" value={athlete.gpa} />
        <StatItem label="SAT" value={athlete.sat} />
        <StatItem label="ACT" value={athlete.act} />
        <StatItem label="TOEFL" value={athlete.toefl} />
        <StatItem label="Duolingo English Test" value={athlete.det} />
      </div>

      {academicAwards.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-sm font-semibold text-gray-300 mb-2">
            Academic Awards
          </p>
          <ul className="flex flex-col gap-2">
            {academicAwards.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-300">
                <AcademicCapIcon className="w-4 h-4 text-amber-400 mt-1 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </SectionCard>
  );

  const achievementsTab = (
    <SectionCard
      title="Athletic Achievements"
      icon={<TrophyIcon className="w-5 h-5 text-orange-400" />}
    >
      {achievements.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((item, i) => (
            <div
              key={i}
              className="rounded-xl bg-white/5 border border-white/10 p-4 flex items-start gap-3"
            >
              <span className="shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                <TrophyIcon className="w-5 h-5 text-amber-400" />
              </span>
              <div>
                <p className="font-semibold text-white">{item.title}</p>
                {item.description && (
                  <p className="text-sm text-gray-400">{item.description}</p>
                )}
                {item.date && (
                  <p className="text-xs text-orange-300 mt-1">{item.date}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : legacyAchievements.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {legacyAchievements.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-gray-300">
              <TrophyIcon className="w-4 h-4 text-amber-400 mt-1 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400 text-sm">No achievements added yet.</p>
      )}
    </SectionCard>
  );

  const physiologicalTab = (
    <SectionCard
      title="Physiological Data"
      icon={<ScaleIcon className="w-5 h-5 text-orange-400" />}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {athlete.height && <StatCard label="Height" value={`${athlete.height} cm`} />}
        {athlete.weight && <StatCard label="Weight" value={`${athlete.weight} kg`} />}
        {athlete.dominant_foot && (
          <StatCard label="Dominant Foot/Hand" value={athlete.dominant_foot} />
        )}
        {athlete.vertical_jump && (
          <StatCard label="Vertical Jump" value={`${athlete.vertical_jump} cm`} />
        )}
        {athlete.sprint_time && (
          <StatCard label="Sprint Time" value={`${athlete.sprint_time}s`} />
        )}
        {athlete.vo2_max && (
          <StatCard label="VO2 Max" value={`${athlete.vo2_max} ml/kg/min`} />
        )}
        {athlete.body_fat && <StatCard label="Body Fat" value={`${athlete.body_fat}%`} />}
        {athlete.resting_hr && (
          <StatCard label="Resting HR" value={`${athlete.resting_hr} bpm`} />
        )}
      </div>
      {!athlete.height &&
        !athlete.weight &&
        !athlete.dominant_foot &&
        !athlete.vertical_jump &&
        !athlete.sprint_time &&
        !athlete.vo2_max &&
        !athlete.body_fat &&
        !athlete.resting_hr && (
          <p className="text-gray-400 text-sm">No physiological data added yet.</p>
        )}
    </SectionCard>
  );

  const socialLinks = [
    { url: athlete.instagram_url, icon: <InstagramIcon className="w-5 h-5" />, label: "Instagram" },
    { url: athlete.twitter_url, icon: <XIcon className="w-5 h-5" />, label: "X / Twitter" },
    { url: athlete.linkedin_url, icon: <LinkedInIcon className="w-5 h-5" />, label: "LinkedIn" },
  ].filter((link) => link.url);

  const otherInfoTab = (
    <div className="flex flex-col gap-6">
      <SectionCard
        title="Team & Roster"
        icon={<UserGroupIcon className="w-5 h-5 text-orange-400" />}
      >
        <div className="flex flex-col">
          <StatItem label="Current Team / Club" value={athlete.current_team} />
          <StatItem label="Team Type" value={athlete.team_type} />
          <StatItem label="Preferred Position(s)" value={athlete.preferred_positions} />
          <StatItem label="Jersey Number" value={athlete.jersey_number} />
        </div>
      </SectionCard>

      <SectionCard
        title="Contact & Social"
        icon={<IdentificationIcon className="w-5 h-5 text-orange-400" />}
      >
        <div className="flex flex-col gap-4">
          <StatItem label="Agent / Contact" value={athlete.agent_contact} />

          {socialLinks.length > 0 ? (
            <div className="flex flex-wrap gap-3 pt-2">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={toSafeHref(link.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-200 hover:bg-white/10 transition text-sm"
                >
                  {link.icon}
                  {link.label}
                </a>
              ))}
            </div>
          ) : (
            !athlete.agent_contact && (
              <p className="text-gray-400 text-sm">No additional information added yet.</p>
            )
          )}
        </div>
      </SectionCard>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-6">
      {/* HERO */}
      <GlassCard className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {athlete.profile_photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={athlete.profile_photo_url}
                alt={athlete.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-white/10 shrink-0"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-3xl font-bold shrink-0">
                {athlete.name?.charAt(0)}
              </div>
            )}

            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {athlete.name}
              </h1>
              <p className="text-orange-300 font-medium mt-1">
                {[athlete.sport, athlete.position, athlete.current_team]
                  .filter(Boolean)
                  .join(" • ")}
              </p>

              {athlete.bio && (
                <p className="text-gray-300 text-sm mt-2 max-w-xl leading-relaxed">
                  {athlete.bio}
                </p>
              )}

              <div className="flex flex-wrap gap-2 mt-3">
                {athlete.location && (
                  <Chip icon={<MapPinIcon className="w-4 h-4" />}>
                    {athlete.location}
                  </Chip>
                )}
                {athlete.graduation_year && (
                  <Chip icon={<CalendarIcon className="w-4 h-4" />}>
                    Class of {athlete.graduation_year}
                  </Chip>
                )}
                {athlete.nationality && (
                  <Chip icon={<GlobeAltIcon className="w-4 h-4" />}>
                    {athlete.nationality}
                  </Chip>
                )}
                {athlete.languages && (
                  <Chip icon={<LanguageIcon className="w-4 h-4" />}>
                    {athlete.languages}
                  </Chip>
                )}
                {followerCount !== null && (
                  <Chip icon={<UsersIcon className="w-4 h-4" />}>
                    {followerCount}{" "}
                    {followerCount === 1 ? "follower" : "followers"}
                  </Chip>
                )}
                {athlete.is_private && (
                  <Chip icon={<LockClosedIcon className="w-4 h-4" />}>
                    Private
                  </Chip>
                )}
              </div>

              {socialLinks.length > 0 && (
                <div className="flex gap-3 mt-3">
                  {socialLinks.map((link) => (
                    <a
                      key={link.label}
                      href={toSafeHref(link.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.label}
                      className="text-gray-400 hover:text-orange-300 transition"
                    >
                      {link.icon}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {embedUrl && (
              <Button variant="secondary" className="px-4 py-2" onClick={scrollToHighlights}>
                <PlayCircleIcon className="w-4 h-4 mr-2" />
                Watch Highlights
              </Button>
            )}
            {isOwner ? (
              <Link href="/edit-profile">
                <Button variant="secondary" className="px-4 py-2 w-full">
                  <PencilSquareIcon className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            ) : (
              <FollowButton athleteId={athlete.id} isPrivate={!!athlete.is_private} />
            )}
            <Button onClick={() => setShareOpen(true)} className="px-4 py-2">
              <ShareIcon className="w-4 h-4 mr-2" />
              Share Profile
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* RECRUITING SNAPSHOT */}
      <RecruitingSnapshot athlete={athlete} />

      {/* FOLLOW REQUESTS (owner, private profiles only) */}
      {isOwner && athlete.is_private && (
        <FollowRequestsPanel athleteId={athlete.id} />
      )}

      {/* TABS */}
      <Tabs
        tabs={[
          {
            id: "overview",
            label: "Overview",
            icon: <Squares2X2Icon className="w-4 h-4" />,
            content: overviewTab,
          },
          {
            id: "education",
            label: "Education",
            icon: <AcademicCapIcon className="w-4 h-4" />,
            content: educationTab,
          },
          {
            id: "achievements",
            label: "Achievements",
            icon: <TrophyIcon className="w-4 h-4" />,
            content: achievementsTab,
          },
          {
            id: "physiological",
            label: "Physiological",
            icon: <ScaleIcon className="w-4 h-4" />,
            content: physiologicalTab,
          },
          {
            id: "timeline",
            label: "Timeline",
            icon: <ClockIcon className="w-4 h-4" />,
            content: <CareerTimeline athleteId={athlete.id} isOwner={isOwner} />,
          },
          {
            id: "documents",
            label: "Documents",
            icon: <DocumentTextIcon className="w-4 h-4" />,
            content: <VerifiedDocuments athleteId={athlete.id} isOwner={isOwner} />,
          },
          {
            id: "other",
            label: "Other Info",
            icon: <InformationCircleIcon className="w-4 h-4" />,
            content: otherInfoTab,
          },
        ]}
      />

      {shareOpen && (
        <ShareProfileModal url={profileUrl} onClose={() => setShareOpen(false)} />
      )}
    </div>
  );
}
