import Link from "next/link";
import { ShieldCheck, Wrench } from "lucide-react";
import { TOOLS, TOOL_ROUTE } from "@/tools/registry";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/config";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        <div>
          <p className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-50">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Wrench className="h-4 w-4" aria-hidden="true" />
            </span>
            {SITE_NAME}
          </p>
          <p className="mt-3 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            {SITE_TAGLINE}
          </p>
          <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-zinc-400 dark:text-zinc-500">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
            File tools run entirely in your browser — files are never uploaded
            to or stored on our servers.
          </p>
        </div>

        <nav aria-label="Tools" className="text-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Tools
          </h2>
          <ul className="mt-3 space-y-2">
            {TOOLS.map((tool) => (
              <li key={tool.slug}>
                <Link
                  href={TOOL_ROUTE(tool.slug)}
                  className="text-zinc-600 transition-colors hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400"
                >
                  {tool.title}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/#tools"
                className="text-zinc-600 transition-colors hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400"
              >
                Browse all tools
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Legal" className="text-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Legal
          </h2>
          <ul className="mt-3 space-y-2">
            <li>
              <Link
                href="/privacy"
                className="text-zinc-600 transition-colors hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="text-zinc-600 transition-colors hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400"
              >
                Terms of Use
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-zinc-200 py-5 text-center text-xs text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
        © {year} {SITE_NAME}. Free forever — all processing happens in your browser.
      </div>
    </footer>
  );
}