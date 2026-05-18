import Link from "next/link";

/** OAuth redirect target for Meta Share Dialog (whitelist this URL in your Meta app). */
export default function FacebookShareCompletePage() {
  return (
    <main className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Facebook share</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">
        You can close this tab and return to AI Marketing Discovery.
      </p>
      <Link
        href="/dashboard/social-templates"
        className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500"
      >
        Back to social templates
      </Link>
    </main>
  );
}
