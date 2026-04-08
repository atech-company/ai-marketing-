"use client";

import { useEffect, useMemo, useState } from "react";
import { ApiError, api } from "@/lib/api-client";
import type { Project, StoreAnalyticsResponse } from "@/types/api";

function pct(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, (value / total) * 100));
}

function money(n: number, locale: "en" | "ar" = "en"): string {
  return n.toLocaleString(locale === "ar" ? "ar" : undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function categoryFromProductName(name: string, language: "en" | "ar" = "en"): string {
  const label = (en: string, ar: string) => (language === "ar" ? ar : en);
  const lower = name.toLowerCase();
  if (/(shirt|hoodie|jacket|pants|dress|shoes|sneaker|clothes|apparel)/.test(lower)) return label("Apparel", "ملابس");
  if (/(cream|serum|makeup|skin|cosmetic|beauty|lotion|shampoo)/.test(lower)) return label("Beauty", "جمال");
  if (/(phone|case|charger|cable|headphone|laptop|keyboard|mouse|tech)/.test(lower)) return label("Electronics", "إلكترونيات");
  if (/(protein|vitamin|supplement|omega|nutrition)/.test(lower)) return label("Supplements", "مكملات");
  if (/(home|kitchen|decor|furniture|lamp|bedding)/.test(lower)) return label("Home", "منزل");
  return label("Other", "أخرى");
}

function tx(language: "en" | "ar", en: string, ar: string): string {
  return language === "ar" ? ar : en;
}

function CircleGauge({
  value,
  label,
  colorClass,
}: {
  value: number;
  label: string;
  colorClass: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const dash = (clamped / 100) * circumference;
  return (
    <div className="flex flex-col items-center rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/40">
      <svg viewBox="0 0 64 64" className="h-20 w-20 -rotate-90">
        <circle cx="32" cy="32" r={radius} stroke="currentColor" strokeWidth="6" fill="none" className="text-zinc-200 dark:text-zinc-800" />
        <circle
          cx="32"
          cy="32"
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          className={colorClass}
        />
      </svg>
      <div className="mt-1 text-sm font-semibold">{clamped.toFixed(1)}%</div>
      <div className="text-center text-xs text-zinc-500 dark:text-zinc-400">{label}</div>
    </div>
  );
}

export default function StoreAnalyticsPage() {
  const [language, setLanguage] = useState<"en" | "ar">(() => {
    if (typeof window === "undefined") return "en";
    const stored = localStorage.getItem("aim_ui_lang");
    return stored === "ar" ? "ar" : "en";
  });
  const [moduleName, setModuleName] = useState("Store analytics");
  const [sourceType, setSourceType] = useState<"api" | "csv">("api");
  const [platform, setPlatform] = useState<"shopify" | "woocommerce">("shopify");
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | "">("");
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newWebsiteUrl, setNewWebsiteUrl] = useState("");
  const [newStoreUrl, setNewStoreUrl] = useState("");
  const [newStoreApiKey, setNewStoreApiKey] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);
  const [createProjectError, setCreateProjectError] = useState<string | null>(null);
  const [showEditCredentials, setShowEditCredentials] = useState(false);
  const [editStoreUrl, setEditStoreUrl] = useState("");
  const [editStoreApiKey, setEditStoreApiKey] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [completedPlanItems, setCompletedPlanItems] = useState<Record<string, boolean>>({});
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const [rangeDays, setRangeDays] = useState(90);
  const [maxOrders, setMaxOrders] = useState(250);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StoreAnalyticsResponse | null>(null);
  const isArabic = language === "ar";

  useEffect(() => {
    if (sourceType !== "api") return;
    let active = true;
    (async () => {
      try {
        const res = await api.projects(1);
        if (!active) return;
        setProjects(res.data);
        if (!selectedProjectId) {
          const withConfig = res.data.find((p) => p.has_store_config);
          if (withConfig) setSelectedProjectId(withConfig.id);
        }
      } catch {
        if (!active) return;
        setProjects([]);
      }
    })();
    return () => {
      active = false;
    };
  }, [selectedProjectId, sourceType]);

  async function onCreateProjectWithCredentials() {
    setCreateProjectError(null);
    setCreatingProject(true);
    try {
      const res = await api.createProject({
        name: newProjectName.trim(),
        website_url: newWebsiteUrl.trim(),
        store_platform: platform,
        store_url: newStoreUrl.trim(),
        store_api_key: newStoreApiKey.trim(),
      });
      const created = res.data;
      setProjects((prev) => [created, ...prev]);
      setSelectedProjectId(created.id);
      setShowCreateProject(false);
      setNewProjectName("");
      setNewWebsiteUrl("");
      setNewStoreUrl("");
      setNewStoreApiKey("");
    } catch (e) {
      setCreateProjectError(e instanceof ApiError ? e.message : "Failed to create project.");
    } finally {
      setCreatingProject(false);
    }
  }

  const canAnalyze = useMemo(() => {
    if (!moduleName.trim()) return false;
    if (rangeDays < 1 || maxOrders < 1) return false;
    if (sourceType === "api") {
      return typeof selectedProjectId === "number";
    }
    return csvFile !== null;
  }, [csvFile, maxOrders, moduleName, rangeDays, selectedProjectId, sourceType]);

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
        `Top revenue item is "${top.product_name}" (${money(top.revenue, language)}; ${concentration.toFixed(1)}% of revenue). Build campaigns around this product first.`,
      );
    }
    if (second) {
      focus.push(
        `Second strongest item is "${second.product_name}" (${money(second.revenue, language)}). Bundle it with the top item to raise AOV.`,
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
        `Best customer segment starts with ${bestCustomers[0].customer_email} (${money(bestCustomers[0].spend, language)}). Use this profile for audience targeting.`,
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
  }, [language, result]);

  const trendPoints = useMemo(() => {
    if (!result) return [];
    return result.stats.revenue_by_day.slice(-30);
  }, [result]);

  const repeatRate = useMemo(() => {
    if (!result) return 0;
    const total = result.stats.totals.total_customers;
    if (total <= 0) return 0;
    return (result.stats.totals.returning_customers / total) * 100;
  }, [result]);

  const categoryBreakdown = useMemo(() => {
    if (!result) return [];
    const map = new Map<string, number>();
    for (const p of result.stats.best_products) {
      const cat = categoryFromProductName(p.product_name, language);
      map.set(cat, (map.get(cat) ?? 0) + p.revenue);
    }
    return Array.from(map.entries())
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [language, result]);

  const segments = useMemo(() => {
    if (!result) return [];
    return result.stats.best_customers.slice(0, 10).map((c) => {
      if (c.order_count >= 4 || c.spend >= result.stats.totals.average_order_value * 4) {
        return { ...c, segment: "VIP / High Value" };
      }
      if (c.order_count >= 2) {
        return { ...c, segment: "Repeat Buyer" };
      }
      return { ...c, segment: "One-time Buyer" };
    });
  }, [language, result]);

  const bundleSuggestions = useMemo(() => {
    if (!result) return [];
    const top = result.stats.best_products.slice(0, 4);
    if (top.length < 2) return [];
    const suggestions: Array<{ title: string; why: string }> = [];
    for (let i = 0; i < top.length; i += 1) {
      const a = top[i];
      const b = top[i + 1];
      if (!a || !b) continue;
      suggestions.push({
        title: `${a.product_name} + ${b.product_name}`,
        why: `Bundle your top sellers to increase AOV. Combined revenue weight is ${pct(a.revenue + b.revenue, result.stats.totals.total_revenue).toFixed(1)}% of current sales.`,
      });
    }
    return suggestions.slice(0, 3);
  }, [result]);

  const nextActions = useMemo(() => {
    if (!result) return [];
    const actions: string[] = [];
    const top = result.stats.best_products[0];
    if (top) {
      actions.push(`Scale paid traffic on "${top.product_name}" first with 3 ad angles (problem, proof, offer).`);
    }
    if (repeatRate < 30) {
      actions.push("Launch a retention flow now: post-purchase email + reorder reminders + loyalty incentive.");
    } else {
      actions.push("Repeat rate is strong: build lookalike audiences from repeat buyers and increase budget gradually.");
    }
    if (bundleSuggestions[0]) {
      actions.push(`Publish a bundle landing page for "${bundleSuggestions[0].title}" and test a 10-15% bundle discount.`);
    }
    actions.push("Set weekly KPI targets: Revenue, Repeat Rate, AOV, and Top 3 Product Share.");
    return actions;
  }, [bundleSuggestions, repeatRate, result]);

  const budgetSplit = useMemo(() => {
    if (!result) return { acquisition: 60, retention: 40, reason: "" };
    const topShare = pct((result.stats.best_products[0]?.revenue ?? 0), result.stats.totals.total_revenue);
    if (repeatRate < 20) {
      return {
        acquisition: 45,
        retention: 55,
        reason: "Repeat rate is low, so prioritize retention systems before scaling paid traffic.",
      };
    }
    if (repeatRate < 30) {
      return {
        acquisition: 55,
        retention: 45,
        reason: "Retention is improving but still fragile. Keep near-balanced spend.",
      };
    }
    if (topShare > 45) {
      return {
        acquisition: 65,
        retention: 35,
        reason: "Strong winner product and healthy repeat behavior support more acquisition scaling.",
      };
    }
    return {
      acquisition: 60,
      retention: 40,
      reason: "Balanced growth mode: scale traffic while protecting repeat purchase programs.",
    };
  }, [repeatRate, result]);

  const mathPlan = useMemo(() => {
    if (!result) return null;
    const totals = result.stats.totals;
    const currentRevenue = totals.total_revenue;
    const currentAov = totals.average_order_value;
    const currentRepeat = repeatRate;
    const targetAov = currentAov * 1.1;
    const targetRepeat = Math.max(currentRepeat, 35);
    const aovUpside = totals.total_orders * (targetAov - currentAov);
    const retentionUpside = currentRevenue * ((targetRepeat - currentRepeat) / 100) * 0.6;
    const projectedRevenue = currentRevenue + Math.max(0, aovUpside) + Math.max(0, retentionUpside);
    const growthPct = currentRevenue > 0 ? ((projectedRevenue - currentRevenue) / currentRevenue) * 100 : 0;
    const top3Share =
      pct(
        (result.stats.best_products[0]?.revenue ?? 0) +
          (result.stats.best_products[1]?.revenue ?? 0) +
          (result.stats.best_products[2]?.revenue ?? 0),
        currentRevenue,
      ) || 0;

    return {
      currentRevenue,
      projectedRevenue,
      growthPct,
      currentAov,
      targetAov,
      currentRepeat,
      targetRepeat,
      top3Share,
    };
  }, [repeatRate, result]);

  const extraMetrics = useMemo(() => {
    if (!result) return null;
    const totals = result.stats.totals;
    const totalRevenue = totals.total_revenue || 0;
    const totalOrders = totals.total_orders || 0;
    const totalCustomers = totals.total_customers || 0;
    const topCustomerSpend = result.stats.best_customers[0]?.spend ?? 0;
    const topProductRevenue = result.stats.best_products[0]?.revenue ?? 0;
    const revenuePerCustomer = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
    const ordersPerCustomer = totalCustomers > 0 ? totalOrders / totalCustomers : 0;
    const repeatOrderGap = Math.max(0, 100 - repeatRate);
    return {
      revenuePerCustomer,
      ordersPerCustomer,
      topCustomerShare: pct(topCustomerSpend, totalRevenue),
      topProductShare: pct(topProductRevenue, totalRevenue),
      repeatRate,
      repeatOrderGap,
    };
  }, [repeatRate, result]);

  const sevenDayPlan = useMemo(() => {
    const top = result?.stats.best_products[0]?.product_name ?? "Top product";
    return [
      `Day 1: Audit ${top} product page (headline, offer, trust, FAQ).`,
      `Day 2: Launch 3 ad creatives for ${top} (problem, social proof, urgency).`,
      "Day 3: Build bundle offer and publish dedicated landing page.",
      "Day 4: Set retention automations (post-purchase, win-back, reorder reminders).",
      "Day 5: Segment customers (VIP, repeat, one-time) and map campaigns.",
      "Day 6: Test offer variants (discount, bonus, free shipping threshold).",
      "Day 7: Review KPIs and reallocate budget based on ROAS + repeat rate.",
    ];
  }, [result]);

  const campaignCopies = useMemo(() => {
    if (!result) return [];
    return result.stats.best_products.slice(0, 3).map((p) => ({
      product: p.product_name,
      copies: [
        `Discover why customers keep choosing ${p.product_name}. Limited stock this week.`,
        `Boost your results with ${p.product_name}. Trusted by top buyers in our store.`,
        `${p.product_name}: best value for the price. Order now and feel the difference.`,
      ],
    }));
  }, [result]);

  function togglePlanItem(item: string) {
    setCompletedPlanItems((prev) => ({ ...prev, [item]: !prev[item] }));
  }

  const selectedProject = useMemo(() => {
    if (typeof selectedProjectId !== "number") return null;
    return projects.find((p) => p.id === selectedProjectId) ?? null;
  }, [projects, selectedProjectId]);

  useEffect(() => {
    if (!selectedProject) return;
    setPlatform((selectedProject.store_platform as "shopify" | "woocommerce") ?? "shopify");
    setEditStoreUrl(selectedProject.store_url ?? "");
    setEditStoreApiKey("");
  }, [selectedProject]);

  async function onSaveCredentials() {
    if (!selectedProject || !editStoreUrl.trim() || !editStoreApiKey.trim()) return;
    setSavingEdit(true);
    setEditError(null);
    try {
      const res = await api.updateProject(selectedProject.id, {
        store_platform: platform,
        store_url: editStoreUrl.trim(),
        store_api_key: editStoreApiKey.trim(),
      });
      const updated = res.data;
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setShowEditCredentials(false);
      setEditStoreApiKey("");
    } catch (e) {
      setEditError(e instanceof ApiError ? e.message : "Failed to update credentials.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function onAnalyze() {
    if (!canAnalyze) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (sourceType === "api") {
        if (typeof selectedProjectId !== "number") {
          throw new Error("Please select a project.");
        }
        const res = await api.storeAnalyticsAnalyzeProject(selectedProjectId, {
          language,
          range_days: rangeDays,
          max_orders: maxOrders,
        });
        setResult(res.data);
      } else {
        if (!csvFile) throw new Error("CSV file is missing.");
        const res = await api.storeAnalyticsAnalyzeCsv({
          module_name: moduleName.trim(),
          platform,
          language,
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
    <div lang={language} className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{tx(language, "Store analytics", "تحليل المتجر")}</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {tx(language, "Select a project with saved store credentials, then click ", "اختر مشروعا محفوظا ببيانات المتجر ثم اضغط ")}
          <strong>{tx(language, "Analyze", "تحليل")}</strong>.
        </p>
      </div>

      <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">{tx(language, "Module name", "اسم الوحدة")}</label>
            <input
              value={moduleName}
              onChange={(e) => setModuleName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
              {isArabic ? "اللغة" : "Language"}
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as "en" | "ar")}
              className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">{tx(language, "Source type", "نوع المصدر")}</label>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as "api" | "csv")}
              className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="api">{tx(language, "API (Shopify / WooCommerce)", "واجهة API (شوبيفاي / ووكومرس)")}</option>
              <option value="csv">{tx(language, "CSV orders upload", "رفع CSV للطلبات")}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">{tx(language, "Platform", "المنصة")}</label>
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
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">{tx(language, "Project", "المشروع")}</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value ? Number(e.target.value) : "")}
              className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="">{tx(language, "Select project...", "اختر المشروع...")}</option>
              {projects
                .filter((p) => p.has_store_config)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.store_platform ?? "api"})
                  </option>
                ))}
            </select>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              {tx(language, "Only projects with saved store URL + API key are listed. Add these in Create Project.", "يتم عرض المشاريع التي تحتوي على رابط المتجر ومفتاح API فقط. أضفها عند إنشاء المشروع.")}
            </p>
            <button
              type="button"
              onClick={() => {
                setCreateProjectError(null);
                setShowCreateProject((v) => !v);
              }}
              className="mt-2 text-xs font-semibold text-violet-600 hover:text-violet-500 dark:text-violet-400"
            >
              {showCreateProject ? tx(language, "Hide create project form", "إخفاء نموذج إنشاء المشروع") : tx(language, "Create project here and save credentials", "أنشئ المشروع هنا واحفظ بيانات الدخول")}
            </button>
            {selectedProject ? (
              <button
                type="button"
                onClick={() => {
                  setEditError(null);
                  setShowEditCredentials((v) => !v);
                }}
                className="ml-3 mt-2 text-xs font-semibold text-violet-600 hover:text-violet-500 dark:text-violet-400"
              >
                {showEditCredentials ? tx(language, "Hide edit credentials", "إخفاء تعديل البيانات") : tx(language, "Edit saved credentials", "تعديل البيانات المحفوظة")}
              </button>
            ) : null}
          </div>

          <div className={sourceType === "csv" ? "" : "hidden"}>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">{tx(language, "CSV file", "ملف CSV")}</label>
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
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">{tx(language, "Range (days)", "المدة (بالأيام)")}</label>
            <input
              type="number"
              value={rangeDays}
              onChange={(e) => setRangeDays(Number(e.target.value))}
              className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">{tx(language, "Max orders", "الحد الأقصى للطلبات")}</label>
            <input
              type="number"
              value={maxOrders}
              onChange={(e) => setMaxOrders(Number(e.target.value))}
              className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
        </div>

        {sourceType === "api" && showCreateProject ? (
          <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{tx(language, "Create project (with store credentials)", "إنشاء مشروع (مع بيانات المتجر)")}</h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {tx(language, "Save once, then analyze anytime without entering URL/API key again.", "احفظ مرة واحدة ثم حلل في أي وقت بدون إدخال الرابط والمفتاح مجددا.")}
            </p>
            {createProjectError ? (
              <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100">
                {createProjectError}
              </p>
            ) : null}
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <input
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Project name"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-950"
              />
              <input
                value={newWebsiteUrl}
                onChange={(e) => setNewWebsiteUrl(e.target.value)}
                placeholder="Website URL (for crawler)"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-950"
              />
              <input
                value={newStoreUrl}
                onChange={(e) => setNewStoreUrl(e.target.value)}
                placeholder="Store URL"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-950"
              />
              <input
                type="password"
                value={newStoreApiKey}
                onChange={(e) => setNewStoreApiKey(e.target.value)}
                placeholder={platform === "woocommerce" ? "ck_xxx|cs_xxx" : "Shopify API token"}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
            <div className="mt-3">
              <button
                type="button"
                disabled={
                  creatingProject ||
                  !newProjectName.trim() ||
                  !newWebsiteUrl.trim() ||
                  !newStoreUrl.trim() ||
                  !newStoreApiKey.trim()
                }
                onClick={() => void onCreateProjectWithCredentials()}
                className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500 disabled:opacity-60"
              >
                {creatingProject ? tx(language, "Creating...", "جار الإنشاء...") : tx(language, "Create and use this project", "إنشاء واستخدام هذا المشروع")}
              </button>
            </div>
          </div>
        ) : null}

        {sourceType === "api" && showEditCredentials && selectedProject ? (
          <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{tx(language, "Edit saved credentials", "تعديل البيانات المحفوظة")}</h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Project: {selectedProject.name}</p>
            {editError ? (
              <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100">
                {editError}
              </p>
            ) : null}
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <input
                value={editStoreUrl}
                onChange={(e) => setEditStoreUrl(e.target.value)}
                placeholder="Store URL"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-950"
              />
              <input
                type="password"
                value={editStoreApiKey}
                onChange={(e) => setEditStoreApiKey(e.target.value)}
                placeholder="New API key / token"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
            <div className="mt-3">
              <button
                type="button"
                disabled={savingEdit || !editStoreUrl.trim() || !editStoreApiKey.trim()}
                onClick={() => void onSaveCredentials()}
                className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500 disabled:opacity-60"
              >
                {savingEdit ? tx(language, "Saving...", "جار الحفظ...") : tx(language, "Save credentials", "حفظ البيانات")}
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            disabled={!canAnalyze || loading}
            onClick={() => void onAnalyze()}
            className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500 disabled:opacity-60"
          >
            {loading ? tx(language, "Analyzing…", "جار التحليل...") : tx(language, "Analyze", "تحليل")}
          </button>

          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            We compute totals, product/customer rankings, concentration, and repeat customer indicators.
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
            <div className="mt-3 rounded-xl border border-violet-200 bg-violet-50 p-3 dark:border-violet-500/30 dark:bg-violet-500/10">
              <div className="text-xs font-medium text-violet-700 dark:text-violet-200">Repeat rate</div>
              <div className="mt-1 text-base font-semibold text-violet-800 dark:text-violet-100">{repeatRate.toFixed(1)}%</div>
              <div className="mt-1 text-xs text-violet-700/90 dark:text-violet-200/90">
                {repeatRate < 30
                  ? "Priority: improve retention now (email/SMS flows, reorder incentives, loyalty)."
                  : "Good retention base. Next move: scale acquisition using repeat-buyer lookalikes."}
              </div>
            </div>
          </section>

          {extraMetrics ? (
            <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Visual KPI circles + extra data</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <CircleGauge value={extraMetrics.repeatRate} label="Repeat rate" colorClass="text-violet-600" />
                <CircleGauge value={extraMetrics.topProductShare} label="Top product share" colorClass="text-emerald-600" />
                <CircleGauge value={extraMetrics.topCustomerShare} label="Top customer share" colorClass="text-indigo-600" />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/40">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">Revenue per customer</div>
                  <div className="mt-1 text-base font-semibold">{money(extraMetrics.revenuePerCustomer, language)}</div>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/40">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">Orders per customer</div>
                  <div className="mt-1 text-base font-semibold">{extraMetrics.ordersPerCustomer.toFixed(2)}</div>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/40">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">Top customer concentration</div>
                  <div className="mt-1 text-base font-semibold">{extraMetrics.topCustomerShare.toFixed(1)}%</div>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/40">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">Retention opportunity</div>
                  <div className="mt-1 text-base font-semibold">{extraMetrics.repeatOrderGap.toFixed(1)}%</div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Bar graph focus</div>
                <div>
                  <div className="mb-1 flex justify-between text-xs"><span>Repeat rate</span><span>{extraMetrics.repeatRate.toFixed(1)}%</span></div>
                  <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div className="h-2 rounded-full bg-violet-600" style={{ width: `${extraMetrics.repeatRate}%` }} />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-xs"><span>Top product share</span><span>{extraMetrics.topProductShare.toFixed(1)}%</span></div>
                  <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div className="h-2 rounded-full bg-emerald-600" style={{ width: `${extraMetrics.topProductShare}%` }} />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-xs"><span>Top customer share</span><span>{extraMetrics.topCustomerShare.toFixed(1)}%</span></div>
                  <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div className="h-2 rounded-full bg-indigo-600" style={{ width: `${extraMetrics.topCustomerShare}%` }} />
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Revenue by category (estimated)</h2>
            <div className="mt-3 space-y-2">
              {categoryBreakdown.map((c) => (
                <div key={c.category} className="rounded-xl border border-zinc-100 p-3 dark:border-zinc-800">
                  <div className="mb-1 flex items-center justify-between">
                    <div className="text-sm font-medium">{c.category}</div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-300">{money(c.revenue, language)}</div>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-2 rounded-full bg-emerald-600"
                      style={{ width: `${pct(c.revenue, result.stats.totals.total_revenue)}%` }}
                    />
                  </div>
                </div>
              ))}
              {categoryBreakdown.length === 0 ? (
                <p className="rounded-xl border border-zinc-100 px-4 py-6 text-sm text-zinc-500 dark:border-zinc-800">
                  No category distribution yet.
                </p>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Best products (top 10)</h2>
            <div className="mt-3 space-y-2">
              {result.stats.best_products.map((p, idx) => (
                <div key={`${p.product_name}-${idx}`} className="rounded-xl border border-zinc-100 p-3 dark:border-zinc-800">
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <div className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">{p.product_name}</div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-300">{money(p.revenue, language)}</div>
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
                {result.ai_discussion?.executive_summary && (
                  <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-200">
                    {result.ai_discussion.executive_summary}
                  </div>
                )}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Focus now</h3>
                  <ul className="mt-2 space-y-2 text-sm text-zinc-700 dark:text-zinc-200">
                    {(result.ai_discussion?.focus_items?.length ? result.ai_discussion.focus_items : aiDiscussion.focus).map((x, i) => (
                      <li key={i} className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950/40">
                        {x}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Marketing ideas</h3>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-zinc-700 dark:text-zinc-200">
                    {(result.ai_discussion?.marketing_ideas?.length ? result.ai_discussion.marketing_ideas : aiDiscussion.ideas).map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </div>
                {result.ai_discussion?.next_30_day_plan?.length ? (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Next 30-day plan</h3>
                    <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-zinc-700 dark:text-zinc-200">
                      {result.ai_discussion.next_30_day_plan.map((x, i) => (
                        <li key={i}>{x}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {result.ai_discussion?.risks?.length ? (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Risks to watch</h3>
                    <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-zinc-700 dark:text-zinc-200">
                      {result.ai_discussion.risks.map((x, i) => (
                        <li key={i}>{x}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Customer segments (actionable)</h2>
            <div className="mt-3 overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-950/50 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Segment</th>
                    <th className="px-4 py-3">Spend</th>
                    <th className="px-4 py-3">Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {segments.map((c, idx) => (
                    <tr key={`${c.customer_email}-${idx}`} className="border-t border-zinc-100 dark:border-zinc-800">
                      <td className="px-4 py-3 font-medium text-zinc-800 dark:text-zinc-100">{c.customer_email}</td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{c.segment}</td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{money(c.spend, language)}</td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{c.order_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Bundle suggestions</h2>
            <div className="mt-3 space-y-2">
              {bundleSuggestions.map((b, idx) => (
                <div key={idx} className="rounded-xl border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/40">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{b.title}</div>
                  <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">{b.why}</div>
                </div>
              ))}
              {bundleSuggestions.length === 0 ? (
                <p className="rounded-xl border border-zinc-100 px-4 py-6 text-sm text-zinc-500 dark:border-zinc-800">
                  Not enough top products to generate bundles yet.
                </p>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl border border-amber-200/80 bg-amber-50 p-5 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10">
            <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-100">What should I do next? (AI decisions)</h2>
            <ul className="mt-3 space-y-2">
              {nextActions.map((a, i) => (
                <li key={i} className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-zinc-950/40 dark:text-amber-100">
                  {a}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">7-day action plan</h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Execute this weekly sprint and check off each completed step.
            </p>
            <div className="mt-3 space-y-2">
              {sevenDayPlan.map((item) => (
                <label
                  key={item}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950/40"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(completedPlanItems[item])}
                    onChange={() => togglePlanItem(item)}
                    className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-violet-600 focus:ring-violet-500 dark:border-zinc-700"
                  />
                  <span className={completedPlanItems[item] ? "line-through opacity-70" : ""}>{item}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Campaign copy suggestions (top products)</h2>
            <div className="mt-3 space-y-3">
              {campaignCopies.map((cp) => (
                <div key={cp.product} className="rounded-xl border border-zinc-100 p-3 dark:border-zinc-800">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{cp.product}</div>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-zinc-700 dark:text-zinc-200">
                    {cp.copies.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </div>
              ))}
              {campaignCopies.length === 0 ? (
                <p className="rounded-xl border border-zinc-100 px-4 py-6 text-sm text-zinc-500 dark:border-zinc-800">
                  No top products available yet for campaign copy generation.
                </p>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Budget split recommendation</h2>
            <div className="mt-3 rounded-xl border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/40">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Acquisition</span>
                <span className="font-semibold">{budgetSplit.acquisition}%</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div className="h-2 rounded-full bg-indigo-600" style={{ width: `${budgetSplit.acquisition}%` }} />
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="font-medium">Retention</span>
                <span className="font-semibold">{budgetSplit.retention}%</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div className="h-2 rounded-full bg-emerald-600" style={{ width: `${budgetSplit.retention}%` }} />
              </div>
              <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-300">{budgetSplit.reason}</p>
            </div>
          </section>

          {mathPlan ? (
            <section className="rounded-2xl border border-cyan-200/80 bg-cyan-50 p-5 shadow-sm dark:border-cyan-500/30 dark:bg-cyan-500/10">
              <h2 className="text-sm font-semibold text-cyan-900 dark:text-cyan-100">AI growth math blueprint</h2>
              <p className="mt-1 text-xs text-cyan-800/90 dark:text-cyan-100/90">
                Exact numeric path to improve revenue using AOV + repeat-rate levers.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-cyan-200 bg-white p-3 dark:border-cyan-500/30 dark:bg-zinc-950/40">
                  <div className="text-xs text-cyan-700 dark:text-cyan-200">Current revenue</div>
                  <div className="mt-1 text-base font-semibold text-cyan-900 dark:text-cyan-100">
                    {money(mathPlan.currentRevenue, language)}
                  </div>
                </div>
                <div className="rounded-xl border border-cyan-200 bg-white p-3 dark:border-cyan-500/30 dark:bg-zinc-950/40">
                  <div className="text-xs text-cyan-700 dark:text-cyan-200">Projected revenue</div>
                  <div className="mt-1 text-base font-semibold text-cyan-900 dark:text-cyan-100">
                    {money(mathPlan.projectedRevenue, language)}
                  </div>
                </div>
                <div className="rounded-xl border border-cyan-200 bg-white p-3 dark:border-cyan-500/30 dark:bg-zinc-950/40">
                  <div className="text-xs text-cyan-700 dark:text-cyan-200">Potential growth</div>
                  <div className="mt-1 text-base font-semibold text-cyan-900 dark:text-cyan-100">
                    {mathPlan.growthPct.toFixed(1)}%
                  </div>
                </div>
                <div className="rounded-xl border border-cyan-200 bg-white p-3 dark:border-cyan-500/30 dark:bg-zinc-950/40">
                  <div className="text-xs text-cyan-700 dark:text-cyan-200">Top-3 product concentration</div>
                  <div className="mt-1 text-base font-semibold text-cyan-900 dark:text-cyan-100">
                    {mathPlan.top3Share.toFixed(1)}%
                  </div>
                </div>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-cyan-900 dark:text-cyan-100">
                <li className="rounded-lg border border-cyan-200 bg-white px-3 py-2 dark:border-cyan-500/30 dark:bg-zinc-950/40">
                  AOV target: {money(mathPlan.currentAov, language)} to {money(mathPlan.targetAov, language)} (10% uplift).
                </li>
                <li className="rounded-lg border border-cyan-200 bg-white px-3 py-2 dark:border-cyan-500/30 dark:bg-zinc-950/40">
                  Repeat-rate target: {mathPlan.currentRepeat.toFixed(1)}% to {mathPlan.targetRepeat.toFixed(1)}%.
                </li>
                <li className="rounded-lg border border-cyan-200 bg-white px-3 py-2 dark:border-cyan-500/30 dark:bg-zinc-950/40">
                  If Top-3 concentration is above 60%, diversify by pushing category #2 and #3 with dedicated campaigns.
                </li>
              </ul>
            </section>
          ) : null}

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
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{money(c.spend, language)}</td>
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

