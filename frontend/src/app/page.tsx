import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-violet-50/40 text-zinc-900 dark:from-zinc-950 dark:via-zinc-950 dark:to-violet-950/30 dark:text-zinc-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-sm font-semibold tracking-tight">AI Marketing Discovery</span>
        <div className="flex gap-3 text-sm">
          <Link href="/login" className="rounded-lg px-3 py-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-violet-600 px-4 py-2 font-medium text-white shadow-md shadow-violet-600/25 hover:bg-violet-500"
          >
            Get started
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:pt-20">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-widest text-violet-600 dark:text-violet-400">
            Phase 1 · MVP
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl md:leading-tight">
            Marketing strategy from any website URL.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            Paste a store or business site. We crawl the pages that matter, extract clean text, and generate structured
            positioning, content pillars, social ideas, ad copy, and homepage improvements you can ship.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/register"
              className="inline-flex rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 hover:bg-violet-500"
            >
              Start free
            </Link>
            <Link
              href="/login"
              className="inline-flex rounded-xl border border-zinc-200 bg-white/80 px-6 py-3 text-sm font-semibold text-zinc-800 backdrop-blur hover:bg-white dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              Sign in
            </Link>
          </div>
        </div>
        <div className="mt-20 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Focused crawl",
              body: "Homepage plus high-signal paths like about, products, collections, and contact — capped for safety.",
            },
            {
              title: "JS fallback",
              body: "Server-side HTML first; Playwright renders when the page is too thin for reliable text.",
            },
            {
              title: "Structured AI",
              body: "JSON-first prompts for business understanding and channel-specific creative packs.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-zinc-200/80 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/50"
            >
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{card.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{card.body}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
