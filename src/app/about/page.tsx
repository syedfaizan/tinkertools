import type { Metadata } from "next";
import Link from "next/link";
import { GitBranch, Lock, Wrench } from "lucide-react";
import { TOOLS, getCategories } from "@/tools/registry";
import { getCategoryById } from "@/tools/categories";
import { SITE_NAME, SITE_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "About",
  description: `What ${SITE_NAME} is, why every tool runs entirely in your browser, how the site is funded and maintained, and how to get in touch.`,
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/about`,
    locale: "en_US",
  },
};

const GITHUB_URL = "https://github.com/syedfaizan/tinkertools";

export default function AboutPage() {
  const categories = getCategories();

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
        About {SITE_NAME}
      </h1>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 dark:border-indigo-500/25 dark:bg-indigo-500/10">
        <Lock className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
        <p className="text-sm leading-6 text-indigo-800 dark:text-indigo-300">
          <strong className="font-semibold">The core idea:</strong> useful
          everyday tools should not require an account, an upload or a
          subscription. Every tool on {SITE_NAME} runs in your own browser, so
          your files are processed where they already live — on your device.
        </p>
      </div>

      <div className="mt-8 space-y-6 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            What {SITE_NAME} is
          </h2>
          <p className="mt-2">
            {SITE_NAME} is a collection of{" "}
            <strong className="font-medium text-zinc-800 dark:text-zinc-200">
              {TOOLS.length} free online tools
            </strong>{" "}
            covering the tasks people hit week after week: merging, splitting,
            compressing and converting PDFs, counting words, comparing texts,
            extracting audio from video and more. There is no premium tier and
            no feature held back for paying users — the tool you need is the
            full tool, the moment you open the page.
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            {categories.map((categoryId) => {
              const category = getCategoryById(categoryId);
              const count = TOOLS.filter((t) => t.category === categoryId).length;
              return (
                <li key={categoryId}>
                  <strong className="font-medium text-zinc-800 dark:text-zinc-200">
                    {category?.label ?? categoryId}:
                  </strong>{" "}
                  {count} tool{count === 1 ? "" : "s"}, including{" "}
                  {TOOLS.filter((t) => t.category === categoryId)
                    .slice(0, 3)
                    .map((t) => t.title)
                    .join(", ")}
                  .
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Why everything runs in your browser
          </h2>
          <p className="mt-2">
            Most online file tools work by uploading your document to their
            server, processing it there, and handing back a download. That model
            works, but it puts files you may not be able to share — contracts,
            scanned IDs, unreleased drafts, medical paperwork — in someone
            else&apos;s hands for the duration, and adds upload limits and
            queues on top.
          </p>
          <p className="mt-2">
            {SITE_NAME} inverts that. Files are read and processed locally with
            modern JavaScript: pages are parsed, rendered and re-assembled
            inside the browser tab you already have open. Nothing is uploaded,
            nothing is stored, and the result appears as a normal download from
            your own machine. It is also why there are no file-size queues,
            no waiting rooms and no accounts — the computing power is yours
            already.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            How it is built
          </h2>
          <p className="mt-2">
            The site is a modern web application built on open-source
            libraries —{" "}
            <strong className="font-medium text-zinc-800 dark:text-zinc-200">
              pdf-lib and pdf.js
            </strong>{" "}
            for document work,{" "}
            <strong className="font-medium text-zinc-800 dark:text-zinc-200">
              mammoth
            </strong>{" "}
            for Word documents,{" "}
            <strong className="font-medium text-zinc-800 dark:text-zinc-200">
              tesseract.js
            </strong>{" "}
            for text recognition, and browser-native rendering for conversions
            like Word to PDF. There is no processing backend to breach, because
            there is no processing backend — the heavy lifting happens in
            Chromium, Firefox or Safari on your device.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            How it is funded
          </h2>
          <p className="mt-2">
            {SITE_NAME} is supported by unobtrusive advertising shown around
            the tools — never inside them — which keeps every feature free
            without selling user data. Because files are not uploaded and
            accounts do not exist, there is no personal data stockpile behind
            the site; the privacy policy spells out exactly what is (and is
            not) collected for analytics and ads.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            How it is maintained
          </h2>
          <p className="mt-2">
            Tools are added and updated regularly as everyday tasks come up —
            the{" "}
            <Link
              href="/#tools"
              className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
            >
              full catalogue
            </Link>{" "}
            is one page away, and existing tools are reviewed as browsers and
            their libraries evolve. Bug reports and feature requests are welcome
            through the project&apos;s GitHub repository, where the code for
            the site lives as well.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Get in touch
          </h2>
          <p className="mt-2">
            Found a bug, have a tool idea, or want to report a problem with a
            page? Open an issue on GitHub — it goes straight to the person who
            maintains the site:
          </p>
          <p className="mt-3">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-zinc-300 px-4 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
            >
              <GitBranch className="h-4 w-4" aria-hidden="true" />
              github.com/syedfaizan/tinkertools
            </a>
          </p>
        </section>

        <section className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
          <Wrench className="mt-0.5 h-5 w-5 shrink-0 text-indigo-500" aria-hidden="true" />
          <p className="text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            Ready to get something done?{" "}
            <Link
              href="/#tools"
              className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
            >
              Browse all {TOOLS.length} tools
            </Link>{" "}
            — no sign-up, no uploads, nothing to install.
          </p>
        </section>
      </div>
    </div>
  );
}
