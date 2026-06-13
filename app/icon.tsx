import { ImageResponse } from "next/og";
import { LOGO_ICON_DATA_URI } from "@/components/brand/logo-data";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#030712",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_ICON_DATA_URI} width={32} height={32} alt="" />
      </div>
    ),
    { ...size }
  );
}
