import { ImageResponse } from "next/og";
import { supabase } from "@/lib/supabase";
import { LOGO_MARK_DATA_URI, LOGO_ASPECT_RATIO } from "@/components/brand/logo-data";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "NAthlete Profile";

interface OgAthlete {
  name: string;
  sport: string | null;
  position: string | null;
  profile_photo_url: string | null;
  is_private: boolean;
}

async function getAthlete(username: string): Promise<OgAthlete | null> {
  const { data } = await supabase
    .from("athletes")
    .select("name, sport, position, profile_photo_url, is_private")
    .eq("username", username)
    .maybeSingle();

  const athlete = data as OgAthlete | null;
  if (athlete && !athlete.is_private) return athlete;

  const { data: previewData } = await supabase
    .rpc("get_athlete_preview", { p_username: username })
    .maybeSingle();

  const preview = previewData as OgAthlete | null;
  if (preview && !preview.is_private) return preview;

  return null;
}

export default async function Image({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const athlete = await getAthlete(username);

  const name = athlete?.name ?? "Athlete Profile";
  const subtitle = [athlete?.sport, athlete?.position].filter(Boolean).join(" • ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background: "linear-gradient(135deg, #030712 0%, #111827 50%, #000000 100%)",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {athlete?.profile_photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={athlete.profile_photo_url}
              alt={name}
              width={160}
              height={160}
              style={{
                borderRadius: "50%",
                objectFit: "cover",
                border: "4px solid #fb923c",
              }}
            />
          ) : (
            <div
              style={{
                width: 160,
                height: 160,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
                border: "4px solid #fb923c",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 64,
                fontWeight: 800,
                color: "#fb923c",
              }}
            >
              {name.charAt(0).toUpperCase()}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.1 }}>{name}</div>
            {subtitle && (
              <div style={{ fontSize: 32, color: "#fb923c", fontWeight: 600 }}>{subtitle}</div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 28, color: "#d1d5db" }}>
              Professional Athlete Profile
            </div>
            <div
              style={{
                fontSize: 44,
                fontWeight: 800,
                backgroundImage: "linear-gradient(90deg, #fb923c, #fbbf24)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              NAthlete
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LOGO_MARK_DATA_URI}
            width={140}
            height={Math.round(140 / LOGO_ASPECT_RATIO)}
            alt=""
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
