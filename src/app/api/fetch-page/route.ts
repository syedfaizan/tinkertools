/**
 * Fetches an external webpage's HTML server-side so the "Webpage to PDF"
 * tool isn't blocked by CORS. Only the page's HTML is pulled down; the PDF
 * is still assembled in the visitor's browser.
 */
export const dynamic = "force-dynamic";

const MAX_HTML_BYTES = 2 * 1024 * 1024;

function parseTitle(html: string): string {
  const match = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  if (!match) return "webpage";
  return match[1].replace(/\s+/g, " ").trim().slice(0, 120) || "webpage";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("url")?.trim();
  if (!raw) {
    return Response.json({ error: "URL required." }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
    if (!["http:", "https:"].includes(parsed.protocol)) throw new Error();
  } catch {
    return Response.json(
      { error: "Invalid URL — it must start with http:// or https://." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(parsed.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TinkerTools/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) {
      return Response.json(
        { error: `The website responded with status ${response.status}.` },
        { status: 502 }
      );
    }
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      return Response.json(
        { error: "That URL doesn't return a webpage (HTML)." },
        { status: 415 }
      );
    }
    const html = await response.text();
    if (html.length > MAX_HTML_BYTES) {
      return Response.json({
        error: "That page is too large to convert (over 2 MB of HTML).",
      }, { status: 413 });
    }
    return Response.json({ html, title: parseTitle(html) });
  } catch (error) {
    const message =
      error instanceof Error ? error.name : "";
    return Response.json(
      {
        error:
          message === "TimeoutError"
            ? "The page took too long to respond."
            : "Couldn't fetch that page. Check the URL and try again.",
      },
      { status: 502 }
    );
  }
}