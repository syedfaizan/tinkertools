import type { Metadata } from "next";
import Link from "next/link";
import { Wrench } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
        <Wrench className="h-6 w-6" aria-hidden="true" />
      </span>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Page not found
      </h1>
      <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
        The page you are looking for does not exist or has moved. Try browsing
        the tools instead.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
        >
          Back to home
        </Link>
        <Link
          href="/#tools"
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-zinc-300 bg-white px-6 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Browse all tools
        </Link>
      </div>
    </div>
  );
}