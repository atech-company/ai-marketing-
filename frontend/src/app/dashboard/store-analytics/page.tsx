"use client";

import { useMemo, useState } from "react";
import { ApiError, api } from "@/lib/api-client";
import type { StoreAnalyticsResponse } from "@/types/api";

function pct(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, (value / total) * 100));
}

function money(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

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

  const aiDiscussion = useMemo(() => {
    if (!result) return null;
    const totals = result.stats.totals;
    const bestProducts = result.stats.best_products;
    const bestCustomers = result.stats.best_customers;
    const top = bestProducts[0];
    const second = bestProducts[1];
    const concentration = top ? pct(top.revenue, totals.total_revenue) : 0;
    const repeatRate = totals.total_customers > 0 ? (totals.returning_customers / totals.total_customers) * 100 : 0;

    const focus: string[] = [];
    if (top) {
      focus.push(
        `Top revenue item is "${top.product_name}" (${money(top.revenue)}; ${concentration.toFixed(1)}% of revenue). Build campaigns around this product first.`,
      );
    }
    if (second) {
      focus.push(
        `Second strongest item is "${second.product_name}" (${money(second.revenue)}). Bundle it with the top item to raise AOV.`,
      );
    }
    if (repeatRate < 25) {
      focus.push(
        `Returning customer rate is ${repeatRate.toFixed(1)}% (low). Prioritize retention: post-purchase email flows, reorder reminders, and VIP offers.`,
      );
    } else {
      focus.push(
        `Returning customer rate is ${repeatRate.toFixed(1)}% (healthy). Scale with loyalty campaigns and lookalike audiences from best customers.`,
      );
    }
    if (bestCustomers[0]) {
      focus.push(
        `Best customer segment starts with ${bestCustomers[0].customer_email} (${money(bestCustomers[0].spend)}). Use this profile for audience targeting.`,
      );
    }

    const ideas = top
      ? [
          `Create 3 creatives focused on "${top.product_name}": problem/solution, proof/testimonial, and offer urgency.`,
          `Run remarketing ads only for viewers of "${top.product_name}" with a limited-time bundle or bonus.`,
          `Optimize product page for "${top.product_name}" first: stronger hero, clearer benefits, and social proof above the fold.`,
        ]
      : [
          "Start by improving product categorization and data quality so top sellers are clearly identifiable.",
          "Test a simple best-sellers section on homepage and collection pages.",
          "Use customer purchase history to create basic cross-sell campaigns.",
        ];

    return { focus, ideas, concentration, repeatRate };
  }, [result]);

  const trendPoints = useMemo(() => {
    if (!result) return [];
    return result.stats.revenue_by_day.slice(-30);
  }, [result]);

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
              <option value="api">API (Shopify / WooCommerce)</option>
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
              <option value="woocommerce">WooCommerce</option>
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
              placeholder={platform === "woocommerce" ? "ck_xxx|cs_xxx" : "Shopify Admin API access token"}
              className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-950"
            />
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              {platform === "woocommerce"
                ? 'WooCommerce format: "consumer_key|consumer_secret" (also supports ":" or "," separators).'
                : "Shopify: use Admin API access token."}
            </p>
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
            <div className="mt-3 space-y-2">
              {result.stats.best_products.map((p, idx) => (
                <div key={`${p.product_name}-${idx}`} className="rounded-xl border border-zinc-100 p-3 dark:border-zinc-800">
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <div className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">{p.product_name}</div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-300">{money(p.revenue)}</div>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-2 rounded-full bg-violet-600"
                      style={{ width: `${pct(p.revenue, result.stats.totals.total_revenue)}%` }}
                    />
                  </div>
                  <div className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                    Qty: {p.quantity} · Orders: {p.order_count} · Share:{" "}
                    {pct(p.revenue, result.stats.totals.total_revenue).toFixed(1)}%
                  </div>
                </div>
              ))}
              {result.stats.best_products.length === 0 && (
                <p className="rounded-xl border border-zinc-100 px-4 py-6 text-sm text-zinc-500 dark:border-zinc-800">
                  No products found in the selected range.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Revenue trend (last 30 points)</h2>
            <div className="mt-3 overflow-hidden rounded-xl border border-zinc-100 p-3 dark:border-zinc-800">
              {trendPoints.length > 1 ? (
                <svg viewBox="0 0 100 30" className="h-32 w-full">
                  {(() => {
                    const max = Math.max(...trendPoints.map((d) => d.revenue), 1);
                    const points = trendPoints
                      .map((d, i) => {
                        const x = (i / (trendPoints.length - 1)) * 100;
                        const y = 28 - (d.revenue / max) * 24;
                        return `${x},${y}`;
                      })
                      .join(" ");
                    return (
                      <>
                        <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points={points} className="text-violet-600" />
                        {trendPoints.map((d, i) => {
                          const x = (i / (trendPoints.length - 1)) * 100;
                          const y = 28 - (d.revenue / max) * 24;
                          return <circle key={`${d.date}-${i}`} cx={x} cy={y} r="0.9" className="fill-violet-500" />;
                        })}
                      </>
                    );
                  })()}
                </svg>
              ) : (
                <p className="px-2 py-8 text-sm text-zinc-500">Not enough data points yet.</p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">AI discussion · what to focus on</h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Practical recommendations generated from your live store statistics.
            </p>
            {aiDiscussion && (
              <div className="mt-3 space-y-4">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Focus now</h3>
                  <ul className="mt-2 space-y-2 text-sm text-zinc-700 dark:text-zinc-200">
                    {aiDiscussion.focus.map((x, i) => (
                      <li key={i} className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950/40">
                        {x}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Marketing ideas</h3>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-zinc-700 dark:text-zinc-200">
                    {aiDiscussion.ideas.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
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
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{money(c.spend)}</td>
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

