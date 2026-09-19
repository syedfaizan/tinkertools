/**
 * Lightweight client-side storage helpers (localStorage only, no backend).
 */

export const THEME_STORAGE_KEY = "tinkertools:theme";
const RECENT_KEY = "tinkertools:recent-tools";

interface RecentEntry {
  slug: string;
  at: number;
}

function readRecent(): RecentEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (entry): entry is RecentEntry =>
          !!entry &&
          typeof entry === "object" &&
          typeof (entry as RecentEntry).slug === "string" &&
          typeof (entry as RecentEntry).at === "number"
      )
      .slice(0, 20);
  } catch {
    return [];
  }
}

/** Most-recently-visited tool slugs, newest first. */
export function getRecentToolSlugs(limit = 8): string[] {
  return readRecent()
    .sort((a, b) => b.at - a.at)
    .map((entry) => entry.slug)
    .slice(0, limit);
}

/** Record a tool visit (deduped, most recent first). */
export function recordToolVisit(slug: string, limit = 12): void {
  if (typeof window === "undefined") return;
  try {
    const entries = readRecent().filter((entry) => entry.slug !== slug);
    entries.unshift({ slug, at: Date.now() });
    window.localStorage.setItem(
      RECENT_KEY,
      JSON.stringify(entries.slice(0, limit))
    );
    recentVersion += 1;
  } catch {
    /* storage unavailable — ignore */
  }
}

/* ------------------------------------------------------------------ */
/* useSyncExternalStore bindings for the "recently used" strip         */
/* (avoids the mounted/effect pattern; safe for SSR + hydration).      */
/* ------------------------------------------------------------------ */

const EMPTY_SLUGS: string[] = [];
let recentVersion = 0;
let cachedRecentSlugs: string[] = EMPTY_SLUGS;
let cachedAtVersion = -1;

/** Subscribe to changes (same-tab writes bump `recentVersion`; cross-tab
 * writes arrive as `storage` events). Returns an unsubscribe function. */
export function subscribeRecent(callback: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === RECENT_KEY) {
      recentVersion += 1;
      callback();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}

/** Client snapshot — cached so the reference stays stable between renders. */
export function getRecentSlugsSnapshot(): string[] {
  if (recentVersion !== cachedAtVersion) {
    cachedAtVersion = recentVersion;
    cachedRecentSlugs = getRecentToolSlugs(8);
  }
  return cachedRecentSlugs;
}

/** Server/hydration snapshot — always empty, so SSR output is deterministic. */
export function getRecentSlugsServerSnapshot(): string[] {
  return EMPTY_SLUGS;
}