import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/config";

export const alt = `${SITE_NAME} — free online tools that run entirely in your browser`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 56,
          padding: 72,
          background: "linear-gradient(135deg, #312e81 0%, #4f46e5 55%, #7c3aed 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            width: 160,
            height: 160,
            borderRadius: 36,
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 108,
            fontWeight: 800,
            color: "#4f46e5",
          }}
        >
          T
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 660 }}>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              letterSpacing: 8,
              textTransform: "uppercase",
              color: "#c7d2fe",
            }}
          >
            tinkertools.tech
          </div>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.06, marginTop: 14 }}>
            {SITE_NAME}
          </div>
          <div
            style={{
              fontSize: 34,
              marginTop: 20,
              color: "#e0e7ff",
              lineHeight: 1.35,
            }}
          >
            {SITE_TAGLINE}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}