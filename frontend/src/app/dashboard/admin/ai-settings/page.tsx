"use client";

import { useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api-client";
import { NavIcon } from "@/components/ui/design-system";
import type { AiProviderAdminRow, AiSettingsAdminData } from "@/types/api";

type ProviderForm = AiProviderAdminRow & { api_key: string };

function toForm(data: AiSettingsAdminData): { defaultProvider: "openai" | "gemini"; providers: ProviderForm[] } {
  return {
    defaultProvider: data.default_provider,
    providers: data.providers.map((p) => ({ ...p, api_key: "" })),
  };
}

export default function AdminAiSettingsPage() {
  const [meAdmin, setMeAdmin] = useState<boolean | null>(null);
  const [defaultProvider, setDefaultProvider] = useState<"openai" | "gemini">("openai");
  const [providers, setProviders] = useState<ProviderForm[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const enabledProviders = useMemo(
    () => providers.filter((p) => p.is_enabled),
    [providers],
  );

  async function load() {
    setError(null);
    try {
      const me = await api.me();
      setMeAdmin(Boolean(me.user?.is_admin));
      const res = await api.adminAiSettings();
      const form = toForm(res.data);
      setDefaultProvider(form.defaultProvider);
      setProviders(form.providers);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load AI settings.");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function updateProvider(provider: "openai" | "gemini", patch: Partial<ProviderForm>) {
    setProviders((rows) => rows.map((row) => (row.provider === provider ? { ...row, ...patch } : row)));
  }

  async function save() {
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.adminUpdateAiSettings({
        default_provider: defaultProvider,
        providers: providers.map((p) => ({
          provider: p.provider,
          is_enabled: p.is_enabled,
          model: p.model.trim(),
          ...(p.api_key.trim() ? { api_key: p.api_key.trim() } : {}),
        })),
      });
      const form = toForm(res.data);
      setDefaultProvider(form.defaultProvider);
      setProviders(form.providers);
      setSuccess("AI settings saved.");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save AI settings.");
    } finally {
      setBusy(false);
    }
  }

  if (meAdmin === false) {
    return (
      <div className="ds-surface p-6 text-sm text-zinc-600 dark:text-zinc-300">
        Admin access required.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <NavIcon name="settings" className="h-5 w-5 text-violet-600 dark:text-violet-300" />
          AI settings
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Manage system-wide AI providers, API keys, and enable or disable each provider for all users.
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100">
          {success}
        </p>
      )}

      <div className="ds-surface space-y-5 p-6">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">Default provider</label>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Used when a project has no provider selected (social templates, new projects, etc.).
          </p>
          <select
            value={defaultProvider}
            onChange={(e) => setDefaultProvider(e.target.value as "openai" | "gemini")}
            className="mt-2 w-full max-w-sm rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-950"
          >
            {enabledProviders.map((p) => (
              <option key={p.provider} value={p.provider}>
                {p.label}
              </option>
            ))}
          </select>
          {enabledProviders.length === 0 && (
            <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">Enable at least one provider below.</p>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {providers.map((row) => (
            <div
              key={row.provider}
              className="rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/70"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{row.label}</p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {row.has_api_key
                      ? `Key configured${row.key_hint ? ` (${row.key_hint})` : ""}${row.uses_env_key ? " via server .env" : ""}`
                      : "No API key configured"}
                  </p>
                </div>
                <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
                  <input
                    type="checkbox"
                    checked={row.is_enabled}
                    onChange={(e) => updateProvider(row.provider, { is_enabled: e.target.checked })}
                    className="h-4 w-4 rounded border-zinc-300"
                  />
                  Enabled
                </label>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">Model</label>
                  <input
                    value={row.model}
                    onChange={(e) => updateProvider(row.provider, { model: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">API key</label>
                  <input
                    type="password"
                    value={row.api_key}
                    onChange={(e) => updateProvider(row.provider, { api_key: e.target.value })}
                    placeholder={row.has_api_key ? "Leave empty to keep current key" : row.provider === "gemini" ? "AIza..." : "sk-..."}
                    className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          disabled={busy || enabledProviders.length === 0}
          onClick={() => void save()}
          className="ds-btn ds-btn-primary px-5 py-2.5 disabled:opacity-60"
        >
          {busy ? "Saving..." : "Save AI settings"}
        </button>
      </div>
    </div>
  );
}
