"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError, api } from "@/lib/api-client";
import type { GeneratedContent, Project, ProjectStatus } from "@/types/api";
import { ShareToolbar } from "@/components/social/share-toolbar";
import { CopyButton } from "@/components/ui/copy-button";
import { StatusBadge } from "@/components/ui/status-badge";

function isProcessing(status: ProjectStatus): boolean {
  return status === "pending" || status === "crawling" || status === "analyzing";
}

function groupContents(items: GeneratedContent[] | undefined) {
  const map: Record<string, GeneratedContent[]> = {};
  for (const g of items ?? []) {
    const k = g.content_type;
    map[k] = map[k] ? [...map[k], g] : [g];
  }
  return map;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [regen, setRegen] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!Number.isFinite(id)) return;
    try {
      const res = await api.project(id);
      setProject(res.data);
      setError(null);
      try {
        sessionStorage.setItem(`aim_project_${id}`, JSON.stringify(res.data));
      } catch {
        /* ignore */
      }
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setError("Project not found.");
      } else {
        setError(e instanceof ApiError ? e.message : "Failed to load project.");
      }
    }
  }, [id]);

  useEffect(() => {
    // Instant paint: show cached project while refreshing.
    try {
      const raw = sessionStorage.getItem(`aim_project_${id}`);
      if (raw) {
        const cached = JSON.parse(raw) as Project;
        setProject(cached);
      }
    } catch {
      /* ignore */
    }
    void load();
  }, [load]);

  useEffect(() => {
    if (!project || !isProcessing(project.status)) return;
    const t = setInterval(() => void load(), 4000);
    return () => clearInterval(t);
  }, [project, load]);

  const grouped = useMemo(() => groupContents(project?.generated_contents), [project]);

  const allCrawlImageUrls = useMemo(() => {
    const urls: string[] = [];
    for (const p of project?.crawled_pages ?? []) {
      for (const img of p.images ?? []) {
        if (img.url) urls.push(img.url);
      }
    }
    return urls;
  }, [project]);

  async function doRegenerate(scope: "analysis" | "content" | "crawl") {
    if (!project) return;
    setRegen(scope);
    try {
      await api.regenerate(project.id, scope);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Regeneration failed.");
    } finally {
      setRegen(null);
    }
  }

  if (error && !project) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
        <Link href="/dashboard" className="mt-4 inline-block text-sm text-violet-600">
          ← Back
        </Link>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-200 border-t-violet-600 dark:border-zinc-700 dark:border-t-violet-400" />
      </div>
    );
  }

  const analysis = project.ai_analysis;
  const processing = isProcessing(project.status);

  return (
    <div className="mx-auto max-w-4xl space-y-10 pb-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/dashboard" className="text-sm font-medium text-violet-600 hover:text-violet-500 dark:text-violet-400">
            ← Projects
          </Link>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">{project.name}</h1>
          <p className="mt-1 break-all text-sm text-zinc-500 dark:text-zinc-400">{project.website_url}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge status={project.status} />
            {processing && (
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Refreshing every few seconds…</span>
            )}
          </div>
          {project.error_message && project.status === "failed" && (
            <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100">
              {project.error_message}
            </p>
          )}
          {error && (
            <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{error}</p>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Regenerate</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!!regen || processing}
              onClick={() => void doRegenerate("analysis")}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              {regen === "analysis" ? "Queueing…" : "Re-analyze (AI)"}
            </button>
            <button
              type="button"
              disabled={!!regen || processing}
              onClick={() => void doRegenerate("content")}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              {regen === "content" ? "Queueing…" : "Content only"}
            </button>
            <button
              type="button"
              disabled={!!regen || processing}
              onClick={() => void doRegenerate("crawl")}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              {regen === "crawl" ? "Queueing…" : "Re-crawl + AI"}
            </button>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Website info
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Crawled {project.crawled_pages?.length ?? 0} page(s). Render method shows whether raw HTML or Playwright was
          needed for text extraction.
        </p>
        <ul className="mt-4 space-y-3">
          {(project.crawled_pages ?? []).map((p) => (
            <li
              key={p.id}
              className="rounded-xl border border-zinc-100 bg-zinc-50/50 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950/50"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium capitalize text-zinc-800 dark:text-zinc-100">{p.page_type}</span>
                <span className="text-xs text-zinc-500">{p.render_method}</span>
              </div>
              <p className="mt-1 break-all text-xs text-violet-600 dark:text-violet-400">{p.url}</p>
              {p.title && <p className="mt-1 text-xs text-zinc-500">{p.title}</p>}
              {p.images && p.images.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.images.slice(0, 8).map((img, idx) => (
                    <a
                      key={`${p.id}-img-${idx}`}
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 w-8 shrink-0 overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800"
                      title={img.kind}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt="" className="h-full w-full object-cover" loading="lazy" />
                    </a>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      {analysis && (
        <section className="space-y-6 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Business understanding
            </h2>
            <CopyButton
              text={[
                analysis.business_summary,
                analysis.target_audience,
                analysis.brand_tone,
                (analysis.unique_selling_points ?? []).join("\n"),
                (analysis.marketing_angles ?? []).join("\n"),
                (analysis.content_pillars ?? []).join("\n"),
              ]
                .filter(Boolean)
                .join("\n\n")}
            />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-xs font-semibold text-zinc-500">Summary</h3>
              <p className="mt-1 text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
                {analysis.business_summary || "—"}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-zinc-500">Target audience</h3>
              <p className="mt-1 text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
                {analysis.target_audience || "—"}
              </p>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-xs font-semibold text-zinc-500">Brand tone</h3>
              <p className="mt-1 text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
                {analysis.brand_tone || "—"}
              </p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <ListBlock title="Unique selling points" items={analysis.unique_selling_points ?? []} />
            <ListBlock title="Marketing angles" items={analysis.marketing_angles ?? []} />
            <ListBlock title="Content pillars" items={analysis.content_pillars ?? []} />
          </div>
        </section>
      )}

      <ContentSection
        title="Content ideas"
        description="Twenty concepts mapped to formats and angles."
        items={grouped.content_idea}
      />
      <ContentSection
        title="Social posts"
        description="Ten scroll-stopping post shells."
        items={grouped.social_post}
        shareContext={
          project
            ? { pageUrl: project.website_url, imageUrls: allCrawlImageUrls }
            : undefined
        }
      />
      <ContentSection title="Ad copy" description="Five paid social / search style variations." items={grouped.ad_copy} />
      <ContentSection title="Blog ideas" description="Five SEO-friendly article seeds." items={grouped.blog_idea} />
      <ContentSection
        title="Homepage suggestions"
        description="Three high-impact improvements with rationale."
        items={grouped.homepage_suggestion}
      />
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-zinc-500">{title}</h3>
      <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-zinc-700 dark:text-zinc-200">
        {items.length === 0 && <li className="list-none text-zinc-400">—</li>}
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ContentSection({
  title,
  description,
  items,
  shareContext,
}: {
  title: string;
  description: string;
  items: GeneratedContent[] | undefined;
  shareContext?: { pageUrl: string; imageUrl?: string; imageUrls?: string[] };
}) {
  if (!items?.length) return null;
  return (
    <section className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{title}</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
        </div>
        <CopyButton
          label="Copy section"
          text={items.map((g) => `## ${g.title ?? "Item"}\n${g.content}`).join("\n\n---\n\n")}
        />
      </div>
      <ul className="mt-5 space-y-4">
        {items.map((g) => (
          <li key={g.id} className="rounded-xl border border-zinc-100 bg-zinc-50/40 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{g.title ?? "Untitled"}</h3>
              <CopyButton text={g.content} label="Copy" />
            </div>
            <pre className="mt-2 whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
              {g.content}
            </pre>
            {shareContext && (
              <ShareToolbar
                body={g.content}
                pageUrl={shareContext.pageUrl}
                imageUrls={shareContext.imageUrls}
                imageUrl={shareContext.imageUrl}
                platformHint={g.title ?? "Post"}
              />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
