"use client";

import { useState } from "react";
import { ApiError, api } from "@/lib/api-client";
import { CopyButton } from "@/components/ui/copy-button";
import type { SocialTemplatesPack } from "@/types/social-templates";
import {
  formatInstagramBlock,
  formatTiktokBlock,
  formatYoutubeBlock,
} from "@/types/social-templates";
import { ShareToolbar } from "@/components/social/share-toolbar";

type PlatformCard = {
  id: string;
  title: string;
  subtitle: string;
  body: string;
};

function buildCards(data: SocialTemplatesPack): PlatformCard[] {
  const cards: PlatformCard[] = [];

  if (data.instagram) {
    const ig = data.instagram;
    cards.push({
      id: "instagram",
      title: "Instagram",
      subtitle: "Feed / Reels caption + hashtags",
      body: formatInstagramBlock(ig),
    });
  }

  if (data.facebook?.post) {
    cards.push({
      id: "facebook",
      title: "Facebook",
      subtitle: "Page or profile post",
      body: data.facebook.post,
    });
  }

  if (data.linkedin?.post) {
    cards.push({
      id: "linkedin",
      title: "LinkedIn",
      subtitle: "Professional post",
      body: data.linkedin.post,
    });
  }

  if (data.x_twitter) {
    const x = data.x_twitter;
    const parts = [x.tweet, x.reply_hook].filter(Boolean);
    cards.push({
      id: "x_twitter",
      title: "X (Twitter)",
      subtitle: "Main post (+ optional reply)",
      body: parts.join("\n\n—\n\n"),
    });
  }

  if (data.threads?.post) {
    cards.push({
      id: "threads",
      title: "Threads",
      subtitle: "Meta Threads",
      body: data.threads.post,
    });
  }

  if (data.tiktok) {
    cards.push({
      id: "tiktok",
      title: "TikTok",
      subtitle: "On-screen hook + caption",
      body: formatTiktokBlock(data.tiktok),
    });
  }

  if (data.pinterest?.title || data.pinterest?.description) {
    const p = data.pinterest;
    cards.push({
      id: "pinterest",
      title: "Pinterest",
      subtitle: "Pin title + description",
      body: [p.title, p.description].filter(Boolean).join("\n\n"),
    });
  }

  if (data.youtube_shorts) {
    cards.push({
      id: "youtube_shorts",
      title: "YouTube Shorts",
      subtitle: "Title, description, tags",
      body: formatYoutubeBlock(data.youtube_shorts),
    });
  }

  return cards.filter((c) => c.body.trim() !== "");
}

export default function SocialTemplatesPage() {
  const [url, setUrl] = useState("");
  const [itemLabel, setItemLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [audience, setAudience] = useState("general");
  const [contentStyle, setContentStyle] = useState("balanced");
  const [discussionMode, setDiscussionMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pack, setPack] = useState<SocialTemplatesPack | null>(null);

  function buildNotesPayload(): string | undefined {
    const segments: string[] = [];
    if (notes.trim()) segments.push(notes.trim());
    segments.push(`Target audience: ${audience}.`);
    segments.push(`Content style: ${contentStyle}.`);
    if (discussionMode) {
      segments.push(
        "Add discussion-focused hooks and end each platform post with one audience-specific question to increase comments.",
      );
    }
    const combined = segments.join("\n");
    return combined.trim() || undefined;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPack(null);
    setLoading(true);
    try {
      const res = await api.socialTemplates({
        url,
        item_label: itemLabel.trim() || undefined,
        notes: buildNotesPayload(),
      });
      setPack(res.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const cards = pack ? buildCards(pack) : [];
  const copyAll =
    cards.length > 0
      ? cards.map((c) => `## ${c.title}\n${c.body}`).join("\n\n━━━━━━━━━━━━━━━━\n\n")
      : "";
  const templateImageUrls = pack?.images?.map((i) => i.url).filter((u): u is string => Boolean(u));

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Social media templates</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Paste a <strong className="font-medium text-zinc-700 dark:text-zinc-300">product or page URL</strong>. We read
          the page, pull <strong className="font-medium text-zinc-700 dark:text-zinc-300">images</strong> (Open Graph,
          Twitter cards, and key <code className="text-xs">img</code> tags), then generate copy plus share links.{" "}
          <span className="text-zinc-600 dark:text-zinc-300">
            Instagram has no web “prefill” URL — use the Instagram button to copy caption + link for the app.
          </span>
        </p>
      </div>

      <form
        onSubmit={(e) => void onSubmit(e)}
        className="space-y-4 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60"
      >
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="st-url" className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Page or product URL
          </label>
          <input
            id="st-url"
            type="text"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://yoursite.com/products/item"
            className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-violet-500/30 focus:border-violet-500 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div>
          <label htmlFor="st-label" className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Item name (optional)
          </label>
          <input
            id="st-label"
            type="text"
            value={itemLabel}
            onChange={(e) => setItemLabel(e.target.value)}
            placeholder="e.g. Wireless earbuds — helps the AI stay specific"
            className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-violet-500/30 focus:border-violet-500 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div>
          <label htmlFor="st-notes" className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Extra notes (optional)
          </label>
          <textarea
            id="st-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tone, promo code, audience, language…"
            className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-violet-500/30 focus:border-violet-500 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="st-audience" className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Target audience
            </label>
            <select
              id="st-audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-violet-500/30 focus:border-violet-500 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="general">General audience</option>
              <option value="students">Students</option>
              <option value="gamers">Gamers</option>
              <option value="engineers">Engineers</option>
            </select>
          </div>
          <div>
            <label htmlFor="st-style" className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Content style
            </label>
            <select
              id="st-style"
              value={contentStyle}
              onChange={(e) => setContentStyle(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-violet-500/30 focus:border-violet-500 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="balanced">Balanced</option>
              <option value="educational">Educational</option>
              <option value="promotional">Promotional</option>
              <option value="discussion-focused">Discussion-focused</option>
            </select>
          </div>
        </div>
        <label className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-200">
          <input
            type="checkbox"
            checked={discussionMode}
            onChange={(e) => setDiscussionMode(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-violet-600 focus:ring-violet-500 dark:border-zinc-600"
          />
          <span>
            Add discussion prompts for comments (for example, "Do you agree?" or "What is your experience?").
          </span>
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500 disabled:opacity-60"
        >
          {loading ? "Generating…" : "Generate templates"}
        </button>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Rate limit: about 20 requests per minute. Heavy pages use the same crawl path as full projects (HTTP first,
          Playwright if needed).
        </p>
      </form>

      {pack && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              Source:{" "}
              <a
                href={pack.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all font-medium text-violet-600 hover:underline dark:text-violet-400"
              >
                {pack.source_url}
              </a>
            </p>
            {copyAll && <CopyButton label="Copy all platforms" text={copyAll} />}
          </div>

          {pack.images && pack.images.length > 0 && (
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Images from page
              </h2>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                First image is used for Pinterest when the network allows hotlinking. Download images if a CDN blocks
                hotlinking.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {pack.images.map((img, i) => (
                  <a
                    key={`${img.url}-${i}`}
                    href={img.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800"
                    title={img.kind + (img.alt ? ` — ${img.alt}` : "")}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.alt ?? ""}
                      className="h-full w-full object-cover transition group-hover:opacity-90"
                      loading="lazy"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {cards.map((c) => (
              <section
                key={c.id}
                className="flex flex-col rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{c.title}</h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{c.subtitle}</p>
                  </div>
                  <CopyButton text={c.body} label="Copy" />
                </div>
                <pre className="mt-3 max-h-64 flex-1 overflow-auto whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
                  {c.body}
                </pre>
                <ShareToolbar
                  body={c.body}
                  pageUrl={pack.source_url}
                  imageUrls={templateImageUrls}
                  platformHint={c.title}
                />
              </section>
            ))}
          </div>

          {cards.length === 0 && (
            <p className="text-sm text-amber-700 dark:text-amber-300">
              The API returned no platform blocks. Try again or check the server response.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
