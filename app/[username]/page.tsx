import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { getServerProfileUrl } from "@/lib/site";
import UsernameProfileClient from "@/components/UsernameProfileClient";

interface AthleteSeoData {
  id: string;
  username: string | null;
  name: string;
  sport: string | null;
  position: string | null;
  profile_photo_url: string | null;
  is_private: boolean;
}

async function getAthleteSeoData(username: string): Promise<AthleteSeoData | null> {
  const { data } = await supabase
    .from("athletes")
    .select("id, username, name, sport, position, profile_photo_url, is_private")
    .eq("username", username)
    .maybeSingle();

  if (data) return data as AthleteSeoData;

  const { data: previewData } = await supabase
    .rpc("get_athlete_preview", { p_username: username })
    .maybeSingle();

  const preview = previewData as Omit<AthleteSeoData, "is_private"> & {
    is_private?: boolean | null;
  } | null;

  if (!preview) return null;

  return { ...preview, is_private: preview.is_private ?? false } as AthleteSeoData;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const athlete = await getAthleteSeoData(username);

  if (!athlete) {
    return { title: "Athlete Not Found | NAthlete" };
  }

  const title = `${athlete.name} | NAthlete`;
  const description = athlete.is_private
    ? `${athlete.name} has a private profile on NAthlete.`
    : `View the professional athlete profile of ${athlete.name} on NAthlete, including achievements, recruiting information, highlights, and athletic history.`;
  const url = await getServerProfileUrl({ id: athlete.id, username: athlete.username });

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "NAthlete",
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function UsernameProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const athlete = await getAthleteSeoData(username);

  const jsonLd = athlete && !athlete.is_private
    ? {
        "@context": "https://schema.org",
        "@type": "Person",
        name: athlete.name,
        url: await getServerProfileUrl({ id: athlete.id, username: athlete.username }),
        image: athlete.profile_photo_url ?? undefined,
        jobTitle: athlete.position ?? undefined,
        affiliation: athlete.sport ?? undefined,
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <UsernameProfileClient username={username} />
    </>
  );
}
