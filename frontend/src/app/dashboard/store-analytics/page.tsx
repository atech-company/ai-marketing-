"use client";

import { useMemo, useState } from "react";
import { ApiError, api } from "@/lib/api-client";
import type { StoreAnalyticsResponse } from "@/types/api";

export default function StoreAnalyticsPage() {
  const [moduleName, setModuleName] = useState("Store analytics");
  const [sourceType, setSourceType] = useState<"api" | "csv">("api");
  const [platform, setPlatform] = useState<"shopify" | "woocommerce">("shopify");

  const [storeUrl, setStoreUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const [rangeDays, setRangeDays] = useState(90);
  const [maxOrders, setMaxOrders] = useState(250);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StoreAnalyticsResponse | null>(null);

  const canAnalyze = useMemo(() => {
    if (!moduleName.trim()) return false;
    if (rangeDays < 1 || maxOrders < 1) return false;
    if (sourceType === "api") {
      return storeUrl.trim().length > 0 && apiKey.trim().length > 0;
    }
    return csvFile !== null;
  }, [apiKey, csvFile, maxOrders, moduleName, rangeDays, sourceType, storeUrl]);

  async function onAnalyze() {
    if (!canAnalyze) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (sourceType === "api") {
        const res = await api.storeAnalyticsAnalyzeApi({
          module_name: moduleName.trim(),
          platform,
          store_url: storeUrl.trim(),
          api_key: apiKey.trim(),
          range_days: rangeDays,
          max_orders: maxOrders,
        });
        setResult(res.data);
      } else {
        if (!csvFile) throw new Error("CSV file is missing.");
        const res = await api.storeAnalyticsAnalyzeCsv({
          module_name: moduleName.trim(),
          platform,
          csv_file: csvFile,
          range_days: rangeDays,
          max_orders: maxOrders,
        });
        setResult(res.data);
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Store analytics</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Enter your store URL + API key, click <strong>Analyze</strong>, and we compute best items, best
          customers, and revenue stats for the selected range.
        </p>
      </div>

      <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">Module name</label>
            <input
              value={moduleName}
              onChange={(e) => setModuleName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">Source type</label>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as "api" | "csv")}
              className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="api">API (Shopify)</option>
              <option value="csv">CSV orders upload</option>
            </select>
          </div>

          <div className={sourceType === "api" ? "" : "hidden"}>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as "shopify" | "woocommerce")}
              className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="shopify">Shopify</option>
              <option value="woocommerce">WooCommerce (not implemented yet)</option>
            </select>
          </div>

          <div className={sourceType === "api" ? "" : "hidden"}>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">Store URL</label>
            <input
              value={storeUrl}
              onChange={(e) => setStoreUrl(e.target.value)}
              placeholder="yourstore.myshopify.com"
              className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>

          <div className={sourceType === "api" ? "" : "hidden"}>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">API key / access token</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Shopify Admin API access token"
              className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>

          <div className={sourceType === "csv" ? "" : "hidden"}>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">CSV file</label>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
              className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-950"
            />
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Required headers: <code>order_id</code>, <code>order_date</code>, <code>customer_email</code>,{" "}
              <code>product_name</code>, <code>quantity</code>, <code>line_total</code>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">Range (days)</label>
            <input
              type="number"
              value={rangeDays}
              onChange={(e) => setRangeDays(Number(e.target.value))}
              className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">Max orders</label>
            <input
              type="number"
              value={maxOrders}
              onChange={(e) => setMaxOrders(Number(e.target.value))}
              className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            disabled={!canAnalyze || loading}
            onClick={() => void onAnalyze()}
            className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500 disabled:opacity-60"
          >
            {loading ? "Analyzing…" : "Analyze"}
          </button>

          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            We compute totals + best products/customers from orders (true sales stats).
          </p>
        </div>
      </section>

      {error && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100">
          {error}
        </p>
      )}

      {result && (
        <div className="space-y-6">
          <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Summary</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/40">
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total revenue</div>
                <div className="mt-1 text-base font-semibold">{result.stats.totals.total_revenue.toFixed(2)}</div>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/40">
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total orders</div>
                <div className="mt-1 text-base font-semibold">{result.stats.totals.total_orders}</div>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/40">
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total customers</div>
                <div className="mt-1 text-base font-semibold">{result.stats.totals.total_customers}</div>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/40">
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">AOV</div>
                <div className="mt-1 text-base font-semibold">
                  {result.stats.totals.average_order_value.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/40">
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">New customers</div>
                <div className="mt-1 text-base font-semibold">{result.stats.totals.new_customers}</div>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/40">
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Returning customers</div>
                <div className="mt-1 text-base font-semibold">{result.stats.totals.returning_customers}</div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Best products (top 10)</h2>
            <div className="mt-3 overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-950/50 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Revenue</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {result.stats.best_products.map((p, idx) => (
                    <tr key={`${p.product_name}-${idx}`} className="border-t border-zinc-100 dark:border-zinc-800">
                      <td className="px-4 py-3 font-medium text-zinc-800 dark:text-zinc-100">{p.product_name}</td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                        {p.revenue.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{p.quantity}</td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{p.order_count}</td>
                    </tr>
                  ))}
                  {result.stats.best_products.length === 0 && (
                    <tr>
                      <td className="px-4 py-6 text-sm text-zinc-500" colSpan={4}>
                        No products found in the selected range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Best customers (top 10)</h2>
            <div className="mt-3 overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-950/50 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Spend</th>
                    <th className="px-4 py-3">Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {result.stats.best_customers.map((c, idx) => (
                    <tr key={`${c.customer_email}-${idx}`} className="border-t border-zinc-100 dark:border-zinc-800">
                      <td className="px-4 py-3 font-medium text-zinc-800 dark:text-zinc-100">{c.customer_email}</td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{c.spend.toFixed(2)}</td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{c.order_count}</td>
                    </tr>
                  ))}
                  {result.stats.best_customers.length === 0 && (
                    <tr>
                      <td className="px-4 py-6 text-sm text-zinc-500" colSpan={3}>
                        No customer data found in the selected range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

