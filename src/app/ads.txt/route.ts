import { ADSENSE_CLIENT_ID } from "@/lib/config";

/**
 * Serves the ads.txt file Google AdSense expects at /ads.txt.
 *
 * Auto-generated from NEXT_PUBLIC_ADSENSE_CLIENT_ID ("ca-pub-123…") so nothing
 * needs to be kept in sync by hand: set that env var in Vercel and ads.txt
 * works immediately. Returns 404 until a client ID is configured.
 */
export const dynamic = "force-static";

export function GET() {
  const clientId = ADSENSE_CLIENT_ID.trim();
  if (!clientId) {
    return new Response("", { status: 404 });
  }
  const publisherId = clientId.replace(/^ca-/, "");
  const body = `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}