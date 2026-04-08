"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError, api } from "@/lib/api-client";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [platform, setPlatform] = useState<"shopify" | "woocommerce">("shopify");
  const [storeUrl, setStoreUrl] = useState("");
  const [storeApiKey, setStoreApiKey] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload: {
        name: string;
        website_url: string;
        store_platform?: "shopify" | "woocommerce";
        store_url?: string;
        store_api_key?: string;
      } = {
        name,
        website_url: websiteUrl,
      };
      if (storeUrl.trim() && storeApiKey.trim()) {
        payload.store_platform = platform;
        payload.store_url = storeUrl.trim();
        payload.store_api_key = storeApiKey.trim();
      }
      const res = await api.createProject(payload);
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
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">New project</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          We will fetch your homepage, discover pages, and you can optionally save store analytics API settings once.
        </p>
      </div>

      <form onSubmit={(e) => void onSubmit(e)} className="space-y-5 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Project name
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-violet-500/30 focus:border-violet-500 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950"
            placeholder="e.g. Acme storefront"
          />
        </div>
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
        <div className="rounded-xl border border-zinc-200/80 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">Store analytics settings (optional)</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Save these once so users can run analytics later without re-entering URL/API key.
          </p>
          <div className="mt-3 grid gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as "shopify" | "woocommerce")}
                className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-violet-500/30 focus:border-violet-500 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950"
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
                className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-violet-500/30 focus:border-violet-500 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950"
                placeholder="yourstore.myshopify.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">API key / access token</label>
              <input
                type="password"
                value={storeApiKey}
                onChange={(e) => setStoreApiKey(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-violet-500/30 focus:border-violet-500 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950"
                placeholder={platform === "woocommerce" ? "ck_xxx|cs_xxx" : "Shopify Admin API access token"}
              />
            </div>
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-500 disabled:opacity-60"
        >
          {submitting ? "Creating…" : "Start analysis"}
        </button>
      </form>
    </div>
  );
}
