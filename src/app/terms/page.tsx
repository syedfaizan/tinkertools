import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `The terms that apply to your use of ${SITE_NAME} and its free online tools.`,
};

const LAST_UPDATED = "September 20, 2026";
const CONTACT_EMAIL = "hello@example.com";

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
        Terms of Use
      </h1>
      <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">
        Last updated: {LAST_UPDATED}
      </p>

      <div className="mt-8 space-y-6 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            1. Acceptance of terms
          </h2>
          <p className="mt-2">
            By accessing or using {SITE_NAME} (“the Site”), you agree to be
            bound by these Terms of Use. If you do not agree with any part of
            these terms, please do not use the Site.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            2. Free, browser-based tools
          </h2>
          <p className="mt-2">
            All tools on the Site are provided free of charge. Where a tool
            processes your files, that processing happens locally in your
            browser — files are not uploaded to our servers. You are solely
            responsible for the files you choose to process and for ensuring
            you have the right to use and combine them (for example, that they
            are not subject to someone else’s copyright).
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            3. Acceptable use
          </h2>
          <p className="mt-2">You agree not to:</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>attempt to disrupt, overload, or harm the Site or its infrastructure;</li>
            <li>use the Site to process or distribute unlawful or infringing content;</li>
            <li>scrape, republish, or resell the Site’s content or tools without permission;</li>
            <li>misrepresent your identity or the purpose of your requests.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            4. No warranty
          </h2>
          <p className="mt-2">
            The Site and its tools are provided “as is” and “as available”
            without warranties of any kind, either express or implied, including
            but not limited to accuracy, completeness, or fitness for a
            particular purpose. Tools are provided for convenience only — for
            critical documents, please verify outputs and keep your original
            files.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            5. Limitation of liability
          </h2>
          <p className="mt-2">
            To the maximum extent permitted by law, {SITE_NAME} and its operators
            shall not be liable for any indirect, incidental, special,
            consequential, or punitive damages, or any loss of data or files,
            arising from your use of the Site or its tools.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            6. Third-party ads &amp; links
          </h2>
          <p className="mt-2">
            The Site may display advertisements and link to third-party
            websites. We do not control and are not responsible for the content,
            privacy practices, or availability of those services.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            7. Changes to these terms
          </h2>
          <p className="mt-2">
            We may update these terms at any time. Continued use of the Site
            after changes constitutes acceptance of the revised terms.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            8. Contact
          </h2>
          <p className="mt-2">
            Questions about these terms? Contact us at{" "}
            <a className="text-indigo-600 underline underline-offset-2 dark:text-indigo-400" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}