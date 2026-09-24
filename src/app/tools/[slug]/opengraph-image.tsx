import { ImageResponse } from "next/og";
import { getToolBySlug } from "@/tools/registry";
import { getCategoryById } from "@/tools/categories";

export const alt = "Free online tool — TinkerTools";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  const category = tool ? getCategoryById(tool.category) : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "76px 88px",
          background: "linear-gradient(135deg, #312e81 0%, #4f46e5 60%, #7c3aed 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "center",
            fontSize: 26,
            letterSpacing: 5,
            textTransform: "uppercase",
            color: "#c7d2fe",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontWeight: 800,
              color: "#4f46e5",
            }}
          >
            T
          </div>
          {category?.label ?? "Tools"}
        </div>
        <div
          style={{
            fontSize: 88,
            fontWeight: 800,
            lineHeight: 1.05,
            marginTop: 28,
            maxWidth: 1000,
          }}
        >
          {tool?.title ?? "Free Online Tool"}
        </div>
        <div
          style={{
            fontSize: 28,
            marginTop: 22,
            color: "#e0e7ff",
            lineHeight: 1.4,
            maxWidth: 950,
          }}
        >
          {tool?.description ?? "Fast, free tools that run entirely in your browser."}
        </div>
        <div style={{ fontSize: 22, marginTop: 40, color: "#a5b4fc" }}>
          tinkertools.tech · free · private · runs in your browser
        </div>
      </div>
    ),
    { ...size }
  );
}