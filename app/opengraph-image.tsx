import { ImageResponse } from "next/og";
import { LOGO_MARK_DATA_URI, LOGO_ASPECT_RATIO } from "@/components/brand/logo-data";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "NAthlete — Get Discovered. Get Recruited.";

export default function Image() {
  const logoWidth = 360;
  const logoHeight = Math.round(logoWidth / LOGO_ASPECT_RATIO);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
          background: "linear-gradient(135deg, #030712 0%, #111827 50%, #000000 100%)",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_MARK_DATA_URI} width={logoWidth} height={logoHeight} alt="" />
        <div style={{ fontSize: 32, color: "#d1d5db" }}>
          Get Discovered. Get Recruited.
        </div>
      </div>
    ),
    { ...size }
  );
}
