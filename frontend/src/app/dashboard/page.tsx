"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, api } from "@/lib/api-client";
import type { Project } from "@/types/api";
import { StatusBadge } from "@/components/ui/status-badge";

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Instant paint: show last list while we refresh in background.
    try {
      const raw = sessionStorage.getItem("aim_projects_page_1");
      if (raw) {
        const cached = JSON.parse(raw) as Project[];
        setProjects(cached);
        setLoading(false);
      }
    } catch {
      /* ignore */
    }
    (async () => {
      try {
        const res = await api.projects(1);
        if (!cancelled) {
          setProjects(res.data);
          try {
            sessionStorage.setItem("aim_projects_page_1", JSON.stringify(res.data));
          } catch {
            /* ignore */
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof ApiError ? e.message : "Could not load projects.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Each project captures a website crawl plus AI marketing outputs.{" "}
            <span className="text-zinc-600 dark:text-zinc-300">
              Click a row or use <strong className="font-medium">Open</strong> to view details — including failed runs
              (to see errors and retry).
            </span>
          </p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-500"
        >
          New project
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-200 border-t-violet-600 dark:border-zinc-700 dark:border-t-violet-400" />
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white/60 p-12 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">No projects yet</p>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Start by analyzing your first website — we will crawl key pages and generate strategy-ready ideas.
          </p>
          <Link
            href="/dashboard/projects/new"
            className="mt-6 inline-flex rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500"
          >
            Create project
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50/80 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="hidden px-5 py-3 sm:table-cell">Website</th>
                <th className="px-5 py-3">Status</th>
                <th className="hidden px-5 py-3 md:table-cell">Updated</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {projects.map((p) => {
                const href = `/dashboard/projects/${p.id}`;
                return (
                  <tr
                    key={p.id}
                    tabIndex={0}
                    role="link"
                    aria-label={`Open project ${p.name}`}
                    className="cursor-pointer hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40"
                    onClick={() => router.push(href)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(href);
                      }
                    }}
                  >
                    <td className="px-5 py-4">
                      <span className="font-medium text-violet-700 dark:text-violet-300">{p.name}</span>
                    </td>
                    <td className="hidden max-w-xs truncate px-5 py-4 text-zinc-500 dark:text-zinc-400 sm:table-cell">
                      {p.website_url}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="hidden px-5 py-4 text-zinc-500 dark:text-zinc-400 md:table-cell">
                      {p.updated_at ? new Date(p.updated_at).toLocaleString() : "—"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={href}
                        className="inline-flex rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-800 hover:bg-violet-100 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-200 dark:hover:bg-violet-500/20"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
