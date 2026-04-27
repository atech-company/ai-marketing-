"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api-client";
import type { Project } from "@/types/api";

export default function AdminProjectsPage() {
  const [meAdmin, setMeAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<Project[]>([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => rows, [rows]);

  async function load(term?: string) {
    setError(null);
    try {
      const me = await api.me();
      setMeAdmin(Boolean(me.user?.is_admin));
      const res = await api.adminProjects(1, term);
      setRows(res.data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load projects.");
    }
  }

  useEffect(() => {
    void load();
    // eslint-disab-next-line react-hooks/exhaustive-deps
  }, []);

  async function renameProject(id: number, current: string) {
    const name = window.prompt("New project name", current);
    if (!name) return;
    setBusy(true);
    setError(null);
    try {
      await api.adminUpdateProject(id, { name });
      await load(q.trim() || undefined);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to rename project.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteProject(id: number) {
    if (!window.confirm("Delete this project?")) return;
    setBusy(true);
    setError(null);
    try {
      await api.adminDeleteProject(id);
      await load(q.trim() || undefined);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to delete project.");
    } finally {
      setBusy(false);
    }
  }

  if (meAdmin === false) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="text-sm text-rose-600 dark:text-rose-400">Admin access required.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin · Projects</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Rename or delete any project.</p>
      </div>

      {error && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or URL…"
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 sm:max-w-md"
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => void load(q.trim() || undefined)}
          className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium dark:border-zinc-700 dark:bg-zinc-950"
        >
          Search
        </button>
      </div>

      <section className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-950/50 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Website</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-zinc-100 dark:border-zinc-800">
                <td className="px-4 py-3 text-zinc-500">{p.id}</td>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/projects/${p.id}`} className="font-medium text-violet-700 dark:text-violet-200">
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  {p.user ? (
                    <div className="leading-tight">
                      <div className="text-xs font-medium text-zinc-800 dark:text-zinc-100">{p.user.name}</div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">{p.user.email}</div>
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <a href={p.website_url} target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-600 dark:text-zinc-300">
                    {p.website_url}
                  </a>
                </td>
                <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-300">{p.status}</td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void renameProject(p.id, p.name)}
                      className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs dark:border-zinc-700"
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void deleteProject(p.id)}
                      className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs text-rose-700 dark:border-rose-500/40 dark:text-rose-200"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-zinc-500" colSpan={6}>
                  No projects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

