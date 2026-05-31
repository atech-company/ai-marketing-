"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, api, setStoredUser } from "@/lib/api-client";
import type { AccountOverview, UsageLogRow } from "@/types/api";
import { NavIcon } from "@/components/ui/design-system";

const ACTION_LABELS: Record<string, string> = {
  "ai.project.business_understanding": "Project analysis (business)",
  "ai.project.content_pack": "Project analysis (content)",
  "ai.social_templates": "Social templates",
  "project.analysis_completed": "Website analysis completed",
  "project.analysis_failed": "Website analysis failed",
  "project.regenerate_completed": "Project regenerate",
  "social_templates.generated": "Social templates (legacy)",
};

function formatAction(action: string): string {
  return ACTION_LABELS[action] ?? action.replace(/[._]/g, " ");
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat().format(n);
}

export default function AccountSettingsPage() {
  const [overview, setOverview] = useState<AccountOverview | null>(null);
  const [logs, setLogs] = useState<UsageLogRow[]>([]);
  const [logsPage, setLogsPage] = useState(1);
  const [logsLastPage, setLogsLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const [ov, logRes] = await Promise.all([api.accountOverview(), api.accountUsageLogs(page)]);
      setOverview(ov);
      setName(ov.account.name);
      setLogs(logRes.data);
      setLogsPage(logRes.meta.current_page);
      setLogsLastPage(logRes.meta.last_page);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load account settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(1);
  }, [load]);

  async function onSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const res = await api.updateAccountProfile({ name: name.trim() });
      setProfileMsg(res.message);
      const me = await api.me();
      setStoredUser(me.user);
      void load(logsPage);
    } catch (e) {
      setProfileMsg(e instanceof ApiError ? e.message : "Could not update profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function onExport() {
    setExporting(true);
    try {
      await api.exportAccountData();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Export failed.");
    } finally {
      setExporting(false);
    }
  }

  async function onDeleteAllProjects() {
    if (deleteConfirm !== "DELETE") return;
    setDeleting(true);
    setError(null);
    try {
      const res = await api.deleteAllProjects();
      setDeleteConfirm("");
      setProfileMsg(res.message);
      void load(1);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not delete projects.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading && !overview) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-violet-600 dark:border-zinc-700" />
      </div>
    );
  }

  if (error && !overview) {
    return (
      <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100">
        {error}
      </p>
    );
  }

  if (!overview) return null;

  const { usage, data_stored: data } = overview;
  const { tokens } = usage;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <NavIcon name="settings" className="h-6 w-6 text-violet-600 dark:text-violet-400" />
          Account & usage
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Monitor AI token usage, review stored data, and control your account.
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100">
          {error}
        </p>
      )}
      {profileMsg && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100">
          {profileMsg}
        </p>
      )}

      <section className="ds-surface p-6">
        <h2 className="text-lg font-semibold">AI token usage</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Platform AI usage for {usage.period.label}. Project-specific API keys are billed by your provider separately.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Used this month</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{formatNumber(tokens.used_this_month)}</p>
          </div>
          <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Monthly limit</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {tokens.unlimited ? "Unlimited" : formatNumber(tokens.monthly_limit)}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Remaining</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {tokens.unlimited ? "—" : formatNumber(tokens.remaining ?? 0)}
            </p>
          </div>
        </div>

        {!tokens.unlimited && (
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-zinc-500">
              <span>{tokens.percent_used}% of monthly limit</span>
              <span>~{formatNumber(usage.estimate_tokens_per_analysis)} tokens / full analysis</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div
                className={`h-full rounded-full transition-all ${
                  tokens.percent_used >= 90 ? "bg-rose-500" : tokens.percent_used >= 70 ? "bg-amber-500" : "bg-violet-600"
                }`}
                style={{ width: `${Math.min(100, tokens.percent_used)}%` }}
              />
            </div>
          </div>
        )}

        {Object.keys(usage.tokens_by_action).length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Usage by feature</p>
            <ul className="mt-2 space-y-2">
              {Object.entries(usage.tokens_by_action).map(([action, count]) => (
                <li
                  key={action}
                  className="flex items-center justify-between rounded-lg border border-zinc-200/60 px-3 py-2 text-sm dark:border-zinc-800"
                >
                  <span>{formatAction(action)}</span>
                  <span className="font-medium tabular-nums text-violet-700 dark:text-violet-300">{formatNumber(count)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="ds-surface p-6">
        <h2 className="text-lg font-semibold">Your data on Fikr AI</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Overview of what we store for your account. API keys are encrypted and never included in exports.
        </p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            ["Projects", data.projects],
            ["Crawled pages", data.crawled_pages],
            ["Generated content items", data.generated_contents],
            ["Activity log entries", data.usage_log_entries],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-zinc-200/60 px-3 py-2 dark:border-zinc-800">
              <dt className="text-xs text-zinc-500">{label}</dt>
              <dd className="text-lg font-semibold tabular-nums">{formatNumber(value as number)}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={exporting}
            onClick={() => void onExport()}
            className="ds-btn ds-btn-ghost px-4 py-2 text-sm"
          >
            {exporting ? "Preparing…" : "Download my data (JSON)"}
          </button>
        </div>
      </section>

      <section className="ds-surface p-6">
        <h2 className="text-lg font-semibold">Profile</h2>
        <form onSubmit={(e) => void onSaveProfile(e)} className="mt-4 space-y-3">
          <div>
            <label className="block text-sm font-medium">Display name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
          <p className="text-xs text-zinc-500">
            Email: {overview.account.email}
            {overview.account.oauth_provider ? ` · Signed in with ${overview.account.oauth_provider}` : ""}
            {overview.account.selected_plan ? ` · Plan: ${overview.account.selected_plan}` : ""}
          </p>
          <button type="submit" disabled={savingProfile || !name.trim()} className="ds-btn ds-btn-primary px-4 py-2 text-sm">
            {savingProfile ? "Saving…" : "Save profile"}
          </button>
        </form>
      </section>

      <section className="ds-surface p-6">
        <h2 className="text-lg font-semibold">Recent activity</h2>
        {logs.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">No activity logged yet. Run a project analysis or generate social templates.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-500 dark:border-zinc-800">
                  <th className="py-2 pr-3">When</th>
                  <th className="py-2 pr-3">Action</th>
                  <th className="py-2 pr-3">Tokens</th>
                  <th className="py-2">Project</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-zinc-100 dark:border-zinc-800/80">
                    <td className="py-2 pr-3 whitespace-nowrap text-zinc-500">
                      {log.created_at ? new Date(log.created_at).toLocaleString() : "—"}
                    </td>
                    <td className="py-2 pr-3">{formatAction(log.action)}</td>
                    <td className="py-2 pr-3 tabular-nums">{log.total_tokens > 0 ? formatNumber(log.total_tokens) : "—"}</td>
                    <td className="py-2 text-zinc-600 dark:text-zinc-400">{log.project_name ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {logsLastPage > 1 && (
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              disabled={logsPage <= 1 || loading}
              onClick={() => void load(logsPage - 1)}
              className="ds-btn ds-btn-ghost px-3 py-1.5 text-xs"
            >
              Previous
            </button>
            <span className="self-center text-xs text-zinc-500">
              Page {logsPage} of {logsLastPage}
            </span>
            <button
              type="button"
              disabled={logsPage >= logsLastPage || loading}
              onClick={() => void load(logsPage + 1)}
              className="ds-btn ds-btn-ghost px-3 py-1.5 text-xs"
            >
              Next
            </button>
          </div>
        )}
      </section>

      <section className="ds-surface border-rose-200/60 p-6 dark:border-rose-500/20">
        <h2 className="text-lg font-semibold text-rose-800 dark:text-rose-200">Delete all projects</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Permanently removes all projects, crawled pages, analyses, and generated content. Your account stays active.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-zinc-500">Type DELETE to confirm</label>
            <input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="mt-1 w-full max-w-xs rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
          <button
            type="button"
            disabled={deleting || deleteConfirm !== "DELETE"}
            onClick={() => void onDeleteAllProjects()}
            className="ds-btn rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-800 hover:bg-rose-100 disabled:opacity-50 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-100"
          >
            {deleting ? "Deleting…" : "Delete all projects"}
          </button>
        </div>
      </section>
    </div>
  );
}
