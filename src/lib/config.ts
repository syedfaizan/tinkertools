/**
 * Global site configuration.
 *
 * Everything is driven by environment variables so flipping on ads, analytics
 * or your domain never requires touching page code. `NEXT_PUBLIC_*` values are
 * inlined at build time and are safe to read in client components.
 */

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "TinkerTools";

export const SITE_TAGLINE =
  "Fast, free, browser-only utilities. No sign-ups, no uploads — your files never leave your device.";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://tinkertools.tech";

/** Set to "true" once your AdSense account is approved. */
export const ADS_ENABLED = process.env.NEXT_PUBLIC_ADS_ENABLED === "true";

/** e.g. "ca-pub-XXXXXXXXXXXXXXXX" */
export const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "";

/** Google Analytics 4 measurement ID, e.g. "G-XXXXXXXXXX". */
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";

/**
 * Google Search Console verification token. Rendered as a
 * `<meta name="google-site-verification">` tag when set. Note: the AdSense
 * publisher check (`<meta name="google-adsense-account">`) is derived from
 * NEXT_PUBLIC_ADSENSE_CLIENT_ID automatically — no token needed for that.
 */
export const GOOGLE_SITE_VERIFICATION =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "";