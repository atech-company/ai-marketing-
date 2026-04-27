"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, api } from "@/lib/api-client";
import type { Project } from "@/types/api";
import { StatusBadge } from "@/components/ui/status-badge";

function inferProjectName(rawUrl: string): string {
  const value = rawUrl.trim();
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const host = new URL(withScheme).hostname.replace(/^www\./i, "");
    if (!host) return "Website analysis";
    return `${host} analysis`;
  } catch {
    return "Website analysis";
  }
}

export default function NewProjectPage() {
  const router = useRouter();
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Project[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.projects(1);
        if (!active) return;
        setHistory(res.data.filter((p) => !p.has_store_config));
      } catch {
        if (!active) return;
        setHistory([]);
      } finally {
        if (active) setLoadingHistory(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await api.createProject({
        name: inferProjectName(websiteUrl),
        website_url: websiteUrl.trim(),
      });
      router.push(`/dashboard/projects/${res.data.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Request failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-violet-600 hover:text-violet-500 dark:text-violet-400"
        >
          ← Back to projects
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">Analyze website</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Enter website URL only. We create the project and start analysis immediately.
        </p>
      </div>

      <form onSubmit={(e) => void onSubmit(e)} className="space-y-5 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Website URL
          </label>
          <input
            id="url"
            type="text"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            required
            className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-violet-500/30 focus:border-violet-500 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950"
            placeholder="https://example.com"
          />
        </div>
        <button
          type="submit"
          disabled={submitting || !websiteUrl.trim()}
          className="w-full rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-500 disabled:opacity-60"
        >
          {submitting ? "Analyzing..." : "Analyze now"}
        </button>
      </form>

      <section className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Outside website history
          </h2>
          <Link href="/dashboard" className="text-xs font-semibold text-violet-600 hover:text-violet-500 dark:text-violet-400">
            View all
          </Link>
        </div>

        {loadingHistory ? (
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">Loading history...</p>
        ) : history.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">No outside website analyses yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {history.map((p) => (
              <li
                key={p.id}
                className="flex flex-col gap-2 rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-950/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">{p.name}</p>
                  <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{p.website_url}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={p.status} />
                  <Link
                    href={`/dashboard/projects/${p.id}`}
                    className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    Open
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
