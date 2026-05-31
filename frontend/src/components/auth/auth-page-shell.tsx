import Link from "next/link";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";

const highlights = [
  "Website crawl & brand context in minutes",
  "Positioning, ads, and social packs per project",
  "Social templates and store analytics",
];

export function AuthPageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="relative hidden w-[42%] max-w-xl overflow-hidden bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-800 lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0">
          <div className="landing-blob absolute -left-20 top-20 h-64 w-64 opacity-40" />
          <div className="landing-blob landing-blob-delay absolute bottom-10 right-0 h-48 w-48 opacity-30" />
        </div>
        <div className="relative px-10 pt-12">
          <Link href="/" className="inline-flex items-center gap-2.5 text-white">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-sm font-bold backdrop-blur">
              FK
            </span>
            <span className="text-sm font-semibold">{APP_NAME}</span>
          </Link>
        </div>
        <div className="relative px-10 pb-16">
          <h2 className="text-2xl font-semibold leading-snug text-white">{APP_TAGLINE}</h2>
          <ul className="mt-8 space-y-3">
            {highlights.map((line) => (
              <li key={line} className="flex items-start gap-3 text-sm text-violet-100">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs">
                  ✓
                </span>
                {line}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="flex flex-1 flex-col justify-center px-4 py-12">
        <div className="mx-auto w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 lg:hidden dark:text-violet-400"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 text-xs font-bold text-white">
                FK
              </span>
              {APP_NAME}
            </Link>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
          </div>
          <div className="glass-card animate-enter-fade rounded-2xl p-6 shadow-lg shadow-violet-500/5">{children}</div>
        </div>
      </div>
    </div>
  );
}
