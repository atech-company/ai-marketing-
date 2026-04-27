"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, api } from "@/lib/api-client";
import type { Project } from "@/types/api";

export default function ProjectSettingsPage() {
  const params = useParams();
  const id = Number(params.id);

  const [project, setProject] = useState<Project | null>(null);
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState<"shopify" | "woocommerce">("shopify");
  const [storeUrl, setStoreUrl] = useState("");
  const [storeApiKey, setStoreApiKey] = useState("");
  const [aiProvider, setAiProvider] = useState<"openai" | "gemini">("openai");
  const [aiApiKey, setAiApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(id)) return;
    let active = true;
    (async () => {
      try {
        const res = await api.project(id);
        if (!active) return;
        const p = res.data;
        setProject(p);
        setName(p.name);
        setPlatform((p.store_platform as "shopify" | "woocommerce") ?? "shopify");
        setStoreUrl(p.store_url ?? "");
        setAiProvider((p.ai_provider as "openai" | "gemini") ?? "openai");
      } catch (e) {
        if (!active) return;
        setError(e instanceof ApiError ? e.message : "Failed to load project.");
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!project) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const body: {
        name?: string;
        store_platform?: "shopify" | "woocommerce";
        store_url?: string;
        store_api_key?: string;
        ai_provider?: "openai" | "gemini";
        ai_api_key?: string;
      } = {
        name: name.trim(),
      };
      if (storeUrl.trim()) {
        body.store_platform = platform;
        body.store_url = storeUrl.trim();
      }
      if (storeApiKey.trim()) {
        body.store_api_key = storeApiKey.trim();
      }
      if (aiApiKey.trim()) {
        body.ai_provider = aiProvider;
        body.ai_api_key = aiApiKey.trim();
      } else if (project.ai_provider) {
        body.ai_provider = aiProvider;
      }

      const res = await api.updateProject(project.id, body);
      setProject(res.data);
      setSuccess("Project settings saved.");
      setStoreApiKey("");
      setAiApiKey("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href={`/dashboard/projects/${id}`} className="text-sm font-medium text-violet-600 hover:text-violet-500 dark:text-violet-400">
          ← Back to project
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Project settings</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          One setup per project: store credentials + AI provider key for all users who can access this project.
        </p>
      </div>

      <form onSubmit={(e) => void onSave(e)} className="space-y-5 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
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

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">Project name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>

        <div className="rounded-xl border border-zinc-200/80 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">Store credentials</p>
          <div className="mt-3 grid gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as "shopify" | "woocommerce")}
                className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-950"
              >
                <option value="shopify">Shopify</option>
                <option value="woocommerce">WooCommerce</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">Store URL</label>
              <input
                value={storeUrl}
                onChange={(e) => setStoreUrl(e.target.value)}
                placeholder="yourstore.myshopify.com"
                className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">API key / token (optional update)</label>
              <input
                type="password"
                value={storeApiKey}
                onChange={(e) => setStoreApiKey(e.target.value)}
                placeholder="Leave empty to keep current key"
                className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200/80 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">AI provider credentials</p>
          <div className="mt-3 grid gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">Provider</label>
              <select
                value={aiProvider}
                onChange={(e) => setAiProvider(e.target.value as "openai" | "gemini")}
                className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-950"
              >
                <option value="openai">OpenAI</option>
                <option value="gemini">Gemini</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">API key (optional update)</label>
              <input
                type="password"
                value={aiApiKey}
                onChange={(e) => setAiApiKey(e.target.value)}
                placeholder={aiProvider === "gemini" ? "AIza... (leave empty to keep current key)" : "sk-... (leave empty to keep current key)"}
                className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="w-full rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save settings"}
        </button>
      </form>
    </div>
  );
}
