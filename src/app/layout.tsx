import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { MotionProvider } from "@/components/MotionProvider";
import { PageTransition } from "@/components/PageTransition";
import { ADSENSE_CLIENT_ID, GA_ID, GOOGLE_SITE_VERIFICATION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/config";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Free Online Tools`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_TAGLINE,
  keywords: [
    "free online tools",
    "pdf tools",
    "text tools",
    "word counter",
    "merge pdf",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Free Online Tools`,
    description: SITE_TAGLINE,
  },
  robots: { index: true, follow: true },
  // Google ownership verification:
  // - <meta name="google-adsense-account" content="ca-pub-…"> — AdSense
  //   publisher check, derived automatically from the client ID.
  // - <meta name="google-site-verification"> — Search Console, only when a
  //   token is configured.
  // Tags only appear when their value is non-empty.
  verification: {
    ...(GOOGLE_SITE_VERIFICATION
      ? { google: GOOGLE_SITE_VERIFICATION }
      : {}),
    ...(ADSENSE_CLIENT_ID
      ? { other: { "google-adsense-account": ADSENSE_CLIENT_ID } }
      : {}),
  },
};

/** Inline theme bootstrap: applies the saved/OS theme before hydration to avoid a flash. */
const themeInitScript = `(function(){try{var t=localStorage.getItem("tinkertools:theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <MotionProvider>
          <div className="flex min-h-dvh flex-col">
            <Header />
            <main id="main" className="flex flex-1 flex-col">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
          </div>
        </MotionProvider>
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());gtag("config","${GA_ID}",{anonymize_ip:true});`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}