import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { SITE_NAME, SITE_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE_NAME} handles your data — no accounts, no file uploads, and a clear explanation of cookies used for ads and analytics.`,
  alternates: { canonical: `${SITE_URL}/privacy` },
};

const LAST_UPDATED = "September 20, 2026";

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">
        Last updated: {LAST_UPDATED}
      </p>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-500/25 dark:bg-emerald-500/10">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        <p className="text-sm leading-6 text-emerald-800 dark:text-emerald-300">
          <strong className="font-semibold">The short version:</strong> file
          tools on {SITE_NAME} process everything in your browser with
          JavaScript libraries. Your files are never uploaded to, transmitted
          to, or stored on our servers.
        </p>
      </div>

      <div className="mt-8 space-y-6 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            1. What information we collect
          </h2>
          <p className="mt-2">
            This site does not require accounts and does not collect your name,
            email address, or payment details. We may collect the limited,
            aggregate information described below:
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>
              <strong className="font-medium text-zinc-800 dark:text-zinc-200">
                Analytics:
              </strong>{" "}
              we use Google Analytics 4 to understand how visitors use the site
              (pages visited, approximate location, device type).
            </li>
            <li>
              <strong className="font-medium text-zinc-800 dark:text-zinc-200">
                Advertising:
              </strong>{" "}
              if ads are enabled, Google AdSense and its partners may use
              cookies or similar technologies to show relevant ads. This
              involves processing of advertising identifiers as described by
              Google.
            </li>
            <li>
              <strong className="font-medium text-zinc-800 dark:text-zinc-200">
                Local storage:
              </strong>{" "}
              your theme preference and a private list of recently used tools
              are stored only in your own browser (localStorage). This data is
              never sent to us.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            2. Your files stay on your device
          </h2>
          <p className="mt-2">
            Every file-processing tool on this site (for example PDF Merge) runs
            entirely in your browser using client-side JavaScript libraries such
            as pdf-lib. When you select files, they are read by your browser
            only, processed locally, and the resulting file is generated on your
            device. Nothing you process is uploaded to or stored on our servers
            — no file content, no file names, no metadata about your files.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            3. Cookies
          </h2>
          <p className="mt-2">
            We use cookies and similar storage only where needed: to remember
            your theme and recently used tools (localStorage) and, when
            enabled, for analytics (GA4) and advertising (AdSense). You can
            clear or block these in your browser settings at any time.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            4. Third-party services
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>
              <strong className="font-medium text-zinc-800 dark:text-zinc-200">
                Google Analytics (GA4):
              </strong>{" "}
              <a className="text-indigo-600 underline underline-offset-2 dark:text-indigo-400" href="https://policies.google.com/privacy" rel="noopener noreferrer" target="_blank">
                Google’s Privacy Policy
              </a>
            </li>
            <li>
              <strong className="font-medium text-zinc-800 dark:text-zinc-200">
                Google AdSense:
              </strong>{" "}
              <a className="text-indigo-600 underline underline-offset-2 dark:text-indigo-400" href="https://policies.google.com/privacy" rel="noopener noreferrer" target="_blank">
                Google’s Privacy Policy
              </a>
              {" "}and the{" "}
              <a className="text-indigo-600 underline underline-offset-2 dark:text-indigo-400" href="https://www.google.com/adsense/terms/" rel="noopener noreferrer" target="_blank">
                AdSense Terms
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            5. Data retention &amp; your choices
          </h2>
          <p className="mt-2">
            We do not maintain user accounts and we do not store any
            user-generated content server-side, so there is nothing for us to
            retain. Browser-stored preferences can be cleared by clearing your
            browser’s site data. You can also opt out of personalized ads at any
            time through Google’s{" "}
            <a className="text-indigo-600 underline underline-offset-2 dark:text-indigo-400" href="https://adssettings.google.com" rel="noopener noreferrer" target="_blank">
              Ads Settings
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            6. Changes to this policy
          </h2>
          <p className="mt-2">
            We may update this policy from time to time. Changes will be posted
            on this page with an updated “last updated” date.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            7. Contact
          </h2>
          <p className="mt-2">
            Questions about this policy? Reach out via the contact address
            listed on the{" "}
            <a className="text-indigo-600 underline underline-offset-2 dark:text-indigo-400" href="/terms">
              Terms of Use
            </a>{" "}
            page.
          </p>
        </section>
      </div>
    </div>
  );
}